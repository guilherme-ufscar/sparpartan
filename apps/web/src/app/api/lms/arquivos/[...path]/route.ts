import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { uploadsDir } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
};

function contentTypeFor(nomeArquivo: string) {
  const extensao = path.extname(nomeArquivo).toLowerCase();
  return CONTENT_TYPES[extensao] ?? "application/octet-stream";
}

/**
 * Serve arquivos gravados em `uploadsDir()/lms/**` (vídeos de aula, materiais
 * de apoio, imagens inline do Tiptap).
 *
 * Vídeos precisam de suporte a HTTP Range requests para que o elemento
 * `<video>` consiga buscar (seek) sem baixar o arquivo inteiro — por isso,
 * quando o header `Range` está presente, respondemos 206 Partial Content
 * com `Content-Range`/`Accept-Ranges`. Para os demais tipos, uma resposta
 * completa é suficiente.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: partes } = await params;
  if (!partes || partes.length === 0) {
    return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
  }

  const lmsRoot = path.resolve(path.join(uploadsDir(), "lms"));
  const caminhoResolvido = path.resolve(path.join(lmsRoot, ...partes));

  // Guarda contra path traversal: o caminho resolvido precisa ficar dentro de lmsRoot.
  const relativo = path.relative(lmsRoot, caminhoResolvido);
  if (relativo.startsWith("..") || path.isAbsolute(relativo)) {
    return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
  }

  let tamanho: number;
  try {
    const info = await stat(caminhoResolvido);
    if (!info.isFile()) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }
    tamanho = info.size;
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  const contentType = contentTypeFor(caminhoResolvido);
  const rangeHeader = req.headers.get("range");

  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (!match) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${tamanho}` },
      });
    }

    const inicioStr = match[1];
    const fimStr = match[2];
    let inicio = inicioStr ? parseInt(inicioStr, 10) : 0;
    let fim = fimStr ? parseInt(fimStr, 10) : tamanho - 1;

    if (!inicioStr && fimStr) {
      // Formato "bytes=-N" => últimos N bytes.
      inicio = Math.max(tamanho - parseInt(fimStr, 10), 0);
      fim = tamanho - 1;
    }

    if (Number.isNaN(inicio) || Number.isNaN(fim) || inicio > fim || inicio < 0 || fim >= tamanho) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${tamanho}` },
      });
    }

    const chunkSize = fim - inicio + 1;
    const stream = createReadStream(caminhoResolvido, { start: inicio, end: fim });

    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(chunkSize),
        "Content-Range": `bytes ${inicio}-${fim}/${tamanho}`,
        "Accept-Ranges": "bytes",
      },
    });
  }

  const stream = createReadStream(caminhoResolvido);
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(tamanho),
      "Accept-Ranges": "bytes",
    },
  });
}
