import { proxy } from "../_lib/backend";

export async function GET() {
  return proxy("/api/accounts");
}

export async function POST(request: Request) {
  return proxy("/api/accounts", { method: "POST", body: await request.text() });
}
