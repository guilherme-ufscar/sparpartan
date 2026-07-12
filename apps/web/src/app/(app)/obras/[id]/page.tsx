import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { obras, clientes } from "@/db/schema";
import { SectionCard } from "@/components/ui/form-field";

function Campo({ label, valor }: { label: string; valor: string | number | null }) {
  return (
    <div>
      <dt className="font-mono-caps text-[11px] uppercase text-outline">{label}</dt>
      <dd className="text-primary">{valor ?? "—"}</dd>
    </div>
  );
}

export default async function ObraDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [obra] = await db.select().from(obras).where(eq(obras.id, id)).limit(1);
  if (!obra) notFound();

  const [cliente] = await db.select().from(clientes).where(eq(clientes.id, obra.clienteId)).limit(1);

  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-headline-lg font-bold text-primary">
            {obra.titulo ?? "(sem título)"}
          </h1>
          <p className="text-sm text-outline">
            Proprietário:{" "}
            <Link href={`/clientes/${cliente?.id}`} className="hover:underline">
              {cliente?.nome}
            </Link>
          </p>
        </div>
        <Link
          href={`/documentos/gerar?clienteId=${obra.clienteId}&obraId=${obra.id}`}
          className="rounded-lg bg-primary px-4 py-2 font-display text-sm font-semibold text-on-primary hover:opacity-90"
        >
          Gerar Documento
        </Link>
      </div>

      <SectionCard title="Identificação">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Campo label="ID da Obra" valor={obra.idObra} />
          <Campo label="Tipo" valor={obra.tipoObra} />
          <Campo label="Código do Item" valor={obra.itemObraCodigo} />
          <Campo label="NORMAM de Uso" valor={obra.normamDeUso} />
          <Campo label="CP/DL/AG" valor={obra.cpDlAg} />
          <Campo label="Responsável Técnico" valor={obra.respTecnico} />
          <Campo label="CREA" valor={obra.nCrea} />
        </dl>
      </SectionCard>

      <SectionCard title="Localização">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Campo label="Rio" valor={obra.rioLocalizado} />
          <Campo label="Distância (km)" valor={obra.distanciaRioKm} />
          <Campo label="Área de Navegação" valor={obra.areaNavegacao} />
          <Campo label="Atividade" valor={obra.atividade} />
          <Campo label="Ponto A" valor={obra.pontoA} />
          <Campo label="Ponto B" valor={obra.pontoB} />
          <Campo label="Ponto C" valor={obra.pontoC} />
          <Campo label="Ponto D" valor={obra.pontoD} />
        </dl>
      </SectionCard>

      <SectionCard title="Dimensões e Estrutura">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Campo label="Comprimento" valor={obra.comprimento} />
          <Campo label="Largura" valor={obra.largura} />
          <Campo label="Área Construída" valor={obra.areaConstruida} />
          <Campo label="Apoiado Sobre" valor={obra.apoiadoSobre} />
          <Campo label="Material Estrutura" valor={obra.matEstrutura} />
          <Campo label="Material Paredes" valor={obra.matParedes} />
          <Campo label="Material Piso" valor={obra.matPiso} />
          <Campo label="Material Cobertura" valor={obra.matCobertura} />
          <Campo label="Banheiro" valor={obra.banheiroSn} />
        </dl>
      </SectionCard>

      <SectionCard title="Calados e Salvatagem">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Campo label="Calado Carregado" valor={obra.caladoCar} />
          <Campo label="Calado Leve" valor={obra.caladoLeve} />
          <Campo label="Lotação Máxima" valor={obra.lotacaoMax} />
          <Campo label="Coletes" valor={obra.coletes} />
          <Campo label="Boias" valor={obra.boias} />
        </dl>
      </SectionCard>
    </div>
  );
}
