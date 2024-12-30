import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Define public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  "/api",
];


export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  },
  
  {
    callbacks: {
      authorized({ req, token }) {
        // Check if the route is a public API route
        const isPublicApiRoute = PUBLIC_API_ROUTES.some(route =>
          req.nextUrl.pathname.startsWith(route)
        );

        console.log("isPublicApiRoute", isPublicApiRoute);

        if (isPublicApiRoute) {
          return true; // If the route starts with "/api/path", it's allowed
        }
        
        // Require authentication for other routes
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
  ],
};