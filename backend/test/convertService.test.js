import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeConvertPayload } from '../services/geminiService.js'

test('normalizeConvertPayload maps Gemini output into the expected structure', () => {
  const result = normalizeConvertPayload({
    convertedCode: 'function greet(name) { return name }',
    notes: ['Kept the logic intact', 'Adjusted syntax for JavaScript'],
  })

  assert.deepEqual(result, {
    convertedCode: 'function greet(name) { return name }',
    notes: ['Kept the logic intact', 'Adjusted syntax for JavaScript'],
  })
})

test('normalizeConvertPayload rejects malformed payloads', () => {
  assert.throws(() => normalizeConvertPayload({ convertedCode: 42 }), /invalid convert payload/i)
})
