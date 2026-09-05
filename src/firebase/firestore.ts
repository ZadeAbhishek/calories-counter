import {
  collection,
  doc,
  type DocumentData,
  type FirestoreDataConverter,
  type PartialWithFieldValue,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Exercise } from '@/types/exercise'
import type { WorkoutLog } from '@/types/workoutLog'
import type { WorkoutPlanItem } from '@/types/workoutPlanItem'
import type { DailyLog } from '@/types/dailyLog'
import type { Targets } from '@/types/targets'
import type { NotificationSettings } from '@/types/notificationSettings'
import type { WorkoutSession } from '@/types/session'

/** For collections whose documents carry an `id` field derived from the doc
 * key itself (never stored, always attached from `snapshot.id` on read). */
function converterWithId<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: WithFieldValue<T>): DocumentData {
      const { id: _id, ...rest } = data as WithFieldValue<T> & { id: unknown }
      return rest as DocumentData
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): T {
      return { ...snapshot.data(options), id: snapshot.id } as T
    },
  }
}

/** For documents that don't need an `id` field (the doc key is already a
 * meaningful field, e.g. dailyLogs/{date}, or the doc is a fixed singleton).
 * Accepts the widest (Partial) write shape so both full `setDoc` and
 * `setDoc(..., { merge: true })` with a partial object type-check. */
function plainConverter<T>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: PartialWithFieldValue<T>): DocumentData {
      return data as DocumentData
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): T {
      return snapshot.data(options) as T
    },
  }
}

// Shared across every signed-in user — the one thing this app deliberately
// does NOT scope per-user, per the "workouts are common" design.
export const exercisesCol = collection(db, 'exercises').withConverter(
  converterWithId<Exercise>(),
)

// Everything else lives under users/{uid}/... , so these are functions of
// the current uid rather than module-level singletons — there's no "the"
// collection until you know which user's data you mean.
export function workoutLogsCol(uid: string) {
  return collection(db, 'users', uid, 'workoutLogs').withConverter(
    converterWithId<WorkoutLog>(),
  )
}

export function workoutPlanItemsCol(uid: string) {
  return collection(db, 'users', uid, 'workoutPlanItems').withConverter(
    converterWithId<WorkoutPlanItem>(),
  )
}

export function sessionsCol(uid: string) {
  return collection(db, 'users', uid, 'sessions').withConverter(
    converterWithId<WorkoutSession>(),
  )
}

export function dailyLogsCol(uid: string) {
  return collection(db, 'users', uid, 'dailyLogs').withConverter(
    plainConverter<DailyLog>(),
  )
}

export function targetsDocRef(uid: string) {
  return doc(db, 'users', uid, 'targets', 'current').withConverter(
    plainConverter<Targets>(),
  )
}

export function notificationSettingsDocRef(uid: string) {
  return doc(db, 'users', uid, 'notificationSettings', 'current').withConverter(
    plainConverter<NotificationSettings>(),
  )
}
