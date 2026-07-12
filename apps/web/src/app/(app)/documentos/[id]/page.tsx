import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Download } from "lucide-react";
import { db } from "@/db";
import { documentosGerados, modelosDocumento, clientes, assinaturas } from "@/db/schema";
import { SectionCard } from "@/components/ui/form-field";
import { LinkButton, Button, StatusBadge } from "@/components/ui";
import { statusAssinatura } from "@/lib/status";
import { solicitarAssinatura } from "./actions";

export default async function DocumentoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [documento] = await db
    .select()
    .from(documentosGerados)
    .where(eq(documentosGerados.id, id))
    .limit(1);
  if (!documento) notFound();

  const [modelo] = await db
    .select()
    .from(modelosDocumento)
    .where(eq(modelosDocumento.id, documento.modeloId))
    .limit(1);
  const [cliente] = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, documento.clienteId))
    .limit(1);

  const [assinatura] = await db
    .select()
    .from(assinaturas)
    .where(eq(assinaturas.documentoId, id))
    .orderBy(desc(assinaturas.criadoEm))
    .limit(1);

  const solicitarAssinaturaComId = solicitarAssinatura.bind(null, id);

  return (
    <div className="space-y-gutter">
      <h1 className="font-display text-headline-lg font-bold text-primary">
        {modelo?.nome} — {cliente?.nome}
      </h1>

      <SectionCard title="Documento Gerado">
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton href={`/api/documentos/${documento.id}?tipo=docx`} icon={Download}>
            Baixar DOCX
          </LinkButton>
          {documento.pdfCaminho && (
            <LinkButton href={`/api/documentos/${documento.id}?tipo=pdf`} variant="outlined" icon={Download}>
              Baixar PDF
            </LinkButton>
          )}
          {!documento.pdfCaminho && (
            <p className="text-body-sm text-outline">
              PDF indisponível (Gotenberg não respondeu) — o DOCX gerado continua utilizável.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Assinatura Digital">
        {!assinatura && (
          <form action={solicitarAssinaturaComId}>
            <Button type="submit">Solicitar Assinatura ao Cliente</Button>
          </form>
        )}
        {assinatura && assinatura.status === "pendente" && (
          <div className="space-y-2">
            <StatusBadge status={statusAssinatura(assinatura.status)} />
            <p className="break-all text-body-sm text-outline">
              Link: {process.env.AUTH_URL ?? "http://localhost:8080"}/assinar/{assinatura.token}
            </p>
          </div>
        )}
        {assinatura && assinatura.status === "assinado" && (
          <div className="space-y-4">
            <StatusBadge status={statusAssinatura(assinatura.status)} />
            <dl className="grid grid-cols-1 gap-4 text-body-md sm:grid-cols-3">
              <div>
                <dt className="font-mono-caps text-label-sm uppercase text-outline">Assinado em</dt>
                <dd className="text-primary">
                  {assinatura.assinadoEm && new Date(assinatura.assinadoEm).toLocaleString("pt-BR")}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono-caps text-label-sm uppercase text-outline">Hash de Integridade</dt>
                <dd className="break-all font-mono text-body-sm text-primary">{assinatura.hash}</dd>
              </div>
            </dl>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Campos Preenchidos">
        <dl className="grid grid-cols-2 gap-4 text-body-md sm:grid-cols-3">
          {Object.entries(documento.dadosPreenchidos).map(([campo, valor]) => (
            <div key={campo}>
              <dt className="font-mono-caps text-label-sm uppercase text-outline">{campo}</dt>
              <dd className="text-primary">{valor || "—"}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  );
}
