import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Define paths that don't require authentication

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (
          req.nextUrl.pathname.startsWith("/api/register") ||
          req.nextUrl.pathname.startsWith("/api/login")
        )
          return true;
        if (!token) return false;
        return true;
      },
    },
    pages: {
      signIn: "/auth", // Redirect here when not signed in
    },
  }
);

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/api/(.*)",
  ],
};
