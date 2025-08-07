import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/login',
  '/reset-password',
  '/privacy-notice',
  '/student(.*)',
  '/',
  '/mga-laro(.*)',
  '/aklatan(.*)',
])

const isStudentRoute = createRouteMatcher(['/student(.*)'])

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

  // Auto-refresh student sessions on student routes
  if (isStudentRoute(req)) {
    const response = NextResponse.next();

    // Check if student session cookies exist
    const studentInfo = req.cookies.get('student_info');
    const privacyConsent = req.cookies.get('privacy_consent');

    if (studentInfo && privacyConsent) {
      try {
        // Parse and re-set cookies with extended expiration (30 days)
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        };

        // Refresh the cookies with new expiration
        response.cookies.set('student_info', studentInfo.value, cookieOptions);
        response.cookies.set('privacy_consent', privacyConsent.value, cookieOptions);
      } catch (error) {
        console.error('Error refreshing student session in middleware:', error);
      }
    }

    return response;
  }
});

export const config = {
  matcher: [
    // Match all routes EXCEPT:
    // - Next.js internals (_next)
    // - Static assets like .html, .css, .js, .jpg, .mp3, etc.
    // - This prevents middleware from interfering with audio, images, etc.
    '/((?!_next|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3)).*)',

    // Always run for API and TRPC routes
    '/(api|trpc)(.*)',
  ],
};
