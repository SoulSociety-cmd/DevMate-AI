import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 20000,
})

export const reviewCode = async ({ code, language }) => {
  const normalizedLanguage = typeof language === 'string' ? language.trim().toLowerCase() : ''

  return api.post('/api/review', {
    code,
    language: normalizedLanguage,
  })
}

export default api
