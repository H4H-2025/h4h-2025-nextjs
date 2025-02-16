"use client";

import { useState, useEffect } from "react";
import FolderUpload from '../components/FolderUpload';

interface File {
    id: string;
    name: string;
    path: string;
    mimeType: string;
    viewLink?: string;
    size?: string;
    properties?: {
        uploadedByApp?: string;
    };
}

interface Folder {
    id: string;
    name: string;
    modifiedTime: string;
}

interface FileResponse {
    accessibleFiles: File[];
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
    const router = useRouter();  // Add this hook
    const [folders, setFolders] = useState<Folder[]>([]);
    const [fileResults, setFileResults] = useState<FileResponse | null>(null);
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
        setError(null);
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
        } catch (error) {
            setError(error.message);
            setEmbedding(false);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-xl font-bold mb-4">Your Google Drive Folders</h1>
            
            <FolderUpload 
                onUploadStart={() => setIsLoading(true)}
                onUploadComplete={() => {
                    setIsLoading(false);
                    fetchFolders(); // Refresh the folder list
                }}
                onError={(error) => {
                    setError(error);
                    setIsLoading(false);
                }}
            />

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


            {isLoading && (
                <div className="mt-4">
                    <p>Loading files...</p>
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

                    {fileResults && !isLoading && fileResults.accessibleFiles.length === 0 && (
                        <div className="mt-4 text-gray-500">
                            No files uploaded through this app found in this folder.
                            Use the upload area above to add files.
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
}