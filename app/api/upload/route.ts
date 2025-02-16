import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import oauth2Client from "../../../utils/google-auth";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("google_access_token")?.value;
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        oauth2Client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        // Define the default folder name for app uploads.
        const defaultFolderName = "Uploaded Files";
        let parentId = 'root';

        // Look for an existing folder with the default name and uploadedByApp property.
        const folderListResponse = await drive.files.list({
            q: `mimeType = 'application/vnd.google-apps.folder' and trashed = false and name = '${defaultFolderName}' and properties has { key='uploadedByApp' and value='true' }`,
            fields: "files(id, name)",
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });
        const foldersFound = folderListResponse.data.files || [];

        if (foldersFound.length > 0) {
            parentId = foldersFound[0].id;
        } else {
            // Create the default folder if it doesn't exist.
            const newFolderResponse = await drive.files.create({
                requestBody: {
                    name: defaultFolderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    properties: {
                        uploadedByApp: "true"
                    }
                },
                fields: "id"
            });
            parentId = newFolderResponse.data.id;
        }

        const results = [];
        // Upload each file under the default folder.
        for (const file of files) {
            const fileMetadata = {
                name: file.name,
                parents: [parentId]
            };

            const media = {
                mimeType: file.type,
                body: file.stream()
            };

            const uploadResponse = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, name, webViewLink'
            });

            results.push(uploadResponse.data);
        }

        return NextResponse.json({ 
            message: 'Upload successful',
            files: results,
            folderId: parentId
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || "Upload failed" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // 1. Get and await cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("google_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "No access token" }, { status: 401 });
        }

        // 2. Set credentials with proper scope
        oauth2Client.setCredentials({
            access_token: accessToken,
            scope: 'https://www.googleapis.com/auth/drive.file'
        });

        // 3. Create drive instance with auth
        const drive = google.drive({
            version: "v3",
            auth: oauth2Client
        });

        // 4. Make the API call
        const response = await drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and properties has { key='uploadedByApp' and value='true' }",
            fields: "files(id, name, modifiedTime)",
            spaces: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        return NextResponse.json(response.data);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch folders" },
            { status: 500 }
        );
    }
}