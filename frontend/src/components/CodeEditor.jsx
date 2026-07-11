import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'

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

function CodeEditor({ language = 'Python', value = '', onChange, theme = 'dark' }) {
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
          <span className="editor-pill">AI-ready</span>
          <button type="button" className="clear-button" onClick={handleClear}>
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
