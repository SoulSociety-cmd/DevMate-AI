import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const DEFAULT_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 30000)

const stripMarkdown = (rawText = '') => {
  const trimmed = rawText?.trim() || ''
  if (!trimmed) return trimmed
  // remove fenced blocks wrapping the assistant text if present
  const fencedMatch = trimmed.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/i)
  if (fencedMatch?.[1]) return fencedMatch[1].trim()
  return trimmed
}

const buildModel = (apiKey, systemInstruction) => {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    systemInstruction,
  })
}

const callModel = async ({ apiKey, prompt }) => {
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured.')
    error.statusCode = 500
    throw error
  }

  if (!prompt || !String(prompt).trim()) {
    const error = new Error('Prompt is empty.')
    error.statusCode = 400
    throw error
  }

  const model = buildModel(apiKey)
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
    return stripMarkdown(rawText)
  } catch (error) {
    if (error?.statusCode) throw error
    const wrapped = new Error(`Gemini chat failed: ${error.message || 'Unknown error'}`)
    wrapped.statusCode = 502
    throw wrapped
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export const chatWithGemini = async ({ messages = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY

  // If user provided a system role, use the first system message as system instruction
  const systemMsg = messages.find((m) => m.role === 'system')
  const systemInstruction = (systemMsg && String(systemMsg.content).trim()) || 'You are a helpful assistant.'

  // Build a single prompt by concatenating the conversation turns. Preserve roles.
  const promptParts = []
  for (const msg of messages) {
    const role = (msg.role || 'user').toLowerCase()
    const content = String(msg.content || '')
    if (!content.trim()) continue

    if (role === 'assistant') {
      promptParts.push(`Assistant: ${content}`)
    } else if (role === 'system') {
      // already used for systemInstruction; skip including it in the transcript
      continue
    } else {
      promptParts.push(`User: ${content}`)
    }
  }

  const prompt = `${promptParts.join('\n\n')}\n\nAssistant:`

  // call the model with systemInstruction and prompt
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL, systemInstruction })

  // use same pattern as callModel but using model.generateContent
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
    return stripMarkdown(rawText)
  } catch (error) {
    if (error?.statusCode) throw error
    const wrapped = new Error(`Gemini chat failed: ${error.message || 'Unknown error'}`)
    wrapped.statusCode = 502
    throw wrapped
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}
