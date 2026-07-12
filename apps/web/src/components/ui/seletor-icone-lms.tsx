"use client";

import { useState } from "react";
import { LMS_ICONES, LMS_ICONE_NOMES } from "@/lib/lms-icones";

/**
 * Grid de ícones lucide pré-selecionados (tema náutico/educacional) para o campo
 * `materias.icone`. Client component só pela interação de clique — o valor
 * escolhido vai para um input hidden, então o `<form action={serverAction}>`
 * ao redor continua funcionando normalmente.
 */
export function SeletorIconeLms({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [selecionado, setSelecionado] = useState(defaultValue || LMS_ICONE_NOMES[0]);

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">Ícone</span>
      <input type="hidden" name={name} value={selecionado} />
      <div className="grid grid-cols-6 gap-2 rounded-lg border border-outline-variant bg-surface p-3 sm:grid-cols-10">
        {LMS_ICONE_NOMES.map((nome) => {
          const Icone = LMS_ICONES[nome];
          const ativo = nome === selecionado;
          return (
            <button
              key={nome}
              type="button"
              title={nome}
              onClick={() => setSelecionado(nome)}
              className={`flex h-10 w-10 items-center justify-center rounded-md transition ${
                ativo
                  ? "bg-primary text-on-primary"
                  : "text-outline hover:bg-surface-container-low hover:text-primary"
              }`}
            >
              <Icone size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
