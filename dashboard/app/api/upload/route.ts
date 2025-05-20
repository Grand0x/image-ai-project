import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Get the form data from the request
    const formData = await request.formData()

    // Log the upload attempt
    console.log("Upload attempt received, forwarding to API...")

    // Forward the request to your API with a longer timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 seconds timeout

    try {
      const response = await fetch(`${process.env.API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      })

      // Clear the timeout
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`Upload failed with status ${response.status}: ${errorText}`)
        return NextResponse.json({ error: `Upload failed: ${errorText}` }, { status: response.status })
      }

      const data = await response.json()
      console.log("Upload successful, returning data to client")
      return NextResponse.json(data)
    } catch (fetchError) {
      // Clear the timeout in case of error
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    console.error("Upload endpoint error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
