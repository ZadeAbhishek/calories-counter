export type TranscriptCallback = (transcript: string, isFinal: boolean) => void
export type RecognitionErrorCallback = (error: string) => void

// Wraps SpeechRecognition in "always on" mode: the browser stops recognition
// after every pause in speech (this is normal, not a failure), so this
// restarts automatically on `end` unless the caller explicitly called stop().
export class SpeechRecognitionController {
  private recognition: SpeechRecognition | null = null
  private stoppedByCaller = false
  private onTranscript: TranscriptCallback
  private onError: RecognitionErrorCallback

  constructor(onTranscript: TranscriptCallback, onError: RecognitionErrorCallback) {
    this.onTranscript = onTranscript
    this.onError = onError
  }

  start() {
    const Impl = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Impl) {
      this.onError('Speech recognition is not supported in this browser')
      return
    }

    this.stoppedByCaller = false
    const recognition = new Impl()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        this.onTranscript(result[0].transcript, result.isFinal)
      }
    }

    recognition.onerror = (event) => {
      // "no-speech"/"aborted" are routine (silence, or our own restart) — the
      // `onend` handler below restarts recognition, no need to surface these.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        this.onError(event.error)
      }
    }

    recognition.onend = () => {
      if (!this.stoppedByCaller) {
        recognition.start()
      }
    }

    this.recognition = recognition
    recognition.start()
  }

  stop() {
    this.stoppedByCaller = true
    this.recognition?.stop()
    this.recognition = null
  }
}

export function speak(text: string, voice: SpeechSynthesisVoice | null): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    if (voice) utterance.voice = voice
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    window.speechSynthesis.speak(utterance)
  })
}

export function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices()
    if (existing.length > 0) {
      resolve(existing)
      return
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices())
    }
  })
}

export type VoiceGender = 'male' | 'female'

// Web Speech API has no gender field, so this is a best-effort guess from
// common voice names (mostly Apple's) — verify against the real on-device
// list and adjust this table if it misclassifies.
const FEMALE_NAME_HINTS = [
  'samantha', 'ava', 'allison', 'susan', 'karen', 'moira', 'tessa', 'veena',
  'fiona', 'victoria', 'zoe', 'nicky', 'female',
]
const MALE_NAME_HINTS = [
  'alex', 'aaron', 'arthur', 'daniel', 'fred', 'gordon', 'lee', 'oliver',
  'tom', 'rocko', 'eddy', 'male',
]

export function pickVoicesByGender(
  voices: SpeechSynthesisVoice[],
): Record<VoiceGender, SpeechSynthesisVoice | null> {
  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  const pool = englishVoices.length > 0 ? englishVoices : voices

  function findByHints(hints: string[]) {
    return pool.find((v) => hints.some((hint) => v.name.toLowerCase().includes(hint))) ?? null
  }

  const female = findByHints(FEMALE_NAME_HINTS)
  const male = findByHints(MALE_NAME_HINTS)

  return {
    female: female ?? pool[0] ?? null,
    male: male ?? pool.find((v) => v !== female) ?? pool[0] ?? null,
  }
}
