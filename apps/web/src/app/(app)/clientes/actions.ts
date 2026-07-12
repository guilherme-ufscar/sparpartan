"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clientes } from "@/db/schema";
import { registrarAuditoria } from "@/lib/audit";
import { criarSolicitacao } from "@/lib/solicitacoes";
import {
  Validador,
  cpfCnpjValido,
  emailValido,
  ufValida,
  dataNoPassado,
  valoresDoFormData,
  type EstadoForm,
} from "@/lib/validacao";

export async function criarCliente(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const nome = String(formData.get("nome") ?? "").trim();
  const cpfCnpj = String(formData.get("cpfCnpj") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const uf = String(formData.get("uf") ?? "").trim();
  const dataNascimento = String(formData.get("dataNascimento") ?? "").trim();
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!nome, "Informe o nome.")
    .exigir(!!cpfCnpj, "Informe o CPF ou CNPJ.")
    .sePreenchido(cpfCnpj, cpfCnpjValido, "CPF/CNPJ inválido — confira os dígitos.")
    .sePreenchido(email, emailValido, "E-mail inválido.")
    .sePreenchido(uf, ufValida, "UF inválida (use a sigla, ex: SP).")
    .sePreenchido(dataNascimento, dataNoPassado, "Data de nascimento não pode ser no futuro.").erro;

  if (erro) return { erro, valores };

  const [jaExiste] = await db
    .select({ id: clientes.id })
    .from(clientes)
    .where(eq(clientes.cpfCnpj, cpfCnpj))
    .limit(1);
  if (jaExiste) return { erro: "Já existe um cliente com esse CPF/CNPJ.", valores };

  const [cliente] = await db
    .insert(clientes)
    .values({
      nome,
      tipo: String(formData.get("tipo") ?? "pessoa_fisica") as "pessoa_fisica" | "pessoa_juridica",
      cpfCnpj,
      rg: String(formData.get("rg") ?? "") || null,
      dataNascimento: String(formData.get("dataNascimento") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      telefone: String(formData.get("telefone") ?? "") || null,
      celular: String(formData.get("celular") ?? "") || null,
      cep: String(formData.get("cep") ?? "") || null,
      rua: String(formData.get("rua") ?? "") || null,
      numero: String(formData.get("numero") ?? "") || null,
      complemento: String(formData.get("complemento") ?? "") || null,
      bairro: String(formData.get("bairro") ?? "") || null,
      cidade: String(formData.get("cidade") ?? "") || null,
      uf: String(formData.get("uf") ?? "") || null,
      indicadoPor: String(formData.get("indicadoPor") ?? "") || null,
      observacoes: String(formData.get("observacoes") ?? "") || null,
    })
    .returning({ id: clientes.id });

  await registrarAuditoria("criar", "cliente", cliente.id, nome);

  redirect("/clientes");
}

export async function excluirCliente(clienteId: string) {
  await db.update(clientes).set({ excluidoEm: new Date() }).where(eq(clientes.id, clienteId));
  await registrarAuditoria("excluir", "cliente", clienteId);
  redirect("/clientes");
}

export async function restaurarCliente(clienteId: string) {
  await db.update(clientes).set({ excluidoEm: null }).where(eq(clientes.id, clienteId));
  await registrarAuditoria("atualizar", "cliente", clienteId, "restaurado da lixeira");
  redirect("/clientes/lixeira");
}

export async function gerarLinkCadastroNovoCliente() {
  const token = await criarSolicitacao({ tipo: "cadastro_cliente" });
  redirect(`/clientes?link=${token}`);
}
