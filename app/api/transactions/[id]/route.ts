import { proxy } from "../../_lib/backend";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(`/api/transactions/${id}`, { method: "PATCH", body: await request.text() });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(`/api/transactions/${id}`, { method: "DELETE" });
}
