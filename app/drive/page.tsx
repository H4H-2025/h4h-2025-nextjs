import oauth2Client from "../utils/google-auth";
import Link from "next/link";

export default function DrivePage() {
    const SCOPE = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

    const authorizationURL = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPE,
    })

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-xl font-bold">You must be signed in to view this page.</h1>
            <Link href={authorizationURL}>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    Sign in with Google
                </button>
            </Link>
        </div>
    );
}
