import api from './api.js'

export const generateTests = async (payload) => {
  const response = await api.post('/api/generate-tests', payload)
  return response.data
}
