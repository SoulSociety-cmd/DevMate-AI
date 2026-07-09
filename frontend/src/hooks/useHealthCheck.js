import { useEffect, useState } from 'react'
import { getHealth } from '../services/api.js'

export function useHealthCheck() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    getHealth()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'))
  }, [])

  return status
}
