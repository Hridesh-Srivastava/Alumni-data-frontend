import { cookies } from "next/headers"

// Set token in cookies
export function setAuthCookie(token: string) {
  // Set the token in cookies with HTTP-only flag for security
  cookies().set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "strict",
  })
}

// Remove token from cookies
export function removeAuthCookie() {
  cookies().delete("token")
}

// Get token from cookies
export function getAuthCookie() {
  return cookies().get("token")?.value
}
