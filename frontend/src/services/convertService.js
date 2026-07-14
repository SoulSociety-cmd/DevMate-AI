import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 20000,
})

const languageMap = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  'c++': 'cpp',
  'c#': 'csharp',
}

export const convertCode = async ({ code, language, targetLanguage }) => {
  const sourceLanguage = typeof language === 'string' ? language.trim().toLowerCase() : ''
  const destinationLanguage = typeof targetLanguage === 'string' ? targetLanguage.trim().toLowerCase() : ''

  return api.post('/api/convert', {
    code,
    language: languageMap[sourceLanguage] || sourceLanguage,
    targetLanguage: languageMap[destinationLanguage] || destinationLanguage,
  })
}

export default api
