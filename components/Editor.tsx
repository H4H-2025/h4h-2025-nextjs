import React, { useState, useEffect } from 'react'

interface EditorProps {
  initialContent: string;  // Define the content prop
}

const Editor = ({ initialContent }: EditorProps) => {
  // State for content inside the editor (editable by user)
  const [content, setContent] = useState(initialContent);

  // Handle user input to update the editor's content
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }

  return (
    <div className="editor-container flex flex-col h-full">
      <h2 className="text-lg font-bold">Editor</h2>
      <textarea
        value={content}  // Display the content in a textarea
        onChange={handleChange}
        className="w-full h-full p-2 border rounded"
        placeholder="Your data will appear here..."
      />
    </div>
  )
}

export default Editor
