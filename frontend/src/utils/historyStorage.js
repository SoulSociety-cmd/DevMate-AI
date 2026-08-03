const HISTORY_KEY = 'devmate-ai-history'

const readHistory = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(HISTORY_KEY)
    return rawValue ? JSON.parse(rawValue) : []
  } catch {
    return []
  }
}

export const saveHistoryEntry = (entry) => {
  if (typeof window === 'undefined') {
    return []
  }

  const nextEntries = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    },
    ...readHistory(),
  ].slice(0, 12)

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextEntries))
  return nextEntries
}

export const getHistoryEntries = () => readHistory()
