import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveModelSelection } from '../services/geminiService.js'

test('resolveModelSelection defaults to Gemini', () => {
  assert.deepEqual(resolveModelSelection(), {
    provider: 'gemini',
    model: 'gemini-2.0-flash',
  })
})

test('resolveModelSelection uses OpenAI when requested', () => {
  assert.deepEqual(resolveModelSelection('openai', 'gpt-4o-mini'), {
    provider: 'openai',
    model: 'gpt-4o-mini',
  })
})
