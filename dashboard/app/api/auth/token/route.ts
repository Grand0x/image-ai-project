import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Utilisation du realm "image-ai" comme spécifié dans vos variables
    const response = await fetch(`${process.env.KEYCLOAK_URL}/realms/image-ai/protocol/openid-connect/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID || "",
        client_secret: process.env.CLIENT_SECRET || "",
        grant_type: "password",
        username: body.username,
        password: body.password,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: "Authentication failed", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Token endpoint error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
