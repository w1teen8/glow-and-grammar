import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function handleApiError(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Response) {
      return jsonError(err.status === 401 ? "Unauthorized" : "Forbidden", err.status);
    }
    console.error(err);
    return jsonError("Internal server error", 500);
  }
}
