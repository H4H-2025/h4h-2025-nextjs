import { NextResponse } from "next/server";
import oauth2Client from "@/app/utils/google-auth";
import { cookies } from "next/headers";

export async function GET(req, res) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.json({ error: 'Google oauth2 error' });
    }

    if (!code) {
        return NextResponse.json({ error: 'No code provided' });
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        (await cookies()).set({
            name: "google_access_token",
            value: tokens.access_token || "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })
        console.log(tokens);

        return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch (error) {
        return NextResponse.json({ error: "Error exchanging code for tokens" });
    }
}