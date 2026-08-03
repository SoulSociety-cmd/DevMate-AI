import test from 'node:test'
import assert from 'node:assert/strict'
import { buildUnitTestCode } from '../services/geminiService.js'

test('buildUnitTestCode returns a Jest-style test for JavaScript', () => {
  const result = buildUnitTestCode({
    code: 'function add(a, b) { return a + b }',
    language: 'JavaScript',
    testFramework: 'Jest',
  })

  assert.equal(result.framework, 'Jest')
  assert.match(result.testCode, /describe\('add'/i)
  assert.match(result.testCode, /expect\(add\(2, 3\)\)\.toBe\(5\)/)
})

test('buildUnitTestCode returns a Pytest-style test for Python', () => {
  const result = buildUnitTestCode({
    code: 'def add(a, b):\n    return a + b',
    language: 'Python',
    testFramework: 'Pytest',
  })

  assert.equal(result.framework, 'Pytest')
  assert.match(result.testCode, /def test_add\(\):/)
  assert.match(result.testCode, /assert add\(2, 3\) == 5/)
})
