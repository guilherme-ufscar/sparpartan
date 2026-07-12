import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { documentosGerados } from "@/db/schema";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const tipo = new URL(req.url).searchParams.get("tipo") === "pdf" ? "pdf" : "docx";

  const [documento] = await db
    .select()
    .from(documentosGerados)
    .where(eq(documentosGerados.id, id))
    .limit(1);
  if (!documento) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  const tipoSessao = (session.user as { tipo?: string })?.tipo;
  if (tipoSessao === "cliente" && documento.clienteId !== session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const caminho = tipo === "pdf" ? documento.pdfCaminho : documento.docxCaminho;
  if (!caminho) {
    return NextResponse.json({ error: "Arquivo não disponível" }, { status: 404 });
  }

  const uploadsDir = process.env.UPLOADS_DIR ?? "./data/uploads";
  const bytes = await readFile(path.join(uploadsDir, caminho));

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Disposition": `attachment; filename="documento.${tipo}"`,
      "Content-Type":
        tipo === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  });
}
