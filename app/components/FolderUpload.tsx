"use client";

import { useState, useRef, DragEvent } from 'react';

interface FolderUploadProps {
    onUploadStart?: () => void;
    onUploadComplete?: () => void;
    onError?: (error: string) => void;
    onCreateFolder?: (folderName: string) => void;
}

export default function FolderUpload({ onUploadStart, onUploadComplete, onError, onCreateFolder }: FolderUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Updated upload function: always create a new folder in drive for the current upload.
    const uploadToGoogleDrive = async (folderName: string, files: FileList) => {
        setIsUploading(true);
        setUploadError(null);
        try {
            // Always create a new folder for the upload session.
            const createFolderResponse = await fetch('/api/drive/createFolder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folderName }),
            });

            if (!createFolderResponse.ok) {
                throw new Error('Failed to create folder in Google Drive');
            }

            const { folderId } = await createFolderResponse.json();
            onCreateFolder?.(folderName);

            // Upload each file into the newly created folder.
            const totalFiles = files.length;
            let uploadedFiles = 0;

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                // Pass the folderId so the API can set it as the parent of the file.
                formData.append('folderId', folderId);
                formData.append('path', file.webkitRelativePath);

                const uploadResponse = await fetch('/api/drive/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                uploadedFiles++;
                setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100));
            }

            setIsUploading(false);
            onUploadComplete?.();
            setUploadProgress(0);
        } catch (error: any) {
            setUploadError(error.message);
            onError?.(error.message);
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        const items = Array.from(e.dataTransfer.items);
        const folderEntry = items[0].webkitGetAsEntry();

        if (!folderEntry?.isDirectory) {
            onError?.('Please drop a folder');
            return;
        }

        onUploadStart?.();
        await processDirectory(folderEntry as FileSystemDirectoryEntry, folderEntry.name);
    };

    const processDirectory = async (directoryEntry: FileSystemDirectoryEntry, folderName: string) => {
        const files: File[] = [];
        
        const readEntries = async (entry: FileSystemDirectoryEntry): Promise<void> => {
            const reader = entry.createReader();
            const entries = await new Promise<FileSystemEntry[]>((resolve) => {
                reader.readEntries(resolve);
            });

            for (const entry of entries) {
                if (entry.isFile) {
                    const file = await new Promise<File>((resolve) => {
                        (entry as FileSystemFileEntry).file(resolve);
                    });
                    files.push(file);
                } else if (entry.isDirectory) {
                    await readEntries(entry as FileSystemDirectoryEntry);
                }
            }
        };

        await readEntries(directoryEntry);
        // Creating a FileList-like object from the array of files.
        const fileList = {
            length: files.length,
            item: (index: number) => files[index],
            ...files
        } as unknown as FileList;
        await uploadToGoogleDrive(folderName, fileList);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        // Get folder name from the first file's path.
        const folderPath = files[0].webkitRelativePath;
        const folderName = folderPath.split('/')[0];

        onUploadStart?.();
        await uploadToGoogleDrive(folderName, files);
    };

    return (
        <div
            className={`mt-8 p-6 border-2 border-dashed rounded-lg 
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                transition-colors ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFileSelect}
                onClick={(e) => e.stopPropagation()} // Prevent double triggers
                disabled={isUploading}
            />
            <div className="text-center">
                <svg
                    className={`mx-auto h-12 w-12 ${isUploading ? 'text-blue-400' : 'text-gray-400'}`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                >
                    <path
                        d="M28 8H12a2 2 0 00-2 2v20m32-12v20a2 2 0 01-2 2H12a2 2 0 01-2-2V18m32 0H12"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <p className="mt-1 text-sm text-gray-600">
                    {isUploading 
                        ? 'Uploading folder...' 
                        : 'Drop a folder here or click to select'}
                </p>
            </div>
            
            {uploadProgress > 0 && (
                <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="mt-1 text-sm text-gray-600 text-center">
                        {uploadProgress}% uploaded
                    </p>
                </div>
            )}

            {uploadError && (
                <div className="mt-4 text-red-500 text-sm text-center">
                    {uploadError}
                </div>
            )}
        </div>
    );
}