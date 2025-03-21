import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;

  const protectedPaths = ["/create-user", "/dashboard"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      // Check for specific roles
      if (
        request.nextUrl.pathname.startsWith("/create-user") &&
        payload.role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Add the user info to the request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("user", JSON.stringify(payload));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create-user", "/dashboard"],
};
