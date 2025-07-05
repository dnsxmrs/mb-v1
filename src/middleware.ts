import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/login',
  '/reset-password',
  '/privacy-statement',
  '/student(.*)',
  '/'
])

export default clerkMiddleware(async (auth, req) => {
  // check if a user is logged in
  const { userId } = await auth();
  const isAuthenticated = !!userId;
  const url = new URL(req.url);

  if (!isPublicRoute(req) && !isAuthenticated) {
    console.log('🚫 Unauthorized access to protected route: ',);
    await auth.protect();
  }

  if (isPublicRoute(req) && isAuthenticated) {
    // Allow access to privacy statement even when authenticated
    if (url.pathname === '/privacy-statement') {
      return NextResponse.next();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}