"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { agendaEventos, clientes } from "@/db/schema";
import { enviarEmail } from "@/lib/mail/adapter";
import { Validador, valoresDoFormData, type EstadoForm } from "@/lib/validacao";

export async function criarEvento(
  _estadoAnterior: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const dataHora = String(formData.get("dataHora") ?? "");
  const valores = valoresDoFormData(formData);

  const erro = new Validador()
    .exigir(!!titulo, "Informe o título.")
    .exigir(!!dataHora, "Informe a data e hora.").erro;
  if (erro) return { erro, valores };

  const clienteId = String(formData.get("clienteId") ?? "") || null;
  const tipo = String(formData.get("tipo") ?? "compromisso") as "compromisso" | "prova" | "vencimento";
  const data = new Date(dataHora);

  await db.insert(agendaEventos).values({
    clienteId,
    processoId: String(formData.get("processoId") ?? "") || null,
    titulo,
    dataHora: data,
    tipo,
    observacoes: String(formData.get("observacoes") ?? "") || null,
  });

  if (tipo === "prova" && clienteId) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
    if (cliente?.email) {
      const dataFormatada = data.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
      try {
        await enviarEmail({
          to: cliente.email,
          subject: `Sua prova foi agendada — ${titulo}`,
          html: `<p>Olá ${cliente.nome},</p><p>Sua inscrição em <strong>${titulo}</strong> foi confirmada. A prova está marcada para <strong>${dataFormatada}</strong>.</p><p>Sparapan Solução Naval</p>`,
        });
      } catch {
        // Falha de e-mail não impede o evento de ter sido criado.
      }
    }
  }

  redirect("/agenda");
}

export async function confirmarEvento(eventoId: string) {
  await db.update(agendaEventos).set({ status: "confirmado" }).where(eq(agendaEventos.id, eventoId));
  redirect("/agenda");
}

export async function concluirEvento(eventoId: string) {
  await db.update(agendaEventos).set({ status: "concluido" }).where(eq(agendaEventos.id, eventoId));
  redirect("/agenda");
}
