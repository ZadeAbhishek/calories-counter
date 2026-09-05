import {
  CreateMLCEngine,
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
    enginePromise = CreateMLCEngine(MODEL_ID, { initProgressCallback: onProgress })
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
