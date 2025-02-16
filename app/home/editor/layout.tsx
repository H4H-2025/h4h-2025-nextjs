"use client";
import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Save, Maximize2, Minimize2, FileText } from "lucide-react";
import Chat from "@/components/Chat";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const MIN_CHAT_SIZE = 30;
const MAX_CHAT_SIZE = 70;

export default function ChatEditorLayout() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "system" }[]>([]);
  const [editorContent, setEditorContent] = useState<string>("");
  const [currentMessage, setCurrentMessage] = useState<string>("");
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
      setMessages([...messages, { text: currentMessage, sender: "user" }]);
      setCurrentMessage("");
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "This is an example response created by the AI", sender: "system" },
      ]);
    }
  };

  const handleMessageSelect = (message: string) => {
    setEditorContent((prevContent) => prevContent + "\n" + message);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleString();

    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}\n\nCompiled Data:\n\n`, 10, 10);
    doc.text(editorContent, 10, 20);

    doc.save("compile-data.pdf");
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white shadow-lg border-b">
        <h1 className="text-2xl font-semibold text-gray-800">Chat & Editor</h1>
        <div className="flex gap-4">
          <Button onClick={toggleEditor} className="bg-blue-600 text-white hover:bg-blue-700">
            {isEditorOpen ? "Close Editor" : "Open Editor"}
          </Button>
        </div>
      </div>

      {/* Resizable Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1" onLayout={(sizes) => handleResize(sizes)}>
        {/* Chat Panel */}
        <ResizablePanel
          defaultSize={sizes[0]}
          minSize={MIN_CHAT_SIZE}
          maxSize={MAX_CHAT_SIZE}
          className="p-6 flex flex-col bg-white shadow-lg rounded-lg"
        >
          <div className="flex-1 overflow-auto space-y-4">
            {/* Chat Component */}
            <Chat messages={messages} onMessageSelect={handleMessageSelect} />
          </div>

          {/* Input Bar */}
          <div className="flex mt-4 space-x-4">
            <input
              type="text"
              value={currentMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="flex-1 p-4 border-2 rounded-md shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="I want to find..."
            />
            <Button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-md"
            >
              Send
            </Button>
          </div>
        </ResizablePanel>

        {/* Editor Panel */}
        {isEditorOpen && (
          <>
            <ResizableHandle />
            <ResizablePanel
              defaultSize={sizes[1]}
              minSize={100 - MAX_CHAT_SIZE}
              maxSize={100 - MIN_CHAT_SIZE}
              className="p-6 bg-white shadow-lg rounded-lg flex flex-col"
            >
              <Card className="h-full flex flex-col">
                <CardContent className="flex-1 p-6 flex flex-col">
                  {/* Editor Content */}
                  <Textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="flex-1 p-4 border-2 rounded-lg shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your data will appear here..."
                  />
                  <Button
                    onClick={downloadPDF}
                    className="mt-auto flex items-center gap-3 bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-md"
                  >
                    <FileText className="h-5 w-5" />
                    Create PDF
                  </Button>
                </CardContent>
              </Card>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
