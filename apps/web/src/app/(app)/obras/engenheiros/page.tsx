import { desc } from "drizzle-orm";
import { db } from "@/db";
import { engenheiros } from "@/db/schema";
import { Campo, SectionCard } from "@/components/ui/form-field";
import { Button, EmptyState, BackButton } from "@/components/ui";
import { HardHat } from "lucide-react";
import { criarEngenheiro } from "./actions";

export default async function EngenheirosPage() {
  const lista = await db.select().from(engenheiros).orderBy(desc(engenheiros.criadoEm));

  return (
    <div className="space-y-gutter">
      <BackButton href="/obras" />
      <h1 className="font-display text-headline-lg font-bold text-primary">
        Engenheiros Responsáveis Técnicos
      </h1>

      <SectionCard title="Cadastrar Engenheiro">
        <form action={criarEngenheiro} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Campo label="Nome Completo" name="nomeCompleto" required />
          <Campo label="CPF" name="cpf" />
          <Campo label="CREA" name="crea" />
          <Campo label="Título Profissional" name="tituloProfissional" />
          <div className="sm:col-span-4">
            <Button type="submit">Salvar Engenheiro</Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Engenheiros Cadastrados">
        {lista.length === 0 ? (
          <EmptyState icon={HardHat} title="Nenhum engenheiro cadastrado ainda" />
        ) : (
          <table className="w-full text-left text-body-md">
            <thead>
              <tr className="border-b border-outline-variant font-mono-caps text-label-sm uppercase tracking-wide text-outline">
                <th className="px-2 py-2">Nome</th>
                <th className="px-2 py-2">CPF</th>
                <th className="px-2 py-2">CREA</th>
                <th className="px-2 py-2">Título</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => (
                <tr key={e.id} className="border-b border-outline-variant last:border-0">
                  <td className="px-2 py-2">{e.nomeCompleto}</td>
                  <td className="px-2 py-2">{e.cpf ?? "—"}</td>
                  <td className="px-2 py-2">{e.crea ?? "—"}</td>
                  <td className="px-2 py-2">{e.tituloProfissional ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
