"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

interface Folder {
    id: string;
    name: string;
    modifiedTime: string;
}

interface FileResponse {
    accessibleFiles: {
        id: string;
        name: string;
        path: string;
        size?: string;
    }[];
    inaccessibleFiles: {
        name: string;
        path: string;
        reason: string;
    }[];
    summary: {
        totalFiles: number;
        accessibleCount: number;
        inaccessibleCount: number;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [fileResults, setFileResults] = useState<FileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/folders');
            console.log('API Response:', response);
            const data = await response.json();
            console.log('Folders data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch folders');
            }

            setFolders(data.folders || []);
        } catch (error: any) {
            console.error('Error fetching folders:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFolderClick = async (folderId: string, folderName: string) => {
        setIsProcessing(true);
        setProgress(0);
        
        // Start the timer
        const startTime = Date.now();
        const duration = 10000; // 10 seconds
        
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);
            
            if (elapsed >= duration) {
                clearInterval(timer);
                router.push('/home/editor');
            }
        }, 100);

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

            setFileResults(data);
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-6">Your Google Drive Folders</h1>
            
            {isProcessing && (
                <div className="w-full max-w-md mb-6">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                        Processing folder... {Math.round(progress)}%
                    </p>
                </div>
            )}

            {isLoading && (
                <div className="w-full max-w-md p-4 text-center">
                    <p className="text-gray-600">Loading...</p>
                </div>
            )}

            {folders && folders.length > 0 ? (
                <ul className="space-y-2 w-full max-w-md">
                    {folders.map((folder) => (
                        <li
                            key={folder.id}
                            className={`p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors ${
                                isProcessing ? 'pointer-events-none opacity-50' : ''
                            }`}
                            onClick={() => handleFolderClick(folder.id, folder.name)}
                        >
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 mr-3 text-gray-500"
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
                                <span className="font-medium">{folder.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(folder.modifiedTime).toLocaleDateString()}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No folders found in your Google Drive</p>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg max-w-md">
                    {error}
                </div>
            )}

            {fileResults && !isLoading && (
                <div className="mt-4 w-full max-w-md">
                    <h2 className="text-lg font-semibold mb-2">Files in selected folder:</h2>
                    <div className="mb-4 text-sm text-gray-600">
                        Summary: {fileResults.summary.accessibleCount} accessible, 
                        {fileResults.summary.inaccessibleCount} inaccessible
                    </div>
                    
                    {fileResults.accessibleFiles.length > 0 && (
                        <>
                            <h3 className="font-medium mb-2">Accessible Files:</h3>
                            <ul className="space-y-2">
                                {fileResults.accessibleFiles.map((file) => (
                                    <li key={file.id} className="p-2 border rounded hover:bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{file.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {file.size && `${Math.round(parseInt(file.size) / 1024)} KB`}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{file.path}</div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {fileResults.inaccessibleFiles.length > 0 && (
                        <>
                            <h3 className="font-medium mb-2 mt-4">Inaccessible Files:</h3>
                            <ul className="space-y-2">
                                {fileResults.inaccessibleFiles.map((file, index) => (
                                    <li key={index} className="p-2 border rounded bg-gray-50">
                                        <div className="text-sm text-red-600">{file.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{file.reason}</div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}