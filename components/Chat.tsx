"use client"
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Send, File, MessageSquare, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Message {
  text: string;
  sender: 'user' | 'system';
  citation?: string;
}

interface ChatProps {
  messages: Message[];
  onMessageSelect: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages: initialMessages, onMessageSelect }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
  
        const userMessage: Message = { text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
  
        try {
          const response = await fetch('http://127.0.0.1:5000/submit_query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              queries: [inputText]
            }),
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            throw new Error(data.message || data.error || 'Server error occurred');
          }
  
          if (data.results && data.results[0]) {
            const result = data.results[0];
            if (result.error) {
              throw new Error(result.error);
            }
            const summary = result.summary;
            const systemMessage: Message = {
              text: Array.isArray(summary) ? summary.join('\n\n') : summary,
              sender: 'system',
              citation: result.citation || undefined
            };
            setMessages(prev => [...prev, systemMessage]);
          }
        } catch (error) {
          console.error('Query error:', error);
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          setMessages(prev => [...prev, {
            text: `Error: ${errorMessage}`,
            sender: 'system'
          }]);
        } finally {
          setIsLoading(false);
          setInputText('');
        }
      };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
      formData.append('pathnames', file.name);
    });

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/embed_folder', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload files');

      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);

      const successMessage: Message = {
        text: `Successfully uploaded: ${fileNames.join(', ')}`,
        sender: 'system'
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        text: 'Sorry, there was an error uploading your files.',
        sender: 'system'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMessageClick = (message: Message) => {
    if (message.sender === 'system') {
      const newContent = message.citation 
        ? `${message.text}\n\nSource: ${message.citation}`
        : message.text;
      setEditorContent(prev => prev ? `${prev}\n\n${newContent}` : newContent);
    }
  };

  const clearEditor = () => {
    setEditorContent('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Chat Section */}
        <Card className="flex flex-col h-full">
          <CardContent className="flex-1 p-4 min-h-0">
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 min-h-0 h-[calc(100vh-200px)]">
                <div 
                  ref={scrollAreaRef}
                  className="space-y-4 pb-4 overflow-y-auto h-full"
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      onClick={() => onMessageSelect(message.text)}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <Card
                        className={`max-w-[85%] cursor-pointer transition-all hover:shadow-lg ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <CardContent className="p-3">
                          <p className="whitespace-pre-wrap">{message.text}</p>
                          {message.citation && (
                            <div className="mt-2 text-sm opacity-70">
                              Source: {message.citation}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 space-y-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.docx"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Upload size={16} />
                    Upload Files
                  </Button>
                  {uploadedFiles.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <File size={16} />
                      {uploadedFiles.length} file(s)
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    size="default"
                    className="flex items-center gap-2"
                  >
                    <Send size={16} />
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Section */}
        <Card className="flex flex-col h-full">
          <CardContent className="p-4 flex-1 min-h-0">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare size={20} />
                  Editor
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditorContent('')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full h-full p-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Click on messages to add them here..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;