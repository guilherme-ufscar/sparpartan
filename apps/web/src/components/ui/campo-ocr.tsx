"use client";

import { useRef, useState } from "react";
import { extrairCampos } from "@/lib/ocr/extrair-campos";

type CamposDestino = {
  nome?: string;
  cpfCnpj?: string;
  rg?: string;
  dataNascimento?: string;
};

function setValorCampo(form: HTMLFormElement, name: string | undefined, valor: string | undefined) {
  if (!name || !valor) return;
  const campo = form.elements.namedItem(name);
  if (campo instanceof HTMLInputElement && !campo.value) campo.value = valor;
}

/**
 * Antes, o OCR só devolvia o texto cru pra copiar e colar na mão. Agora lê a foto
 * do RG/CNH direto no formulário de cadastro e já preenche os campos que reconhecer —
 * 100% no navegador (Tesseract.js), a imagem nunca sai da máquina.
 */
export function CampoOcr({ camposDestino }: { camposDestino: CamposDestino }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progresso, setProgresso] = useState(0);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<"ok" | "vazio" | null>(null);

  async function processarArquivo(file: File) {
    setProcessando(true);
    setResultado(null);
    setProgresso(0);

    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("por", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") setProgresso(Math.round(m.progress * 100));
      },
    });

    const {
      data: { text },
    } = await worker.recognize(file);
    await worker.terminate();

    const campos = extrairCampos(text);
    const form = inputRef.current?.form;
    let achouAlgo = false;
    if (form) {
      for (const [chave, valor] of Object.entries(campos)) {
        const nomeCampo = camposDestino[chave as keyof CamposDestino];
        if (valor && nomeCampo) {
          setValorCampo(form, nomeCampo, valor);
          achouAlgo = true;
        }
      }
    }

    setResultado(achouAlgo ? "ok" : "vazio");
    setProcessando(false);
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-outline-variant p-4">
      <label className="flex flex-col gap-1">
        <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">
          Preencher automaticamente com foto do documento (RG, CNH)
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processarArquivo(file);
          }}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
        />
      </label>

      {processando && <p className="text-body-sm text-outline">Lendo documento... {progresso}%</p>}
      {resultado === "ok" && (
        <p className="text-body-sm text-success">Campos preenchidos — confira antes de salvar.</p>
      )}
      {resultado === "vazio" && (
        <p className="text-body-sm text-outline">
          Não consegui reconhecer os dados nessa foto. Preencha manualmente.
        </p>
      )}
    </div>
  );
}
