import { proxy } from "../_lib/backend";

export async function GET() {
  return proxy("/api/categories");
}

export async function POST(request: Request) {
  return proxy("/api/categories", { method: "POST", body: await request.text() });
}
