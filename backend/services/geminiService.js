import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
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

const buildGeminiModel = (apiKey, systemInstruction) => {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    systemInstruction,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  })
}

const callGemini = async ({ apiKey, prompt, systemInstruction }) => {
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

  const model = buildGeminiModel(apiKey, systemInstruction)
  let timeoutId

  try {
    const responsePromise = model.generateContent(prompt)
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

export const analyzeCodeWithGemini = async ({ code = '', language = 'javascript' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for review.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a senior code reviewer. Analyze the provided code and return ONLY a JSON object with this exact schema: { "score": number (0-100), "bugs": string[], "performance": string, "security": string, "suggestions": string[], "improvedCode": string }. Do not include markdown, explanations, or extra keys. Keep the content concise and actionable.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction })

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

export const explainCodeWithGemini = async ({ code = '', language = 'javascript' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for explanation.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a patient coding tutor for beginners. Explain the provided code step by step in simple language. Return ONLY a JSON object with this exact schema: { "explanation": string }. The explanation value must be a markdown string with headings and bullet points, easy for beginners to follow.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction })

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

export const fixBugsWithGemini = async ({ code = '', language = 'javascript' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for bug fixing.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a senior debugging engineer. Analyze the provided code, identify likely bugs, and return ONLY a JSON object with this exact schema: { "bugsFound": string[], "fixedCode": string, "explanation": string }. Keep the explanation concise and actionable.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction })

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

export const optimizeCodeWithGemini = async ({ code = '', language = 'javascript' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for optimization.')
    error.statusCode = 400
    throw error
  }

  const systemInstruction = `You are a senior performance engineer and optimization specialist. Analyze the provided code and return ONLY a JSON object with this exact schema: { "optimizedCode": string, "improvements": string[], "performanceGain": string }. The optimizedCode should be a fully working, optimized version. Improvements should be an array of specific optimizations made. PerformanceGain should describe the expected performance improvement. Keep all content concise and actionable.`
  const prompt = `Language: ${language}\n\nCode:\n${code}`
  const cleanedText = await callGemini({ apiKey, prompt, systemInstruction })

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

