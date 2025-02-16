import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import oauth2Client from "../../utils/google-auth";

async function getAllFilesInFolder(drive: any, folderId: string, folderPath: string) {
    const files = [];
    
    try {
        const result = await drive.files.list({
            auth: oauth2Client,
            q: `'${folderId}' in parents`,
            // Add additional fields for file details
            fields: "files(id, name, mimeType, webViewLink, webContentLink, size)",
            pageSize: 1000,
        });

        for (const file of result.data.files || []) {
            const currentPath = `${folderPath}/${file.name}`;
            
            if (file.mimeType === 'application/vnd.google-apps.folder') {
                const subFiles = await getAllFilesInFolder(drive, file.id, currentPath);
                files.push(...subFiles);
            } else {
                files.push({
                    id: file.id,
                    name: file.name,
                    path: currentPath,
                    mimeType: file.mimeType,
                    viewLink: file.webViewLink,
                    downloadLink: file.webContentLink,
                    size: file.size
                });
            }
        }
    } catch (error) {
        console.error('Error fetching files:', error);
        throw error;
    }
    
    return files;
}

export async function POST(req: Request) {
    try {
        const { folderId, folderName } = await req.json();
        const cookieStore = cookies();
        const accessToken = cookieStore.get("google_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        oauth2Client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ 
            version: 'v3',
            auth: oauth2Client // Initialize drive with auth
        });

        const files = await getAllFilesInFolder(drive, folderId, folderName);
        return NextResponse.json({ files });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch files" }, 
            { status: 500 }
        );
    }
}