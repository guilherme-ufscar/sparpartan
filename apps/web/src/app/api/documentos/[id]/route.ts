import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { documentosGerados } from "@/db/schema";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo") === "pdf" ? "pdf" : "docx";
  const paginaParam = url.searchParams.get("pagina");
  const formatoZip = url.searchParams.get("formato") === "zip";

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

  if (tipo === "pdf" && (paginaParam || formatoZip)) {
    const pdfOriginal = await PDFDocument.load(bytes);
    const totalPaginas = pdfOriginal.getPageCount();

    if (formatoZip) {
      const zip = new JSZip();
      for (let i = 0; i < totalPaginas; i++) {
        const novoPdf = await PDFDocument.create();
        const [pagina] = await novoPdf.copyPages(pdfOriginal, [i]);
        novoPdf.addPage(pagina);
        const paginaBytes = await novoPdf.save();
        zip.file(`pagina-${i + 1}.pdf`, paginaBytes);
      }
      const zipBytes = await zip.generateAsync({ type: "uint8array" });
      return new NextResponse(new Uint8Array(zipBytes), {
        headers: {
          "Content-Disposition": `attachment; filename="documento-paginas.zip"`,
          "Content-Type": "application/zip",
        },
      });
    }

    const numeroPagina = Number(paginaParam);
    if (!Number.isInteger(numeroPagina) || numeroPagina < 1 || numeroPagina > totalPaginas) {
      return NextResponse.json({ error: "Página inválida" }, { status: 400 });
    }

    const novoPdf = await PDFDocument.create();
    const [pagina] = await novoPdf.copyPages(pdfOriginal, [numeroPagina - 1]);
    novoPdf.addPage(pagina);
    const paginaBytes = await novoPdf.save();

    return new NextResponse(new Uint8Array(paginaBytes), {
      headers: {
        "Content-Disposition": `attachment; filename="documento-pagina-${numeroPagina}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  }

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
