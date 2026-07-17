"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { embarcacoes, motores, aquisicoes } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";

function opt(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function optNum(formData: FormData, key: string) {
  const v = opt(formData, key);
  return v === null ? null : v;
}

export async function criarEmbarcacao(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!clienteId, "Selecione o cliente.")
    .exigir(!!nome, "Informe o nome da embarcação.").erro;

  if (erro) return { erro, valores };

  const [embarcacao] = await db
    .insert(embarcacoes)
    .values({
      clienteId,
      nome,
      nomeAnterior: opt(formData, "nomeAnterior"),
      numeroInscricao: opt(formData, "numeroInscricao"),
      tipo: opt(formData, "tipo"),
      atividade: opt(formData, "atividade"),
      areaNavegacao: opt(formData, "areaNavegacao"),
      comprimento: optNum(formData, "comprimento"),
      boca: optNum(formData, "boca"),
      pontal: optNum(formData, "pontal"),
      caladoMax: optNum(formData, "caladoMax"),
      arqueacaoBruta: optNum(formData, "arqueacaoBruta"),
      arqueacaoLiquida: optNum(formData, "arqueacaoLiquida"),
      pbt: optNum(formData, "pbt"),
      lpp: optNum(formData, "lpp"),
      tripulantes: optNum(formData, "tripulantes") ? Number(optNum(formData, "tripulantes")) : null,
      passageiros: optNum(formData, "passageiros") ? Number(optNum(formData, "passageiros")) : null,
      lotacao: optNum(formData, "lotacao") ? Number(optNum(formData, "lotacao")) : null,
      ano: optNum(formData, "ano") ? Number(optNum(formData, "ano")) : null,
      numeroCasco: opt(formData, "numeroCasco"),
      materialCasco: opt(formData, "materialCasco"),
      construtor: opt(formData, "construtor"),
      cor: opt(formData, "cor"),
      tipoPropulsao: opt(formData, "tipoPropulsao"),
      classe:
        (opt(formData, "classe") as "esporte_recreio" | "comercial" | null) ?? "esporte_recreio",
    })
    .returning({ id: embarcacoes.id });

  for (let i = 1; i <= 3; i++) {
    const marca = opt(formData, `motor${i}Marca`);
    const potencia = opt(formData, `motor${i}Potencia`);
    const numeroSerie = opt(formData, `motor${i}NumeroSerie`);
    if (marca || potencia || numeroSerie) {
      await db.insert(motores).values({
        embarcacaoId: embarcacao.id,
        ordem: i,
        marca,
        potencia,
        numeroSerie,
      });
    }
  }

  const numeroNf = opt(formData, "numeroNf");
  const vendedor = opt(formData, "vendedor");
  if (numeroNf || vendedor) {
    await db.insert(aquisicoes).values({
      embarcacaoId: embarcacao.id,
      numeroNf,
      dataVenda: opt(formData, "dataVenda"),
      local: opt(formData, "localVenda"),
      vendedor,
      cpfCnpjVendedor: opt(formData, "cpfCnpjVendedor"),
      valor: optNum(formData, "valorVenda"),
    });
  }

  redirect("/embarcacoes");
}

export async function atualizarEmbarcacao(
  embarcacaoId: string,
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!clienteId, "Selecione o cliente.")
    .exigir(!!nome, "Informe o nome da embarcação.").erro;

  if (erro) return { erro, valores };

  await db
    .update(embarcacoes)
    .set({
      clienteId,
      nome,
      nomeAnterior: opt(formData, "nomeAnterior"),
      numeroInscricao: opt(formData, "numeroInscricao"),
      tipo: opt(formData, "tipo"),
      atividade: opt(formData, "atividade"),
      areaNavegacao: opt(formData, "areaNavegacao"),
      comprimento: optNum(formData, "comprimento"),
      boca: optNum(formData, "boca"),
      pontal: optNum(formData, "pontal"),
      caladoMax: optNum(formData, "caladoMax"),
      arqueacaoBruta: optNum(formData, "arqueacaoBruta"),
      arqueacaoLiquida: optNum(formData, "arqueacaoLiquida"),
      pbt: optNum(formData, "pbt"),
      lpp: optNum(formData, "lpp"),
      tripulantes: optNum(formData, "tripulantes") ? Number(optNum(formData, "tripulantes")) : null,
      passageiros: optNum(formData, "passageiros") ? Number(optNum(formData, "passageiros")) : null,
      lotacao: optNum(formData, "lotacao") ? Number(optNum(formData, "lotacao")) : null,
      ano: optNum(formData, "ano") ? Number(optNum(formData, "ano")) : null,
      numeroCasco: opt(formData, "numeroCasco"),
      materialCasco: opt(formData, "materialCasco"),
      construtor: opt(formData, "construtor"),
      cor: opt(formData, "cor"),
      tipoPropulsao: opt(formData, "tipoPropulsao"),
      classe:
        (opt(formData, "classe") as "esporte_recreio" | "comercial" | null) ?? "esporte_recreio",
      atualizadoEm: new Date(),
    })
    .where(eq(embarcacoes.id, embarcacaoId));

  await registrarAuditoria("atualizar", "embarcacao", embarcacaoId, nome);
  revalidatePath(`/embarcacoes/${embarcacaoId}`);
  redirect(`/embarcacoes/${embarcacaoId}`);
}
