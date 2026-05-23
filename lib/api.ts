import { NextResponse } from "next/server";
import { AuthError } from "./session";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function handle<T>(fn: () => Promise<T>) {
  try {
    return ok(await fn());
  } catch (e) {
    if (e instanceof AuthError) return error(e.message, e.status);
    console.error(e);
    const message = e instanceof Error ? e.message : "Ichki xatolik";
    return error(message, 500);
  }
}
