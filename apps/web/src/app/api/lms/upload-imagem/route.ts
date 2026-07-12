import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { salvarArquivoLocal } from "@/lib/storage";

/**
 * Recebe uma imagem inline do editor de texto (Tiptap) usada em conteúdo de
 * aula/questão do LMS e grava em `uploadsDir()/lms/imagens/`, servida depois
 * por `GET /api/lms/arquivos/[...path]`.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  try {
    const caminho = await salvarArquivoLocal(arquivo, "lms/imagens", "imagem");
    return NextResponse.json({ url: `/api/lms/arquivos/${caminho.replace(/\\/g, "/").replace(/^lms\//, "")}` });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Falha ao salvar arquivo.";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }
}
