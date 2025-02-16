import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import oauth2Client from "../../utils/google-auth";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("google_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "No access token" }, { status: 401 });
        }

        oauth2Client.setCredentials({
            access_token: accessToken,
            scope: "https://www.googleapis.com/auth/drive"
        });

        const drive = google.drive({ version: "v3", auth: oauth2Client });

        // Modified query to show all non-trashed folders
        const response = await drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: "files(id, name, modifiedTime)",
            orderBy: "modifiedTime desc",
            pageSize: 100,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        const folders = response.data.files || [];
        console.log("Fetched folders:", folders);

        return NextResponse.json({ folders, total: folders.length });
    } catch (error: any) {
        console.error("Folders API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch folders", details: error.message },
            { status: 500 }
        );
    }
}