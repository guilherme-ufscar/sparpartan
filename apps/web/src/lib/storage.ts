import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { type CategoriaArquivo, validarArquivo } from "@/lib/upload";

/**
 * Diretório raiz onde todos os arquivos enviados (documentos, PDFs gerados,
 * vídeos/materiais de LMS etc.) são persistidos em disco.
 */
export function uploadsDir() {
  return process.env.UPLOADS_DIR ?? "./data/uploads";
}

/**
 * Grava um arquivo em `uploadsDir()/subpasta/` com nome baseado em UUID
 * (preservando a extensão original) e retorna o caminho relativo a ser
 * guardado em uma coluna do banco (ex.: "lms/videos/<uuid>.mp4").
 *
 * Generaliza o padrão repetido em `orcamentos-pdf.ts` e `c/[token]/actions.ts`
 * para que código novo (LMS, futuras features) não duplique o boilerplate de
 * mkdir + writeFile.
 *
 * Se `categoria` for informada, o arquivo é validado (tamanho/extensão) antes
 * de ser salvo — lança erro caso não passe na validação.
 */
export async function salvarArquivoLocal(
  arquivo: File,
  subpasta: string,
  categoria?: CategoriaArquivo
): Promise<string> {
  if (categoria) {
    const erro = validarArquivo(arquivo, categoria);
    if (erro) throw new Error(erro);
  }

  const dir = path.join(uploadsDir(), subpasta);
  await mkdir(dir, { recursive: true });

  const extensao = path.extname(arquivo.name) || "";
  const nomeArquivo = `${randomUUID()}${extensao}`;
  const bytes = Buffer.from(await arquivo.arrayBuffer());
  await writeFile(path.join(dir, nomeArquivo), bytes);

  return path.join(subpasta, nomeArquivo);
}
