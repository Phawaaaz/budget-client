import { proxy } from "../../_lib/backend";

export async function POST() {
  return proxy("/api/sync/run", { method: "POST" });
}
