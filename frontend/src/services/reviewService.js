import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 20000,
})

const languageMap = {
  cplusplus: 'cpp',
  'c++': 'cpp',
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
}

export const reviewCode = async ({ code, language, model, provider }) => {
  const rawLanguage = typeof language === 'string' ? language.trim() : ''
  const normalizedLanguage = languageMap[rawLanguage.toLowerCase()] || rawLanguage.toLowerCase()

  return api.post('/api/review', {
    code,
    language: normalizedLanguage,
    model,
    provider,
  })
}

export default api
