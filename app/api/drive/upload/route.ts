import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { Readable } from 'stream';
import oauth2Client from "../../../utils/google-auth";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folderId = formData.get('folderId') as string;
        const path = formData.get('path') as string;

        // Convert File to Buffer and then to Readable stream
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const cookieStore = await cookies();
        const accessToken = cookieStore.get("google_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        oauth2Client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const fileMetadata = {
            name: file.name,
            parents: [folderId],
            properties: {
                uploadedByApp: 'true'
            }
        };

        const media = {
            mimeType: file.type,
            body: stream
        };

        const uploadedFile = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
        });

        return NextResponse.json({
            fileId: uploadedFile.data.id,
            name: uploadedFile.data.name,
            webViewLink: uploadedFile.data.webViewLink
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
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("google_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "No access token" }, { status: 401 });
        }

        // Set the credentials with the access token
        oauth2Client.setCredentials({
            access_token: accessToken
        });

        // Create drive instance with auth
        const drive = google.drive({
            version: "v3",
            auth: oauth2Client  // Pass the authenticated client
        });

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