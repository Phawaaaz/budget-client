import { proxy } from "../../_lib/backend";

export async function GET() {
  return proxy("/api/sync/status");
}
