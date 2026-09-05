import {
  CreateMLCEngine,
  prebuiltAppConfig,
  type ChatCompletionMessageParam,
  type InitProgressReport,
  type MLCEngine,
} from '@mlc-ai/web-llm'

// Verify this id against @mlc-ai/web-llm's current prebuiltAppConfig.model_list
// when upgrading the package — exact ids/quantizations change between releases.
const MODEL_ID = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC'

let enginePromise: Promise<MLCEngine> | null = null

export function loadEngine(onProgress: (report: InitProgressReport) => void): Promise<MLCEngine> {
  if (!enginePromise) {
    enginePromise = CreateMLCEngine(MODEL_ID, {
      initProgressCallback: onProgress,
      // WebLLM defaults to the browser's Cache Storage API, which rejects
      // Hugging Face's redirect-based file responses on Safari specifically
      // ("Cache.add() encountered a network error") — Chrome tolerates the
      // same redirects fine. IndexedDB stores the fetched bytes directly and
      // sidesteps the Cache API's redirect handling entirely.
      appConfig: { ...prebuiltAppConfig, cacheBackend: 'indexeddb' },
    })
  }
  return enginePromise
}

export async function generate(
  engine: MLCEngine,
  messages: ChatCompletionMessageParam[],
): Promise<string> {
  const completion = await engine.chat.completions.create({ messages })
  return completion.choices[0]?.message.content ?? ''
}
