import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_PADRAO = 20;

export function paginar(pagina: number, total: number, tamanho = PAGE_SIZE_PADRAO) {
  const totalPaginas = Math.max(1, Math.ceil(total / tamanho));
  const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);
  return {
    limit: tamanho,
    offset: (paginaAtual - 1) * tamanho,
    paginaAtual,
    totalPaginas,
  };
}

function montarUrl(baseParams: Record<string, string | undefined>, pagina: number) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(baseParams)) {
    if (valor) params.set(chave, valor);
  }
  if (pagina > 1) params.set("page", String(pagina));
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Paginação simples por link — sem JS, funciona com params de busca preservados. */
export function Pagination({
  paginaAtual,
  totalPaginas,
  totalRegistros,
  baseParams = {},
}: {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  baseParams?: Record<string, string | undefined>;
}) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 text-body-sm text-outline">
      <span>{totalRegistros} registro(s)</span>
      <div className="flex items-center gap-2">
        <Link
          href={montarUrl(baseParams, paginaAtual - 1)}
          aria-disabled={paginaAtual <= 1}
          className={`flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 ${
            paginaAtual <= 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-container-low"
          }`}
        >
          <ChevronLeft size={14} /> Anterior
        </Link>
        <span className="font-mono-caps text-[11px] uppercase tracking-wide">
          Página {paginaAtual} de {totalPaginas}
        </span>
        <Link
          href={montarUrl(baseParams, paginaAtual + 1)}
          aria-disabled={paginaAtual >= totalPaginas}
          className={`flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 ${
            paginaAtual >= totalPaginas ? "pointer-events-none opacity-40" : "hover:bg-surface-container-low"
          }`}
        >
          Próxima <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
