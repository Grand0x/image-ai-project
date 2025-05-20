import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login"

  // Get the token from the cookies or localStorage
  // Note: middleware can only access cookies, not localStorage
  const token = request.cookies.get("token")?.value || ""

  console.log(`Middleware: Path=${path}, IsPublicPath=${isPublicPath}, HasToken=${!!token}`)

  // For debugging only - always allow access during development
  // Remove this in production
  return NextResponse.next()

  // Uncomment this for production
  /*
  // Redirect to login if accessing a protected route without a token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  
  // Redirect to home if accessing login with a valid token
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  
  return NextResponse.next()
  */
}

// Configure the paths that should trigger this middleware
export const config = {
  matcher: ["/", "/login", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
