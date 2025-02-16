"use client"
import React from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function EditorPage() {
  const [content, setContent] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle content submission here
    console.log('Content submitted:', content);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-2xl font-bold">Editor</h1>
            
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px]"
              placeholder="Start typing..."
            />
            
            <div className="flex justify-end">
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}