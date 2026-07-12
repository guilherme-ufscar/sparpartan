import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orcamentos, clientes, servicos } from "@/db/schema";

function uploadsDir() {
  return process.env.UPLOADS_DIR ?? "./data/uploads";
}

/**
 * `gerarPdfOrcamento` (a action) termina em `redirect()`, que aborta o fluxo
 * lançando uma exceção — não dá para chamá-la de dentro de outra action (ex.: para
 * "gerar-se-precisar e enviar"). Este core faz o mesmo trabalho sem redirecionar.
 */
export async function gerarPdfCore(orcamentoId: string): Promise<{ pdfCaminho: string }> {
  const [orcamento] = await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.id, orcamentoId))
    .limit(1);
  if (!orcamento) throw new Error("Orçamento não encontrado");

  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, orcamento.clienteId))
    .limit(1);
  const [servico] = await db
    .select()
    .from(servicos)
    .where(eq(servicos.id, orcamento.servicoId))
    .limit(1);

  const valorFormatado = Number(orcamento.valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
body { font-family: sans-serif; padding: 40px; color: #001736; }
h1 { color: #002b5b; }
table { width: 100%; border-collapse: collapse; margin-top: 24px; }
td { padding: 8px 0; border-bottom: 1px solid #ddd; }
.label { color: #666; font-size: 12px; text-transform: uppercase; }
</style></head><body>
<h1>Orçamento ${orcamento.numero}</h1>
<table>
<tr><td class="label">Cliente</td><td>${cliente?.nome ?? ""}</td></tr>
<tr><td class="label">Serviço</td><td>${servico?.nome ?? ""}</td></tr>
<tr><td class="label">Valor</td><td>${valorFormatado}</td></tr>
<tr><td class="label">Válido até</td><td>${orcamento.validoAte ?? "—"}</td></tr>
</table>
</body></html>`;

  const gotenbergUrl = process.env.GOTENBERG_URL ?? "http://gotenberg:3000";
  const body = new FormData();
  body.append("files", new Blob([html], { type: "text/html" }), "index.html");
  const res = await fetch(`${gotenbergUrl}/forms/chromium/convert/html`, {
    method: "POST",
    body,
  });
  if (!res.ok) throw new Error("Falha ao gerar PDF do orçamento");

  const pdfBuffer = Buffer.from(await res.arrayBuffer());
  const orcamentosDir = path.join(uploadsDir(), "orcamentos");
  await mkdir(orcamentosDir, { recursive: true });
  const pdfNome = `${randomUUID()}.pdf`;
  const pdfCaminho = path.join("orcamentos", pdfNome);
  await writeFile(path.join(uploadsDir(), pdfCaminho), pdfBuffer);

  await db.update(orcamentos).set({ pdfCaminho }).where(eq(orcamentos.id, orcamentoId));

  return { pdfCaminho };
}

export async function lerPdfOrcamento(pdfCaminho: string): Promise<Buffer> {
  return readFile(path.join(uploadsDir(), pdfCaminho));
}
