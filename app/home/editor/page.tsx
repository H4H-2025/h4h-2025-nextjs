"use client";
import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Save, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface SearchResponse {
  chunks: string[];
  summaries: string[];
  file_paths: string[];
}

const MIN_CHAT_SIZE = 30;
const MAX_CHAT_SIZE = 70;

interface ChatProps {
  messages: { 
    text: string; 
    sender: 'user' | 'system';
    filePath?: string;
    summary?: string;
  }[];
  onMessageSelect: (message: string, filePath?: string) => void;
}

const Chat = ({ messages, onMessageSelect }: ChatProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-180px)]"> {/* Adjust height to account for header and input */}
      <div className="flex flex-col space-y-4 p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
              <CardContent className="p-4 space-y-3">
                {message.sender === 'system' && (
                  <>
                    {/* Summary as main focus */}
                    {message.summary && (
                      <div className="text-base font-medium">
                        {message.summary}
                      </div>
                    )}
                    
                    {/* File path in muted color */}
                    {message.filePath && (
                      <div className="text-xs text-muted-foreground">
                        {message.filePath}
                      </div>
                    )}
                    
                    {/* Content in a collapsible section */}
                    <div className="text-sm border-t pt-2 mt-2 text-muted-foreground">
                      {message.text}
                    </div>
                    
                    <Button
                      onClick={() => onMessageSelect(message.text, message.filePath)}
                      variant="secondary"
                      size="sm"
                      className="w-full mt-2"
                    >
                      Use This Code
                    </Button>
                  </>
                )}
                {message.sender === 'user' && (
                  <div className="text-sm">{message.text}</div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default function EditorPage() {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'system'; filePath?: string; summary?: string }[]>([]);
  const [chunks, setChunks] = useState<string[]>([]);
  const [summaries, setSummaries] = useState<string[]>([]);
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [editorContent, setEditorContent] = useState<string>('');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [sizes, setSizes] = useState([70, 30]);
  const [activeChats, setActiveChats] = useState<Array<{
    chunk: string;
    summary: string;
    filePath: string;
    messages: Array<{ text: string; sender: 'user' | 'system' }>;
  }>>([]);

  const handleResize = (newSizes: number[]) => {
    if (newSizes[0] < MIN_CHAT_SIZE) {
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

  const handleSendMessage = async () => {
    if (currentMessage.trim()) {
      setMessages([{ text: currentMessage, sender: 'user' }]);
      
      try {
        const response = await fetch(`http://127.0.0.1:5000/submit_query?q=${encodeURIComponent(currentMessage)}`);
        
        if (!response.ok) {
          throw new Error('Failed to get response from API');
        }

        const data: SearchResponse = await response.json();
        
        // Create separate system messages for each chunk with formatted summary
        const systemMessages = data.chunks.map((chunk, index) => ({
          text: chunk,
          sender: 'system' as const,
          filePath: data.file_paths[index],
          // Ensure summary is properly capitalized and formatted
          summary: data.summaries[index].charAt(0).toUpperCase() + data.summaries[index].slice(1)
        }));

        setMessages([
          { text: currentMessage, sender: 'user' },
          ...systemMessages
        ]);

      } catch (error) {
        setMessages([
          { text: currentMessage, sender: 'user' },
          { text: 'Sorry, there was an error processing your request.', sender: 'system' }
        ]);
        console.error('Error:', error);
      }
      
      setCurrentMessage('');
    }
  };

  const handleMessageSelect = (message: string, filePath?: string) => {
    const formattedContent = `// From: ${filePath || 'Unknown source'}\n${message}\n\n`;
    setEditorContent((prevContent) => prevContent + formattedContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <div className="flex-none flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Chat & Editor</h1>
        <div className="flex gap-2">
          {isEditorOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditorMaximized(!isEditorMaximized)}
              title={isEditorMaximized ? 'Minimize Editor' : 'Maximize Editor'}
            >
              {isEditorMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={toggleEditor}
          >
            {isEditorOpen ? 'Close Editor' : 'Open Editor'}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 overflow-hidden"
        onLayout={(sizes) => handleResize(sizes)}
      >
        <ResizablePanel
          defaultSize={sizes[0]}
          minSize={MIN_CHAT_SIZE}
          maxSize={MAX_CHAT_SIZE}
          className="p-4 flex flex-col overflow-hidden"
        >
          <div className="flex-1 relative overflow-hidden">
            <Chat messages={messages} onMessageSelect={handleMessageSelect} />
          </div>

          <div className="flex-none gap-2 mt-4">
            <Input
              value={currentMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="I want to find..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              Send
            </Button>
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
              <Card className="h-full">
                <CardContent className="p-4 h-full">
                  <Textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Your data will appear here..."
                    className="h-full min-h-[300px] resize-none"
                  />
                </CardContent>
              </Card>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}