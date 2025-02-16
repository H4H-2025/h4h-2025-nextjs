"use client"
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from 'lucide-react';

interface FileWithPreview extends File {
  preview?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : undefined
      })
    );
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    }
  });

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(file => file.name !== name));
  };

  const handleUpload = () => {
    // Handle file upload here
    console.log('Files to upload:', files);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Upload Files</h1>
          
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">
              {isDragActive ? "Drop files here" : "Drag files or click to upload"}
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-4 p-3 bg-white rounded border"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt="Preview"
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs">{file.name.split('.').pop()}</span>
                    </div>
                  )}
                  
                  <span className="flex-1 truncate">{file.name}</span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.name)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button
                className="w-full mt-4"
                onClick={handleUpload}
              >
                Upload Files
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}