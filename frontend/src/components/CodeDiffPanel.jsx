import ReactDiffViewer from 'react-diff-viewer-continued'
import { useTheme } from '../context/ThemeContext.jsx'

function CodeDiffPanel({ oldValue = '', newValue = '', title = 'Diff preview' }) {
  const { theme } = useTheme()

  if (!newValue?.trim()) {
    return null
  }

  return (
    <div className="result-card">
      <div className="result-card-header">
        <h3>{title}</h3>
      </div>
      <div className="diff-viewer-shell">
        <ReactDiffViewer
          oldValue={String(oldValue ?? '')}
          newValue={String(newValue ?? '')}
          splitView
          hideLineNumbers={false}
          useDarkTheme={theme === 'dark'}
        />
      </div>
    </div>
  )
}

export default CodeDiffPanel
