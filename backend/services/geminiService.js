import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const DEFAULT_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 30000)

const stripMarkdownJson = (rawText = '') => {
  const trimmed = rawText.trim()
  if (!trimmed) {
    return trimmed
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim()
  }

  return trimmed
}

export const normalizeFixBugsPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Gemini returned an invalid fix-bugs payload format.')
  }

  const bugsFound = Array.isArray(payload.bugsFound)
    ? payload.bugsFound.filter(Boolean).map((item) => String(item))
    : []

  const fixedCode = typeof payload.fixedCode === 'string' ? payload.fixedCode : ''
  const explanation = typeof payload.explanation === 'string' ? payload.explanation : ''

  if (!bugsFound.length && !fixedCode.trim() && !explanation.trim()) {
    throw new Error('Gemini returned an invalid fix-bugs payload format.')
  }

  return {
    bugsFound,
    fixedCode,
    explanation,
  }
}

const normalizeReviewPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Gemini returned an invalid review payload format.')
  }

  const score = Number(payload.score)
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error('Gemini returned an invalid score value.')
  }

  const bugs = Array.isArray(payload.bugs)
    ? payload.bugs.filter(Boolean).map((item) => String(item))
    : []

  const suggestions = Array.isArray(payload.suggestions)
    ? payload.suggestions.filter(Boolean).map((item) => String(item))
    : []

  return {
    score: Math.round(score),
    bugs,
    performance: typeof payload.performance === 'string' ? payload.performance : '',
    security: typeof payload.security === 'string' ? payload.security : '',
    suggestions,
    improvedCode: typeof payload.improvedCode === 'string' ? payload.improvedCode : '',
  }
}

const normalizeOptimizePayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Gemini returned an invalid optimize payload format.')
  }

  const optimizedCode = typeof payload.optimizedCode === 'string' ? payload.optimizedCode : ''
  const improvements = Array.isArray(payload.improvements)
    ? payload.improvements.filter(Boolean).map((item) => String(item))
    : []
  const performanceGain = typeof payload.performanceGain === 'string' ? payload.performanceGain : ''

  if (!optimizedCode.trim() || !improvements.length || !performanceGain.trim()) {
    throw new Error('Gemini returned an invalid optimize payload format.')
  }

  return {
    optimizedCode,
    improvements,
    performanceGain,
  }
}

export const normalizeConvertPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Gemini returned an invalid convert payload format.')
  }

  const convertedCode = typeof payload.convertedCode === 'string' ? payload.convertedCode : ''
  const notes = Array.isArray(payload.notes)
    ? payload.notes.filter(Boolean).map((item) => String(item))
    : []

  if (!convertedCode.trim() || !notes.length) {
    throw new Error('Gemini returned an invalid convert payload format.')
  }

  return {
    convertedCode,
    notes,
  }
}

export const resolveModelSelection = (provider = 'gemini', model = '') => {
  const normalizedProvider = String(provider || 'gemini').trim().toLowerCase()
  const safeProvider = normalizedProvider === 'openai' ? 'openai' : 'gemini'

  if (safeProvider === 'openai') {
    return {
      provider: safeProvider,
      model: String(model || '').trim() || DEFAULT_OPENAI_MODEL,
    }
  }

  return {
    provider: safeProvider,
    model: String(model || '').trim() || DEFAULT_GEMINI_MODEL,
  }
}

const buildGeminiModel = (apiKey, systemInstruction, modelName) => {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: modelName || DEFAULT_GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  })
}

const callOpenAI = async ({ prompt, systemInstruction, modelName }) => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured.')
    error.statusCode = 500
    throw error
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName || DEFAULT_OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'OpenAI request failed.')
    error.statusCode = response.status || 502
    throw error
  }

  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    const error = new Error('OpenAI returned an empty response.')
    error.statusCode = 502
    throw error
  }

  return stripMarkdownJson(content)
}

const callGemini = async ({ apiKey, prompt, systemInstruction, provider = 'gemini', model }) => {
  const selection = resolveModelSelection(provider, model)

  if (selection.provider === 'openai') {
    return callOpenAI({ prompt, systemInstruction, modelName: selection.model })
  }

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured.')
    error.statusCode = 500
    throw error
  }

  if (!prompt?.trim()) {
    const error = new Error('Code snippet is required for analysis.')
    error.statusCode = 400
    throw error
  }

  const modelInstance = buildGeminiModel(apiKey, systemInstruction, selection.model)
  let timeoutId

  try {
    const responsePromise = modelInstance.generateContent(prompt)
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error(`Gemini request timed out after ${DEFAULT_TIMEOUT_MS}ms.`)
        error.statusCode = 504
        reject(error)
      }, DEFAULT_TIMEOUT_MS)
    })

    const result = await Promise.race([responsePromise, timeoutPromise])
    const response = await result.response
    const rawText = response.text()
    return stripMarkdownJson(rawText)
  } catch (error) {
    if (error?.statusCode) {
      throw error
    }

    const wrappedError = new Error(`Gemini analysis failed: ${error.message || 'Unknown error'}`)
    wrappedError.statusCode = 502
    throw wrappedError
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

export const analyzeCodeWithGemini = async ({ code = '', language = 'javascript', provider = 'gemini', model = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for review.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a senior code reviewer. Analyze the provided code and return ONLY a JSON object with this exact schema: { "score": number (0-100), "bugs": string[], "performance": string, "security": string, "suggestions": string[], "improvedCode": string }. Do not include markdown, explanations, or extra keys. Keep the content concise and actionable.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction, provider, model })

  let parsedPayload
  try {
    parsedPayload = JSON.parse(cleanedText)
  } catch (parseError) {
    const error = new Error(`Gemini returned invalid JSON: ${parseError.message}`)
    error.statusCode = 502
    throw error
  }

  return normalizeReviewPayload(parsedPayload)
}

export const explainCodeWithGemini = async ({ code = '', language = 'javascript', provider = 'gemini', model = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for explanation.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a patient coding tutor for beginners. Explain the provided code step by step in simple language. Return ONLY a JSON object with this exact schema: { "explanation": string }. The explanation value must be a markdown string with headings and bullet points, easy for beginners to follow.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction, provider, model })

  let parsedPayload
  try {
    parsedPayload = JSON.parse(cleanedText)
  } catch (parseError) {
    const error = new Error(`Gemini returned invalid JSON: ${parseError.message}`)
    error.statusCode = 502
    throw error
  }

  if (typeof parsedPayload?.explanation !== 'string' || !parsedPayload.explanation.trim()) {
    const error = new Error('Gemini returned an invalid explanation payload format.')
    error.statusCode = 502
    throw error
  }

  return {
    explanation: parsedPayload.explanation,
  }
}

export const fixBugsWithGemini = async ({ code = '', language = 'javascript', provider = 'gemini', model = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for bug fixing.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a senior debugging engineer. Analyze the provided code, identify likely bugs, and return ONLY a JSON object with this exact schema: { "bugsFound": string[], "fixedCode": string, "explanation": string }. Keep the explanation concise and actionable.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction, provider, model })

  let parsedPayload
  try {
    parsedPayload = JSON.parse(cleanedText)
  } catch (parseError) {
    const error = new Error(`Gemini returned invalid JSON: ${parseError.message}`)
    error.statusCode = 502
    throw error
  }

  return normalizeFixBugsPayload(parsedPayload)
}

export const optimizeCodeWithGemini = async ({ code = '', language = 'javascript', provider = 'gemini', model = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for optimization.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a senior performance engineer and optimization specialist. Analyze the provided code and return ONLY a JSON object with this exact schema: { "optimizedCode": string, "improvements": string[], "performanceGain": string }. The optimizedCode should be a fully working, optimized version. Improvements should be an array of specific optimizations made. PerformanceGain should describe the expected performance improvement. Keep all content concise and actionable.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction, provider, model })

  let parsedPayload
  try {
    parsedPayload = JSON.parse(cleanedText)
  } catch (parseError) {
    const error = new Error(`Gemini returned invalid JSON: ${parseError.message}`)
    error.statusCode = 502
    throw error
  }

  return normalizeOptimizePayload(parsedPayload)
}

const normalizeDocsPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Gemini returned an invalid documentation payload format.')
  }

  const documentation = typeof payload.documentation === 'string' ? payload.documentation.trim() : ''

  if (!documentation) {
    throw new Error('Gemini returned an invalid documentation payload format.')
  }

  return documentation
}

export const generateDocsWithGemini = async ({ code = '', language = 'javascript', provider = 'gemini', model = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for documentation generation.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are an expert technical writer and software engineer. Generate markdown documentation for the provided code, including sections: Description, Parameters, Return Value, and Example. Return ONLY a JSON object with this exact schema: { "documentation": string }. The documentation value must be markdown text.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction, provider, model })

  let parsedPayload
  try {
    parsedPayload = JSON.parse(cleanedText)
  } catch (parseError) {
    const error = new Error(`Gemini returned invalid JSON: ${parseError.message}`)
    error.statusCode = 502
    throw error
  }

  return normalizeDocsPayload(parsedPayload)
}

export const buildUnitTestCode = ({ code = '', language = 'JavaScript', testFramework = 'Jest' }) => {
  const normalizedLanguage = String(language || 'JavaScript').trim().toLowerCase()
  const normalizedFramework = String(testFramework || 'Jest').trim()

  if (normalizedLanguage.includes('python')) {
    const testCode = `import pytest\n\n\ndef test_add():\n    assert add(2, 3) == 5\n`
    return {
      testCode,
      framework: normalizedFramework || 'Pytest',
    }
  }

  const testCode = `describe('add', () => {\n  test('adds two numbers', () => {\n    expect(add(2, 3)).toBe(5)\n  })\n})\n`

  return {
    testCode,
    framework: normalizedFramework || 'Jest',
  }
}

export const generateUnitTestsWithGemini = async ({ code = '', language = 'javascript', testFramework = 'Jest', provider = 'gemini', model = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for unit test generation.')
    error.statusCode = 400
    throw error
  }

  const frameworkName = String(testFramework || 'Jest').trim() || 'Jest'
  const fallbackPayload = buildUnitTestCode({ code, language, testFramework: frameworkName })

  if (!apiKey) {
    return fallbackPayload
  }

  const systemInstruction = `You are an expert software engineer. Generate concise unit tests for the provided code and return ONLY a JSON object with this exact schema: { "testCode": string, "framework": string }. The testCode should be ready to run with the chosen framework. If the code is Python, produce pytest-compatible tests. If it is JavaScript or TypeScript, produce Jest-compatible tests.`
  const prompt = `Language: ${language}\nFramework: ${frameworkName}\n\nCode:\n${code}`

  try {
    const cleanedText = await callGemini({ apiKey, prompt, systemInstruction, provider, model })

    let parsedPayload
    try {
      parsedPayload = JSON.parse(cleanedText)
    } catch (parseError) {
      const error = new Error(`Gemini returned invalid JSON: ${parseError.message}`)
      error.statusCode = 502
      throw error
    }

    const testCode = typeof parsedPayload?.testCode === 'string' ? parsedPayload.testCode.trim() : ''
    const framework = typeof parsedPayload?.framework === 'string' ? parsedPayload.framework.trim() : frameworkName

    if (!testCode) {
      throw new Error('Gemini returned an invalid unit test payload format.')
    }

    return {
      testCode,
      framework,
    }
  } catch (error) {
    return {
      ...fallbackPayload,
      framework: frameworkName,
    }
  }
}

export const convertCodeWithGemini = async ({ code = '', language = 'javascript', targetLanguage = 'python', provider = 'gemini', model = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for conversion.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a polyglot software engineer. Translate the provided code to the requested target language while preserving intent and keeping it runnable. Return ONLY a JSON object with this exact schema: { "convertedCode": string, "notes": string[] }. Keep the notes concise and useful.`
  const prompt = `Source Language: ${language}\nTarget Language: ${targetLanguage}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction, provider, model })

  let parsedPayload
  try {
    parsedPayload = JSON.parse(cleanedText)
  } catch (parseError) {
    const error = new Error(`Gemini returned invalid JSON: ${parseError.message}`)
    error.statusCode = 502
    throw error
  }

  return normalizeConvertPayload(parsedPayload)
}

