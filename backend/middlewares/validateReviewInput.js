const VALID_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'go',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'html',
  'css',
  'sql',
]

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export const validateReviewInput = (req, res, next) => {
  const { code, language } = req.body || {}

  if (typeof code !== 'string' || code.trim() === '') {
    return next(createHttpError(400, 'Code is required'))
  }

  if (typeof language !== 'string' || !VALID_LANGUAGES.includes(language.trim().toLowerCase())) {
    return next(createHttpError(400, 'Language is invalid'))
  }

  req.body.code = code.trim()
  req.body.language = language.trim()
  next()
}
