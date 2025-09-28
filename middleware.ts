import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin', '/clients', '/projects', '/invoices', '/analytics', '/settings'];
  const adminRoutes = ['/admin'];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Skip middleware for API routes, static files, auth page, and root
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.includes('.') || 
      pathname === '/auth' ||
      pathname === '/' ||
      pathname === '/test-auth') {
    return NextResponse.next();
  }
  
  // For protected routes, check authentication
  if (isProtectedRoute) {
    try {
      // Make a request to the auth API to check if user is authenticated
      const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
        // Don't follow redirects to avoid loops
        redirect: 'manual'
      });
      
      // If auth check fails (non-2xx response), redirect to auth
      if (!authResponse.ok || authResponse.status === 401) {
        console.log('Authentication failed, redirecting to auth page');
        return NextResponse.redirect(new URL('/auth', request.url));
      }
      
      // If we get a successful response, check for admin access
      if (authResponse.ok) {
        const userData = await authResponse.json();
        
        // If it's an admin route, check if user has admin role
        if (isAdminRoute) {
          const isAdmin = userData.user?.role === 'admin';
          
          if (!isAdmin) {
            console.log('User is not admin, redirecting to dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // If auth check fails, redirect to auth page
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};