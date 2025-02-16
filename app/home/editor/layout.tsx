"use client";
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
      <div className="flex items-center justify-between p-4 border-b">
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

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1"
        onLayout={(sizes) => handleResize(sizes)}
      >
        {/* Chat Panel */}
        <ResizablePanel
          defaultSize={sizes[0]}
          minSize={MIN_CHAT_SIZE}
          maxSize={MAX_CHAT_SIZE}
          className="p-4 flex flex-col"
        >
          <div className="flex-1 overflow-auto space-y-2">
            {/* Using Chat Component */}
            <Chat messages={messages} onMessageSelect={handleMessageSelect} />
          </div>

          {/* Input Bar at the Bottom */}
          <div className="flex mt-4 space-x-2 mt-auto">
            <input
              type="text"
              value={currentMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="flex-1 p-2 border rounded-md"
              placeholder="I want to find..."
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Send
            </button>
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
              className="p-4"
            >
              <div className="h-full rounded-lg border bg-card p-4 shadow-sm">
                {/* Editor Content */}
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full h-full p-2 border rounded-md"
                  placeholder="Your data will appear here..."
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
