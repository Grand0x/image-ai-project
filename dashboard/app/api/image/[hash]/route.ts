import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const hash = params.hash

    if (!hash) {
      return NextResponse.json({ error: "Image hash is required" }, { status: 400 })
    }

    // Forward the request to your API
    const response = await fetch(`${process.env.API_URL}/image/${hash}`, {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status })
    }

    // Get the image data as a buffer
    const imageBuffer = await response.arrayBuffer()

    // Get the content type from the response
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Return the image with the correct content type
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Image endpoint error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
