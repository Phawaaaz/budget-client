import type { NextRequest } from "next/server";
import { proxy } from "../_lib/backend";

export async function GET(request: NextRequest) {
  return proxy(`/api/transactions${request.nextUrl.search}`);
}

export async function POST(request: Request) {
  return proxy("/api/transactions", { method: "POST", body: await request.text() });
}
