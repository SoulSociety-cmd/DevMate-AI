import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeFixBugsPayload } from '../services/geminiService.js'

test('normalizeFixBugsPayload maps Gemini output into the expected structure', () => {
  const result = normalizeFixBugsPayload({
    bugsFound: ['missing return', 'null reference'],
    fixedCode: 'function greet() { return "hi" }',
    explanation: 'Added a guard clause.'
  })

  assert.deepEqual(result, {
    bugsFound: ['missing return', 'null reference'],
    fixedCode: 'function greet() { return "hi" }',
    explanation: 'Added a guard clause.'
  })
})

test('normalizeFixBugsPayload rejects malformed payloads', () => {
  assert.throws(() => normalizeFixBugsPayload({ bugsFound: 'oops' }), /invalid fix-bugs payload/i)
})
