import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import oauth2Client from "../../../utils/google-auth";

export async function POST(request: Request) {
    try {
        const { folderName } = await request.json();
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("google_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        oauth2Client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        };

        const folder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id'
        });

        return NextResponse.json({ folderId: folder.data.id });
    } catch (error) {
        console.error('Create folder error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to create folder" },
            { status: 500 }
        );
    }
}