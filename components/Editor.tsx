import React, { useState } from "react";

interface EditorProps {
  initialContent: string; // Define the content prop
}

const Editor = ({ initialContent }: EditorProps) => {
  // State for content inside the editor (editable by user)
  const [content, setContent] = useState(initialContent);

  // Handle user input to update the editor's content
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="editor-container flex flex-col h-full px-6 py-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Editor</h2>
      <textarea
        value={content} // Display the content in a textarea
        onChange={handleChange}
        className="w-full h-full p-4 border-2 rounded-lg shadow-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Your data will appear here..."
      />
    </div>
  );
};

export default Editor;
