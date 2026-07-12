"use client";

import { useActionState, useState } from "react";
import { Campo, SubmitButton, FormError, RichTextEditor } from "@/components/ui";
import type { EstadoForm } from "@/lib/validacao";

type TipoConteudo = "video_upload" | "video_link" | "texto" | "misto";

/**
 * Formulário de aula (criação e edição) — os campos condicionais (link de vídeo,
 * upload de vídeo, corpo rico) dependem de `tipoConteudo`, por isso é client
 * component. A action já vem vinculada (bind) ao capítulo (criar) ou à aula (editar).
 */
export function AulaForm({
  action,
  valoresIniciais,
}: {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  valoresIniciais?: {
    titulo?: string;
    tipoConteudo?: TipoConteudo;
    corpoHtml?: string;
    videoUrl?: string;
    ordem?: number;
    duracaoMinutos?: number | null;
  };
}) {
  const [estado, formAction] = useActionState(action, null);
  const [tipo, setTipo] = useState<TipoConteudo>(valoresIniciais?.tipoConteudo ?? "texto");

  const v = (nome: string, fallback?: string) => estado?.valores?.[nome] ?? fallback ?? "";

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="max-w-3xl space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6"
    >
      <FormError erro={estado?.erro} />

      <Campo label="Título" name="titulo" required defaultValue={v("titulo", valoresIniciais?.titulo)} />

      <label className="flex flex-col gap-1">
        <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">Tipo de conteúdo</span>
        <select
          name="tipoConteudo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoConteudo)}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
        >
          <option value="texto">Texto</option>
          <option value="video_link">Vídeo (link externo)</option>
          <option value="video_upload">Vídeo (upload local)</option>
          <option value="misto">Misto (vídeo + texto)</option>
        </select>
      </label>

      {(tipo === "video_link" || tipo === "misto") && (
        <Campo
          label="Link do vídeo (YouTube, Vimeo, Drive...)"
          name="videoUrl"
          defaultValue={v("videoUrl", valoresIniciais?.videoUrl)}
        />
      )}

      {(tipo === "video_upload" || tipo === "misto") && (
        <div>
          <span className="mb-1 block font-mono-caps text-[11px] uppercase tracking-wide text-outline">
            Arquivo de vídeo
          </span>
          <input
            type="file"
            name="videoArquivo"
            accept="video/mp4,video/webm,video/quicktime"
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
          />
        </div>
      )}

      {(tipo === "texto" || tipo === "misto") && (
        <div>
          <span className="mb-1 block font-mono-caps text-[11px] uppercase tracking-wide text-outline">
            Conteúdo
          </span>
          <RichTextEditor name="corpoHtml" defaultValue={valoresIniciais?.corpoHtml} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Campo
          label="Ordem"
          name="ordem"
          type="number"
          defaultValue={v("ordem", String(valoresIniciais?.ordem ?? 1))}
        />
        <Campo
          label="Duração (minutos)"
          name="duracaoMinutos"
          type="number"
          defaultValue={v("duracaoMinutos", valoresIniciais?.duracaoMinutos?.toString())}
        />
      </div>

      <SubmitButton>Salvar Aula</SubmitButton>
    </form>
  );
}
