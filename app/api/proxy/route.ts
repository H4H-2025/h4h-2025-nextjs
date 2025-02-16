import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
        return NextResponse.json({ error: "No file url provided" }, { status: 400 });
    }

    try {
        const response = await fetch(fileUrl, {
            // Add headers that Google Drive expects
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': '*/*',
                'User-Agent': 'Mozilla/5.0',
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch file" }, 
                { status: response.status }
            );
        }

        // Get the content type from the response
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        // Create response headers
        const headers = new Headers({
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
            'Content-Disposition': response.headers.get('content-disposition') || 'attachment'
        });

        // Stream the response
        return new NextResponse(response.body, { 
            status: 200,
            headers: headers
        });
    } catch (err: any) {
        console.error('Proxy error:', err);
        return NextResponse.json(
            { error: err.message || "Error fetching file" }, 
            { status: 500 }
        );
    }
}