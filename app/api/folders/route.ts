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

        oauth2Client.setCredentials({ access_token: accessToken });
        const drive = google.drive("v3");

        const result = await drive.files.list({
            auth: oauth2Client,
            pageSize: 15,
            q: "mimeType='application/vnd.google-apps.folder'",
            fields: "nextPageToken, files(id, name, modifiedTime)",
        });

        const folders = result.data.files?.sort((a, b) => {
            const dateA = new Date(a.modifiedTime).setHours(0, 0, 0, 0);
            const dateB = new Date(b.modifiedTime).setHours(0, 0, 0, 0);
            
            if (dateA === dateB) {
                return a.name.localeCompare(b.name);
            }
            return dateB - dateA;
        });

        return NextResponse.json({ folders });
    } catch (error: any) {
        console.error("Detailed error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch folders" }, { status: 500 });
    }
}