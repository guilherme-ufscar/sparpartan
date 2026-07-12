import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { processos } from "@/db/schema";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const [processo] = await db.select().from(processos).where(eq(processos.id, id)).limit(1);
  if (!processo?.protocoloEscaneadoCaminho) {
    return NextResponse.json({ error: "Comprovante não disponível" }, { status: 404 });
  }

  const tipoSessao = (session.user as { tipo?: string })?.tipo;
  if (tipoSessao === "cliente" && processo.clienteId !== session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const uploadsDir = process.env.UPLOADS_DIR ?? "./data/uploads";
  const bytes = await readFile(path.join(uploadsDir, processo.protocoloEscaneadoCaminho));

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Disposition": `attachment; filename="comprovante-${processo.numeroProtocolo}"`,
      "Content-Type": "application/octet-stream",
    },
  });
}
