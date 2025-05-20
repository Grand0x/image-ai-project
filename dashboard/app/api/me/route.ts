import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("API /me: No authorization header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    console.log("API /me: Forwarding request to API")

    // Forward the request to your API
    const response = await fetch(`${process.env.API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error(`API /me: API responded with status ${response.status}`)
      return NextResponse.json({ error: "Failed to fetch user info" }, { status: response.status })
    }

    const data = await response.json()
    console.log("API /me: Success, returning user data")
    return NextResponse.json(data)
  } catch (error) {
    console.error("API /me: Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
