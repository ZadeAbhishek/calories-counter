import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from '@/firebase/config'

const LEGACY_COLLECTIONS = ['dailyLogs', 'workoutLogs', 'workoutPlanItems', 'sessions']
const LEGACY_SINGLETONS = ['targets', 'notificationSettings']

// Firestore caps a batch at 500 operations; each doc migrated here is a
// set + a delete, so chunk well under that regardless of how many
// operations end up queued.
const BATCH_CHUNK_SIZE = 200

type Op = { set: DocumentReference; data: DocumentData; del: DocumentReference }

async function commitInChunks(ops: Op[]) {
  for (let i = 0; i < ops.length; i += BATCH_CHUNK_SIZE) {
    const batch = writeBatch(db)
    for (const op of ops.slice(i, i + BATCH_CHUNK_SIZE)) {
      batch.set(op.set, op.data)
      batch.delete(op.del)
    }
    await batch.commit()
  }
}

/**
 * One-time migration from this app's original single-user data model (plain
 * top-level collections, e.g. `targets/current`) to the per-user model
 * (`users/{uid}/targets/current`). Runs on sign-in; a no-op once the user
 * already has data under their own uid, or if there's no legacy data at all.
 * Requires the temporary legacy read/write rules — see firestore.rules.
 */
export async function migrateLegacyDataIfNeeded(uid: string): Promise<boolean> {
  const alreadyMigrated = await getDoc(doc(db, 'users', uid, '_migration', 'status'))
  if (alreadyMigrated.exists()) return false

  const ops: Op[] = []

  for (const name of LEGACY_SINGLETONS) {
    const ref = doc(db, name, 'current')
    const snapshot = await getDoc(ref)
    if (snapshot.exists()) {
      ops.push({ set: doc(db, 'users', uid, name, 'current'), data: snapshot.data(), del: ref })
    }
  }

  for (const name of LEGACY_COLLECTIONS) {
    const snapshot = await getDocs(collection(db, name))
    for (const docSnapshot of snapshot.docs) {
      ops.push({
        set: doc(db, 'users', uid, name, docSnapshot.id),
        data: docSnapshot.data(),
        del: docSnapshot.ref,
      })
    }
  }

  if (ops.length > 0) {
    await commitInChunks(ops)
  }

  // Recorded even when there was nothing to copy, so a brand-new account
  // doesn't re-run this check (and re-query every legacy collection) on
  // every single sign-in.
  await setDoc(doc(db, 'users', uid, '_migration', 'status'), {
    migratedDocCount: ops.length,
    migratedAt: serverTimestamp(),
  })

  return ops.length > 0
}
