"use client"
import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Save, Maximize2, Minimize2 } from 'lucide-react';
import Chat from '@/components/Chat';

const MIN_CHAT_SIZE = 30;
const MAX_CHAT_SIZE = 70;

export default function ChatEditorLayout() {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'system' }[]>([]);
  const [editorContent, setEditorContent] = useState<string>('');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [sizes, setSizes] = useState([70, 30]);

  const handleResize = (newSizes: number[]) => {
    if (newSizes[0] < MIN_CHAT_SIZE) {
      setSizes([MIN_CHAT_SIZE, 100 - MIN_CHAT_SIZE]);
      return;
    }
    if (newSizes[0] > MAX_CHAT_SIZE) {
      setSizes([MAX_CHAT_SIZE, 100 - MAX_CHAT_SIZE]);
      return;
    }
    setSizes(newSizes);
  };

  const toggleEditor = () => {
    setIsEditorOpen(!isEditorOpen);
    setIsEditorMaximized(false);
    setSizes([70, 30]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      setMessages([...messages, { text: currentMessage, sender: 'user' }]);
      setCurrentMessage('');
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'This is an example response created by the AI', sender: 'system' },
      ]);
    }
  };

  const handleMessageSelect = (message: string) => {
    setEditorContent((prevContent) => prevContent + '\n' + message);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Fixed-height header */}
      <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b">
        <h1 className="text-xl font-bold">Chat & Editor</h1>
        <div className="flex gap-2">
          {isEditorOpen && (
            <button
              onClick={() => setIsEditorMaximized(!isEditorMaximized)}
              className="p-2 rounded-md hover:bg-secondary"
              title={isEditorMaximized ? 'Minimize Editor' : 'Maximize Editor'}
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

      {/* Main content area */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-max"
          onLayout={(sizes) => handleResize(sizes)}
        >
          {/* Chat Panel */}
          <ResizablePanel
            defaultSize={sizes[0]}
            minSize={MIN_CHAT_SIZE}
            maxSize={MAX_CHAT_SIZE}
            className="flex flex-col"
          >
            <div className="flex-1 min-h-0 overflow-hidden">
              <Chat messages={messages} onMessageSelect={handleMessageSelect} />
            </div>
          </ResizablePanel>

          {/* Editor Panel */}
          {isEditorOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={sizes[1]}
                minSize={100 - MAX_CHAT_SIZE}
                maxSize={100 - MIN_CHAT_SIZE}
                className="flex flex-col"
              >
                <div className="h-full p-4">
                  <div className="h-full rounded-lg border bg-card shadow-sm flex flex-col">
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      className="flex-1 w-full p-4 resize-none focus:outline-none rounded-lg"
                      placeholder="Your data will appear here..."
                    />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}