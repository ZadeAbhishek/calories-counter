import { useEffect, useRef, useState } from 'react'
import type { ChatCompletionMessageParam, MLCEngine } from '@mlc-ai/web-llm'
import { Button } from '@/components/ui/button'
import { generate, loadEngine } from '@/lib/buddy/webllmClient'
import {
  getVoicesAsync,
  pickVoicesByGender,
  speak,
  SpeechRecognitionController,
  type VoiceGender,
} from '@/lib/buddy/speech'

const SYSTEM_PROMPT: ChatCompletionMessageParam = {
  role: 'system',
  content: 'You are a friendly workout buddy. Keep replies to one short, casual sentence.',
}

// Temporary feasibility spike (see the Workout Buddy plan), intentionally
// shipped to production for real on-device testing. Answers: does the model
// load and run at a usable speed on this device, does continuous
// recognition survive silence gaps, and do TTS/STT/a concurrently playing
// sound coexist without fighting over the audio session. Delete this file
// once WorkoutBuddySession supersedes it.
export function BuddySpikeScreen({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState('Not started')
  const [progressText, setProgressText] = useState('')
  // Report the two hard platform requirements immediately on first render,
  // instead of finding out indirectly later.
  const [log, setLog] = useState<string[]>(() => {
    const hasWebGPU = 'gpu' in navigator
    const hasSpeechRecognition = Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
    return [
      hasWebGPU ? 'WebGPU: available' : '⚠️ WebGPU: NOT available on this browser/OS version',
      hasSpeechRecognition ? 'Speech recognition: available' : '⚠️ Speech recognition: NOT available',
    ]
  })
  const [gender, setGender] = useState<VoiceGender>('female')
  const [testToneOn, setTestToneOn] = useState(false)
  const [listening, setListening] = useState(false)

  const engineRef = useRef<MLCEngine | null>(null)
  const voicesRef = useRef<Record<VoiceGender, SpeechSynthesisVoice | null>>({
    male: null,
    female: null,
  })
  const recognitionRef = useRef<SpeechRecognitionController | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const historyRef = useRef<ChatCompletionMessageParam[]>([SYSTEM_PROMPT])
  const logContainerRef = useRef<HTMLDivElement>(null)

  function appendLog(line: string) {
    setLog((prev) => [...prev.slice(-24), line])
  }

  useEffect(() => {
    const container = logContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [log])

  async function handleLoadModel() {
    setStatus('Loading model...')
    const start = performance.now()
    try {
      const engine = await loadEngine((report) => setProgressText(report.text))
      engineRef.current = engine
      const loadSeconds = ((performance.now() - start) / 1000).toFixed(1)
      setStatus(`Model loaded in ${loadSeconds}s`)
    } catch (error) {
      setStatus('Model load failed')
      appendLog(`⚠️ Load error: ${error instanceof Error ? error.message : String(error)}`)
      return
    }

    const voices = await getVoicesAsync()
    voicesRef.current = pickVoicesByGender(voices)
    appendLog(
      `Voices: female="${voicesRef.current.female?.name ?? 'none'}", male="${voicesRef.current.male?.name ?? 'none'}" (${voices.length} total)`,
    )
  }

  async function handleTimeGeneration() {
    const engine = engineRef.current
    if (!engine) {
      appendLog('⚠️ Tap "1. Load model" first and wait for "Model loaded in..." before this will do anything')
      return
    }
    try {
      const start = performance.now()
      const reply = await generate(engine, [
        SYSTEM_PROMPT,
        { role: 'user', content: 'Say hello in one short sentence.' },
      ])
      const seconds = (performance.now() - start) / 1000
      const approxTokens = Math.max(1, Math.round(reply.split(/\s+/).length * 1.3))
      appendLog(`"${reply}" — ${seconds.toFixed(1)}s, ~${(approxTokens / seconds).toFixed(1)} tok/s est.`)
    } catch (error) {
      appendLog(`⚠️ Generation error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  function toggleTestTone() {
    if (testToneOn) {
      audioCtxRef.current?.close()
      audioCtxRef.current = null
      setTestToneOn(false)
      return
    }
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0.05
    osc.frequency.value = 220
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    audioCtxRef.current = ctx
    setTestToneOn(true)
  }

  function handleToggleListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setListening(false)
      setStatus('Stopped listening')
      return
    }

    recognitionRef.current = new SpeechRecognitionController(
      (transcript, isFinal) => {
        appendLog(`${isFinal ? 'FINAL' : 'interim'}: ${transcript}`)
        if (!isFinal) return
        void (async () => {
          const engine = engineRef.current
          if (!engine) {
            appendLog('⚠️ Heard you, but the model isn\'t loaded — tap "1. Load model" first')
            return
          }
          try {
            historyRef.current.push({ role: 'user', content: transcript })
            const reply = await generate(engine, historyRef.current)
            historyRef.current.push({ role: 'assistant', content: reply })
            appendLog(`Buddy: ${reply}`)
            await speak(reply, voicesRef.current[gender])
          } catch (error) {
            appendLog(`⚠️ Reply error: ${error instanceof Error ? error.message : String(error)}`)
          }
        })()
      },
      (error) => appendLog(`⚠️ Recognition error: ${error}`),
    )
    recognitionRef.current.start()
    setListening(true)
    setStatus('Listening...')
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto bg-background p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Buddy spike (dev only)</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{status}</p>
      {progressText && <p className="text-xs text-muted-foreground">{progressText}</p>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleLoadModel}>
          1. Load model
        </Button>
        <Button size="sm" onClick={handleTimeGeneration}>
          2. Time one generation
        </Button>
        <Button size="sm" variant={testToneOn ? 'default' : 'outline'} onClick={toggleTestTone}>
          3. Toggle test tone
        </Button>
        <Button size="sm" variant="outline" onClick={() => setGender((g) => (g === 'female' ? 'male' : 'female'))}>
          Voice: {gender}
        </Button>
        <Button size="sm" variant={listening ? 'default' : 'outline'} onClick={handleToggleListening}>
          4. {listening ? 'Stop listening' : 'Start listening'}
        </Button>
      </div>

      <div ref={logContainerRef} className="flex-1 overflow-y-auto rounded-lg border border-border p-2 text-xs">
        {log.map((line, i) => (
          <p key={i} className={line.startsWith('⚠️') ? 'font-medium text-destructive' : undefined}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
