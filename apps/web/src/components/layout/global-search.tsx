"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Resultados = {
  clientes: { id: string; nome: string; cpfCnpj: string }[];
  embarcacoes: { id: string; nome: string }[];
  processos: { id: string; clienteNome: string; servicoNome: string }[];
};

export function GlobalSearch() {
  const [aberto, setAberto] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Resultados>({
    clientes: [],
    embarcacoes: [],
    processos: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function limparBusca() {
    setAberto(false);
    setQuery("");
    setResultados({ clientes: [], embarcacoes: [], processos: [] });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setAberto((v) => !v);
      }
      if (e.key === "Escape") {
        limparBusca();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (aberto) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [aberto]);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/busca?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then(setResultados)
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function navegar(href: string) {
    limparBusca();
    router.push(href);
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        aria-label="Buscar"
        className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-body-sm text-outline hover:bg-surface-container-low"
      >
        <Search size={14} />
        Buscar
        <kbd className="ml-1 rounded border border-outline-variant px-1 text-[10px]">Ctrl K</kbd>
      </button>
    );
  }

  const semResultados =
    resultados.clientes.length === 0 &&
    resultados.embarcacoes.length === 0 &&
    resultados.processos.length === 0;

  return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
        onClick={limparBusca}
      >
      <div
        className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar clientes, embarcações, processos..."
          className="w-full border-b border-outline-variant bg-transparent px-4 py-3 text-sm text-primary outline-none"
        />

        {query.trim().length >= 2 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {semResultados && (
              <p className="p-4 text-sm text-outline">Nenhum resultado encontrado.</p>
            )}

            {resultados.clientes.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 font-mono-caps text-[11px] uppercase text-outline">
                  Clientes
                </p>
                {resultados.clientes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navegar(`/clientes/${c.id}`)}
                    className="block w-full rounded-lg px-2 py-2 text-left text-sm text-primary hover:bg-surface"
                  >
                    {c.nome} <span className="text-xs text-outline">{c.cpfCnpj}</span>
                  </button>
                ))}
              </div>
            )}

            {resultados.embarcacoes.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 font-mono-caps text-[11px] uppercase text-outline">
                  Embarcações
                </p>
                {resultados.embarcacoes.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => navegar(`/embarcacoes/${e.id}`)}
                    className="block w-full rounded-lg px-2 py-2 text-left text-sm text-primary hover:bg-surface"
                  >
                    {e.nome}
                  </button>
                ))}
              </div>
            )}

            {resultados.processos.length > 0 && (
              <div>
                <p className="px-2 py-1 font-mono-caps text-[11px] uppercase text-outline">
                  Processos
                </p>
                {resultados.processos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navegar(`/processos/${p.id}`)}
                    className="block w-full rounded-lg px-2 py-2 text-left text-sm text-primary hover:bg-surface"
                  >
                    {p.servicoNome} <span className="text-xs text-outline">— {p.clienteNome}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
