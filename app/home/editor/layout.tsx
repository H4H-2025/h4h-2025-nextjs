"use client"
import { useState, useEffect } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import Chat from '@/components/Chat'
import Editor from '@/components/Editor'
import { Save, Maximize2, Minimize2 } from 'lucide-react'

const MIN_CHAT_SIZE = 30
const MAX_CHAT_SIZE = 70

export default function ChatEditorLayout() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isEditorMaximized, setIsEditorMaximized] = useState(false)
  const [sizes, setSizes] = useState([70, 30])
  
  // Handle editor size states
  useEffect(() => {
    if (isEditorMaximized) {
      setSizes([20, 80])
    } else {
      setSizes([70, 30])
    }
  }, [isEditorMaximized])

  // Handle panel resizing
  const handleResize = (newSizes: number[]) => {
    // Ensure chat panel doesn't get too small
    if (newSizes[0] < MIN_CHAT_SIZE) {
      setSizes([MIN_CHAT_SIZE, 100 - MIN_CHAT_SIZE])
      return
    }
    // Ensure chat panel doesn't get too large
    if (newSizes[0] > MAX_CHAT_SIZE) {
      setSizes([MAX_CHAT_SIZE, 100 - MAX_CHAT_SIZE])
      return
    }
    setSizes(newSizes)
  }

  // Toggle editor visibility
  const toggleEditor = () => {
    setIsEditorOpen(!isEditorOpen)
    setIsEditorMaximized(false)
    setSizes([70, 30])
  }

  return (
    <div className="h-screen w-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Chat & Editor</h1>
        <div className="flex gap-2">
          {isEditorOpen && (
            <button
              onClick={() => setIsEditorMaximized(!isEditorMaximized)}
              className="p-2 rounded-md hover:bg-secondary"
              title={isEditorMaximized ? "Minimize Editor" : "Maximize Editor"}
            >
              {isEditorMaximized ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          )}
          <button
            onClick={toggleEditor}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {isEditorOpen ? 'Close Editor' : 'Open Editor'}
          </button>
        </div>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-4rem)]"
        onLayout={(sizes) => handleResize(sizes)}
      >
        <ResizablePanel
          defaultSize={sizes[0]}
          minSize={MIN_CHAT_SIZE}
          maxSize={MAX_CHAT_SIZE}
          className="p-4"
        >
          <div className="h-full rounded-lg border bg-card p-4 shadow-sm">
            <Chat />
          </div>
        </ResizablePanel>

        {isEditorOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={sizes[1]}
              minSize={100 - MAX_CHAT_SIZE}
              maxSize={100 - MIN_CHAT_SIZE}
              className="p-4"
            >
              <div className="h-full rounded-lg border bg-card p-4 shadow-sm">
                <Editor />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}