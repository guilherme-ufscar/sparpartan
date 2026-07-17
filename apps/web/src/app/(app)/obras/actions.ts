"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { obras } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";

function opt(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function criarObra(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const clienteId = String(formData.get("clienteId") ?? "");
  const valores = valoresDoFormData(formData);

  const erro = new Validador().exigir(!!clienteId, "Selecione o cliente.").erro;
  if (erro) return { erro, valores };

  const [obra] = await db
    .insert(obras)
    .values({
      clienteId,
      idObra: opt(formData, "idObra"),
      titulo: opt(formData, "titulo"),
      tipoObra: opt(formData, "tipoObra"),
      itemObraCodigo: opt(formData, "itemObraCodigo"),
      descricaoObra: opt(formData, "descricaoObra"),
      normamDeUso: opt(formData, "normamDeUso"),
      cpDlAg: opt(formData, "cpDlAg"),
      respTecnico: opt(formData, "respTecnico"),
      nCrea: opt(formData, "nCrea"),
      engenheiroId: opt(formData, "engenheiroId"),
      rioLocalizado: opt(formData, "rioLocalizado"),
      distanciaRioKm: opt(formData, "distanciaRioKm"),
      areaNavegacao: opt(formData, "areaNavegacao"),
      atividade: opt(formData, "atividade"),
      pontoA: opt(formData, "pontoA"),
      pontoB: opt(formData, "pontoB"),
      pontoC: opt(formData, "pontoC"),
      pontoD: opt(formData, "pontoD"),
      comprimento: opt(formData, "comprimento"),
      largura: opt(formData, "largura"),
      areaConstruida: opt(formData, "areaConstruida"),
      apoiadoSobre: opt(formData, "apoiadoSobre"),
      estruturaCober: opt(formData, "estruturaCober"),
      matEstrutura: opt(formData, "matEstrutura"),
      matParedes: opt(formData, "matParedes"),
      matPiso: opt(formData, "matPiso"),
      matCobertura: opt(formData, "matCobertura"),
      listaMatConstrucaoDimensoes: opt(formData, "listaMatConstrucaoDimensoes"),
      fontEnergia: opt(formData, "fontEnergia"),
      banheiroSn: (opt(formData, "banheiroSn") as "sim" | "nao" | null) ?? undefined,
      piaOuOutros: opt(formData, "piaOuOutros"),
      caladoCar: opt(formData, "caladoCar"),
      caladoLeve: opt(formData, "caladoLeve"),
      deslCar: opt(formData, "deslCar"),
      deslLeve: opt(formData, "deslLeve"),
      pesoAdicional: opt(formData, "pesoAdicional"),
      cargaSuportada: opt(formData, "cargaSuportada"),
      lotacaoMax: opt(formData, "lotacaoMax") ? Number(opt(formData, "lotacaoMax")) : null,
      coletes: opt(formData, "coletes") ? Number(opt(formData, "coletes")) : null,
      boias: opt(formData, "boias") ? Number(opt(formData, "boias")) : null,
      matTambores: opt(formData, "matTambores"),
      qntTambores: opt(formData, "qntTambores") ? Number(opt(formData, "qntTambores")) : null,
      volumeTambores: opt(formData, "volumeTambores"),
    })
    .returning({ id: obras.id });

  await registrarAuditoria("criar", "obra", obra.id, opt(formData, "titulo") ?? "");

  redirect(`/obras/${obra.id}`);
}

export async function atualizarObra(
  obraId: string,
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const clienteId = String(formData.get("clienteId") ?? "");
  const valores = valoresDoFormData(formData);

  const erro = new Validador().exigir(!!clienteId, "Selecione o cliente.").erro;
  if (erro) return { erro, valores };

  await db
    .update(obras)
    .set({
      clienteId,
      idObra: opt(formData, "idObra"),
      titulo: opt(formData, "titulo"),
      tipoObra: opt(formData, "tipoObra"),
      itemObraCodigo: opt(formData, "itemObraCodigo"),
      descricaoObra: opt(formData, "descricaoObra"),
      normamDeUso: opt(formData, "normamDeUso"),
      cpDlAg: opt(formData, "cpDlAg"),
      respTecnico: opt(formData, "respTecnico"),
      nCrea: opt(formData, "nCrea"),
      engenheiroId: opt(formData, "engenheiroId"),
      rioLocalizado: opt(formData, "rioLocalizado"),
      distanciaRioKm: opt(formData, "distanciaRioKm"),
      areaNavegacao: opt(formData, "areaNavegacao"),
      atividade: opt(formData, "atividade"),
      pontoA: opt(formData, "pontoA"),
      pontoB: opt(formData, "pontoB"),
      pontoC: opt(formData, "pontoC"),
      pontoD: opt(formData, "pontoD"),
      comprimento: opt(formData, "comprimento"),
      largura: opt(formData, "largura"),
      areaConstruida: opt(formData, "areaConstruida"),
      apoiadoSobre: opt(formData, "apoiadoSobre"),
      estruturaCober: opt(formData, "estruturaCober"),
      matEstrutura: opt(formData, "matEstrutura"),
      matParedes: opt(formData, "matParedes"),
      matPiso: opt(formData, "matPiso"),
      matCobertura: opt(formData, "matCobertura"),
      listaMatConstrucaoDimensoes: opt(formData, "listaMatConstrucaoDimensoes"),
      fontEnergia: opt(formData, "fontEnergia"),
      banheiroSn: (opt(formData, "banheiroSn") as "sim" | "nao" | null) ?? undefined,
      piaOuOutros: opt(formData, "piaOuOutros"),
      caladoCar: opt(formData, "caladoCar"),
      caladoLeve: opt(formData, "caladoLeve"),
      deslCar: opt(formData, "deslCar"),
      deslLeve: opt(formData, "deslLeve"),
      pesoAdicional: opt(formData, "pesoAdicional"),
      cargaSuportada: opt(formData, "cargaSuportada"),
      lotacaoMax: opt(formData, "lotacaoMax") ? Number(opt(formData, "lotacaoMax")) : null,
      coletes: opt(formData, "coletes") ? Number(opt(formData, "coletes")) : null,
      boias: opt(formData, "boias") ? Number(opt(formData, "boias")) : null,
      matTambores: opt(formData, "matTambores"),
      qntTambores: opt(formData, "qntTambores") ? Number(opt(formData, "qntTambores")) : null,
      volumeTambores: opt(formData, "volumeTambores"),
      atualizadoEm: new Date(),
    })
    .where(eq(obras.id, obraId));

  await registrarAuditoria("atualizar", "obra", obraId, opt(formData, "titulo") ?? "");
  revalidatePath(`/obras/${obraId}`);
  redirect(`/obras/${obraId}`);
}
