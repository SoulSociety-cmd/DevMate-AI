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

export const analyzeCodeWithGemini = async ({ code = '', language = 'javascript' }) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured.')
    error.statusCode = 500
    throw error
  }

  if (!code?.trim()) {
    const error = new Error('Code snippet is required for review.')
    error.statusCode = 400
    throw error
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    systemInstruction: `You are a senior code reviewer. Analyze the provided code and return ONLY a JSON object with this exact schema: { "score": number (0-100), "bugs": string[], "performance": string, "security": string, "suggestions": string[], "improvedCode": string }. Do not include markdown, explanations, or extra keys. Keep the content concise and actionable.`,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  })

  const prompt = `Language: ${language}\n\nCode:\n${code}`

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
    const cleanedText = stripMarkdownJson(rawText)

    let parsedPayload
    try {
      parsedPayload = JSON.parse(cleanedText)
    } catch (parseError) {
      const error = new Error(`Gemini returned invalid JSON: ${parseError.message}`)
      error.statusCode = 502
      throw error
    }

    return normalizeReviewPayload(parsedPayload)
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
