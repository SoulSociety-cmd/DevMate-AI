function ModelSelector({ value, onChange, disabled = false }) {
  const currentProvider = value?.provider || 'gemini'
  const currentModel = value?.model || (currentProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash')

  const handleProviderChange = (event) => {
    const provider = event.target.value
    const defaultModel = provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash'
    onChange?.({ provider, model: defaultModel })
  }

  const handleModelChange = (event) => {
    onChange?.({ provider: currentProvider, model: event.target.value })
  }

  return (
    <div className="convert-controls" style={{ marginBottom: '0.75rem' }}>
      <label className="convert-control">
        <span>AI Provider</span>
        <select value={currentProvider} onChange={handleProviderChange} disabled={disabled}>
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
      </label>

      <label className="convert-control">
        <span>Model</span>
        <input
          type="text"
          value={currentModel}
          onChange={handleModelChange}
          disabled={disabled}
          placeholder={currentProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash'}
        />
      </label>
    </div>
  )
}

export default ModelSelector
