"use client"
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, FileIcon } from 'lucide-react';
import { Progress } from "@/components/ui/progress"

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadProgress {
  [key: string]: number;
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setSuccessMessage(null);
    
    // Check each file's size
    const oversizedFiles = acceptedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Files exceeding 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: undefined
      })
    );
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(file => file.name !== name));
    setError(null);
    setSuccessMessage(null);
  };

  const uploadFiles = async (files: File[]): Promise<void> => {
    const formData = new FormData();
    
    // Append all files with the same field name
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/upload', { 
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      return result;
    } catch (err) {
      throw err;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files to upload");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Set initial progress for all files
    files.forEach(file => {
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
    });

    try {
      const result = await uploadFiles(files);
      
      // Set completion progress for all files
      files.forEach(file => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
      });

      if (result.success) {
        setSuccessMessage(`Successfully uploaded ${files.length} file(s)`);
        setFiles([]);
      } else if (result.results && result.errors) {
        // Handle partial success
        results.successful = result.results.length;
        results.failed = result.errors.length;
        results.errors = result.errors.map(err => `${err.filename}: ${err.error}`);
        setError(`Partially successful upload:\n${results.errors.join('\n')}`);
      }
    } catch (err) {
      results.failed = files.length;
      results.errors.push(err instanceof Error ? err.message : 'Upload failed');
      setError(`Failed to upload files: ${results.errors.join('\n')}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 2000); // Clear progress after 2s
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    return <FileIcon className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Upload Documents</h1>
          
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">
              {isDragActive 
                ? "Drop files here" 
                : "Drag PDF or DOCX files, or click to upload"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Maximum file size: 10MB
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md whitespace-pre-line">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-md">
              {successMessage}
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-4 p-3 bg-white rounded border"
                >
                  {getFileIcon(file)}
                  
                  <div className="flex-1">
                    <div className="truncate">{file.name}</div>
                    {uploadProgress[file.name] !== undefined && (
                      <Progress 
                        value={uploadProgress[file.name]} 
                        className="h-1 mt-2"
                      />
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.name)}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button
                className="w-full mt-4"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}