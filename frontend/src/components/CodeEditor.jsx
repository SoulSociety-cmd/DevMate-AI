import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Upload } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

const languageMap = {
  'C++': 'cpp',
  Python: 'python',
  Java: 'java',
  JavaScript: 'javascript',
}

const placeholders = {
  'C++': `#include <iostream>\n\nint main() {\n    std::cout << "Hello DevMate AI" << std::endl;\n    return 0;\n}`,
  Python: `def greet(name):\n    return f"Hello, {name}"\n\nprint(greet("DevMate AI"))`,
  Java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello DevMate AI");\n    }\n}`,
  JavaScript: `function greet(name) {\n  return \`Hello, \${name}\`;\n}\n\nconsole.log(greet('DevMate AI'))`,
}

function CodeEditor({ language = 'Python', value = '', onChange, disabled = false, onFileLoaded }) {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const [editorValue, setEditorValue] = useState(value)
  const editorRef = useRef(null)

  useEffect(() => {
    setEditorValue(value)
  }, [value, language])

  const handleChange = (nextValue) => {
    const safeValue = nextValue ?? ''
    setEditorValue(safeValue)
    onChange?.(safeValue)
  }

  const handleClear = () => {
    setEditorValue('')
    onChange?.('')
    editorRef.current?.focus()
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const allowedExtensions = ['.cpp', '.py', '.java', '.js']
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!allowedExtensions.includes(extension)) {
      window.alert('Only .cpp, .py, .java, and .js files are supported.')
      return
    }

    const text = await file.text()
    const nextValue = text || ''
    setEditorValue(nextValue)
    onChange?.(nextValue)
    onFileLoaded?.({ name: file.name, content: nextValue, language })
    event.target.value = ''
  }

  const handleMount = (editor) => {
    editorRef.current = editor
    editor.onDidFocusEditorText(() => setIsFocused(true))
    editor.onDidBlurEditorText(() => setIsFocused(false))
  }

  const monacoLanguage = languageMap[language] ?? 'plaintext'
  const placeholderText = placeholders[language] ?? placeholders.Python
  const shouldShowPlaceholder = !editorValue?.trim() && !isFocused

  return (
    <div className="code-editor-shell">
      <div className="editor-toolbar">
        <span>{language} Editor</span>
        <div className="editor-toolbar-actions">
          <label className="clear-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <Upload size={14} />
            <span>Upload</span>
            <input type="file" accept=".cpp,.py,.java,.js" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <span className="editor-pill">AI-ready</span>
          <button type="button" className="clear-button" onClick={handleClear} disabled={disabled}>
            Clear
          </button>
        </div>
      </div>

      <div className="editor-surface">
        <Editor
          height="420px"
          language={monacoLanguage}
          value={editorValue}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          onChange={handleChange}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            wordWrap: 'on',
            readOnly: disabled,
          }}
        />

        {shouldShowPlaceholder ? (
          <div className="editor-placeholder" aria-hidden="true">
            <pre>{placeholderText}</pre>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CodeEditor
