import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { Role, JwtPayload } from "@/lib/types";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (error) {
    return null;
  }
}
