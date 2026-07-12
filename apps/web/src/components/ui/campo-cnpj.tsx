"use client";

import { useRef, useState } from "react";

type CamposEmpresa = {
  nome?: string;
  cep?: string;
  rua?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

function setValorCampo(form: HTMLFormElement, name: string | undefined, valor: string | undefined) {
  if (!name || !valor) return;
  const campo = form.elements.namedItem(name);
  if (campo instanceof HTMLInputElement && !campo.value) campo.value = valor;
}

export function CampoCnpj({
  label,
  name,
  required = false,
  defaultValue,
  camposEmpresa,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  camposEmpresa?: CamposEmpresa;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState(false);

  async function buscarCnpj(valorDigitado: string) {
    const digitos = valorDigitado.replace(/\D/g, "");
    if (digitos.length !== 14) return;

    setBuscando(true);
    setErro(false);
    try {
      const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digitos}`);
      if (!resp.ok) {
        setErro(true);
        return;
      }
      const dados = await resp.json();
      const form = inputRef.current?.form;
      if (form && camposEmpresa) {
        setValorCampo(form, camposEmpresa.nome, dados.razao_social);
        setValorCampo(form, camposEmpresa.cep, dados.cep);
        setValorCampo(form, camposEmpresa.rua, dados.logradouro);
        setValorCampo(form, camposEmpresa.bairro, dados.bairro);
        setValorCampo(form, camposEmpresa.cidade, dados.municipio);
        setValorCampo(form, camposEmpresa.uf, dados.uf);
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
        required={required}
        defaultValue={defaultValue}
        onBlur={(e) => buscarCnpj(e.target.value)}
        className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-primary"
      />
      {buscando && <span className="text-body-sm text-outline">Buscando CNPJ...</span>}
      {erro && <span className="text-body-sm text-danger">CNPJ não encontrado — preencha manualmente</span>}
    </label>
  );
}
