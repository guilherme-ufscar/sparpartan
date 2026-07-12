"use client";

import { useRef, useState } from "react";

type CamposEndereco = {
  rua?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

function setValorCampo(form: HTMLFormElement, name: string | undefined, valor: string) {
  if (!name || !valor) return;
  const campo = form.elements.namedItem(name);
  if (campo instanceof HTMLInputElement) campo.value = valor;
}

export function CampoCep({
  label = "CEP",
  name,
  required = false,
  defaultValue,
  camposEndereco,
}: {
  label?: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  camposEndereco?: CamposEndereco;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState(false);

  async function buscarCep(cepDigitado: string) {
    const cep = cepDigitado.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setBuscando(true);
    setErro(false);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await resp.json();
      if (dados.erro) {
        setErro(true);
        return;
      }
      const form = inputRef.current?.form;
      if (form && camposEndereco) {
        setValorCampo(form, camposEndereco.rua, dados.logradouro);
        setValorCampo(form, camposEndereco.bairro, dados.bairro);
        setValorCampo(form, camposEndereco.cidade, dados.localidade);
        setValorCampo(form, camposEndereco.uf, dados.uf);
      }
    } catch {
      setErro(true);
    } finally {
      setBuscando(false);
    }
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono-caps text-[11px] uppercase tracking-wide text-outline">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        ref={inputRef}
        name={name}
        type="text"
        inputMode="numeric"
        required={required}
        defaultValue={defaultValue}
        onBlur={(e) => buscarCep(e.target.value)}
        placeholder="00000-000"
        className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
      />
      {buscando && <span className="text-body-sm text-outline">Buscando endereço...</span>}
      {erro && <span className="text-body-sm text-danger">CEP não encontrado — preencha manualmente</span>}
    </label>
  );
}
