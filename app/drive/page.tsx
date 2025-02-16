import oauth2Client from "../utils/google-auth";
import Link from "next/link";

export default function DrivePage() {
    const SCOPE = [
        "https://www.googleapis.com/auth/drive",  // Full drive access
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly"
    ];

    const authorizationURL = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPE,
        prompt: "consent",  // Force consent screen
        include_granted_scopes: true  // Include previously granted scopes
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-xl font-bold mb-4">Grant Drive Access</h1>
            <p className="text-gray-600 mb-4">
                This app needs permission to access your Google Drive files.
            </p>
            <Link href={authorizationURL}>
                <button className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Authorize Google Drive Access
                </button>
            </Link>
        </div>
    );
}
