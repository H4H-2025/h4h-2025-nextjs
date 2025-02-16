import Link from "next/link";
import oauth2Client from "../utils/google-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Grant Drive Access</CardTitle>
          <CardDescription>
            This app needs permission to access your Google Drive files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={authorizationURL}>
            <Button className="w-full mt-4">
              Authorize Google Drive Access
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
