"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Campo, SubmitButton, FormError } from "@/components/ui";
import type { EstadoForm } from "@/lib/validacao";

type TipoQuestao = "escolha_unica" | "escolha_multipla" | "verdadeiro_falso" | "dissertativa" | "associacao";

const TIPO_LABEL: Record<TipoQuestao, string> = {
  escolha_unica: "Escolha única",
  escolha_multipla: "Escolha múltipla",
  verdadeiro_falso: "Verdadeiro ou Falso",
  dissertativa: "Dissertativa",
  associacao: "Associação de pares",
};

/**
 * Formulário de criação de questão — os campos variam bastante por `tipo`
 * (opções com marcação de corretas, pares esquerda/direita, ou só o enunciado
 * para dissertativa), então as listas dinâmicas de opções/pares vivem em estado
 * local; a submissão em si continua sendo uma server action via useActionState.
 */
export type QuestaoExistente = {
  enunciado: string;
  tipo: TipoQuestao;
  pontos: number;
  opcoes: { texto: string; parTexto: string | null; correta: boolean }[];
};

export function QuestaoForm({
  action,
  questaoExistente,
  textoBotao,
}: {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  questaoExistente?: QuestaoExistente;
  textoBotao?: string;
}) {
  const [estado, formAction] = useActionState(action, null);
  const [tipo, setTipo] = useState<TipoQuestao>(questaoExistente?.tipo ?? "escolha_unica");
  const [opcoes, setOpcoes] = useState<string[]>(() => {
    if (questaoExistente && (questaoExistente.tipo === "escolha_unica" || questaoExistente.tipo === "escolha_multipla")) {
      return questaoExistente.opcoes.map((o) => o.texto);
    }
    return ["", ""];
  });
  const [corretas, setCorretas] = useState<Set<number>>(() => {
    if (questaoExistente && (questaoExistente.tipo === "escolha_unica" || questaoExistente.tipo === "escolha_multipla")) {
      return new Set(questaoExistente.opcoes.map((o, i) => (o.correta ? i : -1)).filter((i) => i >= 0));
    }
    return new Set();
  });
  const [respostaVf, setRespostaVf] = useState<"verdadeiro" | "falso">(() => {
    if (questaoExistente?.tipo === "verdadeiro_falso") {
      const correta = questaoExistente.opcoes.find((o) => o.correta);
      return correta?.texto === "Falso" ? "falso" : "verdadeiro";
    }
    return "verdadeiro";
  });
  const [pares, setPares] = useState<{ esquerda: string; direita: string }[]>(() => {
    if (questaoExistente?.tipo === "associacao" && questaoExistente.opcoes.length > 0) {
      return questaoExistente.opcoes.map((o) => ({ esquerda: o.texto, direita: o.parTexto ?? "" }));
    }
    return [
      { esquerda: "", direita: "" },
      { esquerda: "", direita: "" },
    ];
  });

  function alternarCorreta(indice: number) {
    setCorretas((atual) => {
      const proximo = new Set(tipo === "escolha_unica" ? [] : atual);
      if (atual.has(indice) && tipo !== "escolha_unica") proximo.delete(indice);
      else proximo.add(indice);
      return proximo;
    });
  }

  return (
    <form
      action={formAction}
      className="max-w-3xl space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
    >
      <FormError erro={estado?.erro} />

      <label className="flex flex-col gap-1">
        <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">Tipo de questão</span>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as TipoQuestao);
            setCorretas(new Set());
          }}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
        >
          {Object.entries(TIPO_LABEL).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">Enunciado</span>
        <textarea
          name="enunciado"
          required
          rows={3}
          defaultValue={estado?.valores?.enunciado ?? questaoExistente?.enunciado}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
        />
      </label>

      {(tipo === "escolha_unica" || tipo === "escolha_multipla") && (
        <div className="space-y-3">
          <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">Opções</span>
          {opcoes.map((valor, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type={tipo === "escolha_unica" ? "radio" : "checkbox"}
                name="opcaoCorreta[]"
                value={i}
                checked={corretas.has(i)}
                onChange={() => alternarCorreta(i)}
                className="h-4 w-4"
              />
              <input
                type="text"
                name="opcaoTexto[]"
                value={valor}
                onChange={(e) => {
                  const proximo = [...opcoes];
                  proximo[i] = e.target.value;
                  setOpcoes(proximo);
                }}
                placeholder={`Opção ${i + 1}`}
                className="flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
              />
              {opcoes.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setOpcoes(opcoes.filter((_, j) => j !== i));
                    setCorretas(
                      new Set(
                        [...corretas]
                          .filter((j) => j !== i)
                          .map((j) => (j > i ? j - 1 : j))
                      )
                    );
                  }}
                  className="text-outline hover:text-error"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOpcoes([...opcoes, ""])}
            className="flex items-center gap-1 text-body-sm text-primary hover:underline"
          >
            <Plus size={14} /> Adicionar opção
          </button>
        </div>
      )}

      {tipo === "verdadeiro_falso" && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-primary">
            <input
              type="radio"
              name="respostaVf"
              value="verdadeiro"
              checked={respostaVf === "verdadeiro"}
              onChange={() => setRespostaVf("verdadeiro")}
              className="h-4 w-4"
            />
            Verdadeiro
          </label>
          <label className="flex items-center gap-2 text-sm text-primary">
            <input
              type="radio"
              name="respostaVf"
              value="falso"
              checked={respostaVf === "falso"}
              onChange={() => setRespostaVf("falso")}
              className="h-4 w-4"
            />
            Falso
          </label>
        </div>
      )}

      {tipo === "associacao" && (
        <div className="space-y-3">
          <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">
            Pares (coluna A ↔ coluna B)
          </span>
          {pares.map((par, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                name="parEsquerda[]"
                value={par.esquerda}
                onChange={(e) => {
                  const proximo = [...pares];
                  proximo[i] = { ...proximo[i], esquerda: e.target.value };
                  setPares(proximo);
                }}
                placeholder="Item A"
                className="flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
              />
              <span className="text-outline">↔</span>
              <input
                type="text"
                name="parDireita[]"
                value={par.direita}
                onChange={(e) => {
                  const proximo = [...pares];
                  proximo[i] = { ...proximo[i], direita: e.target.value };
                  setPares(proximo);
                }}
                placeholder="Item B"
                className="flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
              />
              {pares.length > 2 && (
                <button
                  type="button"
                  onClick={() => setPares(pares.filter((_, j) => j !== i))}
                  className="text-outline hover:text-error"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPares([...pares, { esquerda: "", direita: "" }])}
            className="flex items-center gap-1 text-body-sm text-primary hover:underline"
          >
            <Plus size={14} /> Adicionar par
          </button>
        </div>
      )}

      <Campo
        label="Pontos"
        name="pontos"
        type="number"
        defaultValue={estado?.valores?.pontos ?? questaoExistente?.pontos ?? "1"}
      />

      <SubmitButton>{textoBotao ?? "Salvar Questão"}</SubmitButton>
    </form>
  );
}
