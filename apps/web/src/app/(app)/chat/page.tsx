import { asc } from "drizzle-orm";
import { MessageSquare } from "lucide-react";
import { db } from "@/db";
import { mensagens } from "@/db/schema";
import { auth } from "@/lib/auth";
import { Button, EmptyState } from "@/components/ui";
import { enviarMensagem } from "./actions";

export default async function ChatPage() {
  const session = await auth();
  const meuId = (session?.user as { id?: string } | undefined)?.id;

  const lista = await db.select().from(mensagens).orderBy(asc(mensagens.criadoEm)).limit(200);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-gutter">
      <div>
        <h1 className="font-display text-headline-lg font-bold text-primary">Chat da Equipe</h1>
        <p className="text-body-sm text-outline">
          Mensagens de trabalho centralizadas no sistema. Atualiza ao enviar — recarregue a página
          para ver mensagens novas de outras pessoas.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        {lista.length === 0 ? (
          <EmptyState icon={MessageSquare} title="Nenhuma mensagem ainda — comece a conversa" />
        ) : (
          <ul className="space-y-3">
            {lista.map((m) => {
              const minha = m.usuarioId === meuId;
              return (
                <li key={m.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      minha ? "bg-primary text-on-primary" : "bg-surface-container text-primary"
                    }`}
                  >
                    {!minha && (
                      <p className="font-mono-caps text-[10px] uppercase opacity-70">{m.usuarioNome}</p>
                    )}
                    <p className="whitespace-pre-wrap text-body-md">{m.corpo}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {new Date(m.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form action={enviarMensagem} className="flex gap-3">
        <textarea
          name="corpo"
          required
          rows={2}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md text-primary outline-none focus:border-primary"
        />
        <Button type="submit">Enviar</Button>
      </form>
    </div>
  );
}
