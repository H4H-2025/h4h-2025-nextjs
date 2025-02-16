"use client";

import { useState, useEffect } from "react";

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
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        } catch (error) {
            setError(error.message);
        }
    };

    const handleFolderClick = async (folderId: string, folderName: string) => {
        setIsLoading(true);
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

            setSelectedFiles(data.files);
        } catch (error) {
            setError(error.message);
        } finally {
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

            {isLoading && (
                <div className="mt-4">
                    <p>Loading files...</p>
                </div>
            )}

            {selectedFiles.length > 0 && !isLoading && (
                <div className="mt-4 w-full max-w-md">
                    <h2 className="text-lg font-semibold mb-2">Files in selected folder:</h2>
                    <ul className="space-y-2">
                        {selectedFiles.map((file) => (
                            <li key={file.id} className="p-2 border rounded hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{file.name}</span>
                                    <div className="space-x-2">
                                        {file.viewLink && (
                                            <a
                                                href={file.viewLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-600 text-sm"
                                            >
                                                View
                                            </a>
                                        )}
                                        {file.downloadLink && (
                                            <a
                                                href={file.downloadLink}
                                                className="text-green-500 hover:text-green-600 text-sm"
                                            >
                                                Download
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    <div>{file.path}</div>
                                    <div>Type: {file.mimeType}</div>
                                    {file.size && (
                                        <div>Size: {Math.round(parseInt(file.size) / 1024)} KB</div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}