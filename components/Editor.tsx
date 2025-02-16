// components/Editor.tsx
"use client"

import { useState, useEffect } from 'react'

export default function Editor() {
  const [content, setContent] = useState('')

  useEffect(() => {
    return () => {
      // Cleanup when editor is closed
    }
  }, [])

  return (
    <div className="p-4 h-full overflow-auto">
      <h2>Editor</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-full p-2 border"
        placeholder="Start typing..."
      />
    </div>
  )
}