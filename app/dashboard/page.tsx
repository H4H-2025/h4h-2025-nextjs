"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";  // Add this import

interface File {
    id: string;
    name: string;
    path: string;
    mimeType: string;
    viewLink: string;
    downloadLink?: string;
    size?: string;
}

interface Folder {
    id: string;
    name: string;
    modifiedTime: string;
}

export default function DashboardPage() {
    const router = useRouter();  // Add this hook
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [embedding, setEmbedding] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        try {
            const response = await fetch('/api/folders');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch folders');
            }

            setFolders(data.folders);
        } catch (error: any) {
            setError(error.message);
        }
    };

    // Updated function to use the proxy endpoint
    const uploadFileStream = async (file: File) => {
        if (!file.downloadLink) return;
        // try {
        //     const proxyUrl = `/api/proxy?url=${encodeURIComponent(file.downloadLink)}`;
        //     const fileResponse = await fetch(proxyUrl, {
        //         credentials: 'include' // Include cookies and authentication headers
        //     });

        //     if (!fileResponse.ok) {
        //         throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
        //     }

        //     const fileBlob = await fileResponse.blob();
            
        //     // Rest of your upload code...
        //     // const url = new URL('http://127.0.0.1:5000/embed_folder');
        //     // url.searchParams.append('filename', file.name);
        //     // url.searchParams.append('type', file.mimeType);

        //     // const uploadResponse = await fetch(url.toString(), {
        //     //     method: 'POST',
        //     //     mode: 'no-cors',
        //     //     headers: {
        //     //         'Content-Type': file.mimeType || 'application/octet-stream',
        //     //     },
        //     //     body: fileBlob
        //     // });

        // } catch (err: any) {
        //     console.error('Upload error:', err);
        //     setError(err.message);
        // }
    };

    const handleFolderClick = async (folderId: string, folderName: string) => {
        setIsLoading(true);
        setEmbedding(true);
        setProgress(0);

        try {
            const response = await fetch('/api/files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folderId, folderName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch files');
            }

            // Start the progress timer
            const duration = 20000; // 20 seconds
            const interval = 100; // Update every 100ms
            const steps = duration / interval;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                const newProgress = Math.min((currentStep / steps) * 100, 100);
                setProgress(newProgress);

                if (currentStep >= steps) {
                    clearInterval(timer);
                    setEmbedding(false);
                    setIsLoading(false);
                    router.push('/home/editor'); // Add navigation here
                }
            }, interval);

            // Process files in background
            data.files.forEach((file: File) => {
                if (file.downloadLink) {
                    uploadFileStream(file);
                }
            });
        } catch (error: any) {
            setError(error.message);
            setEmbedding(false);
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-xl font-bold mb-4">Your Google Drive Folders</h1>
            {folders && folders.length > 0 ? (
                <ul className="space-y-2 w-full max-w-md">
                    {folders.map((folder) => (
                        <li
                            key={folder.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                            onClick={() => handleFolderClick(folder.id, folder.name)}
                        >
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                    />
                                </svg>
                                {folder.name}
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(folder.modifiedTime).toLocaleDateString()}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No folders found</p>
            )}

            {embedding && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                        <h2 className="text-xl font-semibold mb-4">Embedding Files</h2>
                        <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-100"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="mt-2 text-gray-600">{Math.round(progress)}%</p>
                    </div>
                </div>
            )}
        </div>
    );
}