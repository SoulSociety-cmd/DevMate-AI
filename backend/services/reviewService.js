export const generateMockReview = ({ code = '', language = 'javascript' }) => {
  const normalizedLanguage = language.trim().toLowerCase()
  const codeLower = code.toLowerCase()
  const codeLength = code.length

  const bugs = []
  if (codeLower.includes('console.log') || codeLower.includes('print(')) {
    bugs.push('Consider removing debug logs before production')
  }
  if (codeLower.includes('eval(') || codeLower.includes('innerhtml')) {
    bugs.push('Avoid dynamic execution and unsafe DOM usage')
  }
  if (bugs.length === 0) {
    bugs.push('No obvious bugs detected in the provided snippet')
  }

  const suggestions = [
    `Add comments for complex logic in ${normalizedLanguage}`,
    'Extract repeated logic into helper functions',
  ]

  return {
    score: Math.min(99, 75 + (codeLength % 20)),
    bugs,
    performance: codeLength > 400 ? 'Medium: the snippet is a bit long; consider simplifying it.' : 'Good: the logic is concise and maintainable.',
    security: /password|token|secret|api[_-]?key/i.test(code) ? 'Needs review: sensitive values may be present.' : 'Good: no obvious security issues were found.',
    suggestions,
    improvedCode: `// Mock review for ${normalizedLanguage}\n// Suggested improvements:\n// 1. Add input validation\n// 2. Split large functions into smaller helpers\n${code.trim() || 'function example() { return true; }'}`,
  }
}
