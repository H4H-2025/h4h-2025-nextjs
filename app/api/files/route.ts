import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import oauth2Client from "../../utils/google-auth";
import { Readable } from "stream";

interface FileResult {
    accessibleFiles: Array<{
        id: string;
        name: string;
        path: string;
        mimeType: string;
        size?: string;
    }>;
    inaccessibleFiles: Array<{
        name: string;
        path: string;
        reason: string;
    }>;
}

async function getAllFilesInFolder(drive: any, folderId: string, folderPath: string): Promise<FileResult> {
    const result: FileResult = {
        accessibleFiles: [],
        inaccessibleFiles: []
    };
    
    try {
        const response = await drive.files.list({
            auth: drive.auth,
            q: `'${folderId}' in parents and properties has { key='uploadedByApp' and value='true' }`,
            fields: "files(id, name, mimeType, size, capabilities, properties)",
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        for (const file of response.data.files || []) {
            const currentPath = `${folderPath}/${file.name}`;
            
            try {
                const fileMetadata = await drive.files.get({
                    fileId: file.id,
                    fields: 'capabilities'
                });

                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    const subResults = await getAllFilesInFolder(drive, file.id, currentPath);
                    result.accessibleFiles.push(...subResults.accessibleFiles);
                    result.inaccessibleFiles.push(...subResults.inaccessibleFiles);
                } else {
                    if (fileMetadata.data.capabilities?.canReadFile) {
                        try {
                            await streamFileToBackend(drive, file.id, {
                                id: file.id,
                                name: file.name,
                                path: currentPath,
                                mimeType: file.mimeType,
                                size: file.size
                            });
                            // Mark the file as uploaded by the app.
                            await drive.files.update({
                                fileId: file.id,
                                requestBody: {
                                    properties: {
                                        uploadedByApp: "true"
                                    }
                                },
                                fields: "id, properties"
                            });
                            result.accessibleFiles.push({
                                id: file.id,
                                name: file.name,
                                path: currentPath,
                                mimeType: file.mimeType,
                                size: file.size
                            });
                        } catch (streamError) {
                            result.inaccessibleFiles.push({
                                name: file.name,
                                path: currentPath,
                                reason: `Stream error: ${streamError.message}`
                            });
                        }
                    } else {
                        result.inaccessibleFiles.push({
                            name: file.name,
                            path: currentPath,
                            reason: 'No read permission'
                        });
                    }
                }
            } catch (accessError) {
                result.inaccessibleFiles.push({
                    name: file.name,
                    path: currentPath,
                    reason: `Access error: ${accessError.message}`
                });
            }
        }
    } catch (error) {
        console.error('Error fetching files:', error);
        throw error;
    }
    
    return result;
}

async function streamFileToBackend(drive: any, fileId: string, metadata: any) {
    try {
        // First check if we can access the file
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'capabilities'
        });

        if (!fileMetadata.data.capabilities?.canReadFile) {
            throw new Error('No read permission for this file');
        }

        // Get the file content as a readable stream
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, {
            responseType: 'stream'
        });

        // Convert the stream to chunks of data
        const chunks: Buffer[] = [];
        const fileStream = response.data;

        // Create form data with file metadata and content
        const formData = new FormData();
        formData.append('metadata', JSON.stringify(metadata));

        // Convert stream to blob
        const buffer = await new Promise<Buffer>((resolve, reject) => {
            fileStream.on('data', (chunk: Buffer) => chunks.push(chunk));
            fileStream.on('error', reject);
            fileStream.on('end', () => resolve(Buffer.concat(chunks)));
        });

        const blob = new Blob([buffer]);
        formData.append('file', blob, metadata.name);

        // Send to backend
        const backendResponse = await fetch(`${process.env.FLASK_BACKEND_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!backendResponse.ok) {
            throw new Error(`Backend upload failed: ${backendResponse.statusText}`);
        }

        return await backendResponse.json();
    } catch (error) {
        console.error('Stream error:', error);
        throw error;
    }
}

export async function POST(req: Request) {
    try {
        const { folderId, folderName } = await req.json();
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("google_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        oauth2Client.setCredentials({ 
            access_type: 'offline',
            access_token: accessToken,
            scope: [
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive.metadata.readonly'
            ].join(' ')
        });

        const drive = google.drive({ 
            version: 'v3',
            auth: oauth2Client
        });

        const results = await getAllFilesInFolder(drive, folderId, folderName);
        
        return NextResponse.json({
            accessibleFiles: results.accessibleFiles,
            inaccessibleFiles: results.inaccessibleFiles,
            summary: {
                totalFiles: results.accessibleFiles.length + results.inaccessibleFiles.length,
                accessibleCount: results.accessibleFiles.length,
                inaccessibleCount: results.inaccessibleFiles.length
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to fetch files",
                details: error.response?.data?.error || error
            }, 
            { status: 500 }
        );
    }
}