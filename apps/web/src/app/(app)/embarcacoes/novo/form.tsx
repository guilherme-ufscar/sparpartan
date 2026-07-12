"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, SectionCard } from "@/components/ui/form-field";
import { SubmitButton, FormError, CampoMoeda, CampoCnpj } from "@/components/ui";
import { criarEmbarcacao } from "../actions";

export function NovaEmbarcacaoForm({
  listaClientes,
}: {
  listaClientes: { id: string; nome: string }[];
}) {
  const [estado, formAction] = useActionState(criarEmbarcacao, null);
  const v = (nome: string) => estado?.valores?.[nome] ?? "";

  return (
    <form action={formAction} className="max-w-4xl space-y-6">
      <FormError erro={estado?.erro} />

      <SectionCard title="Dados da Embarcação">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoSelect
            label="Cliente (Proprietário)"
            name="clienteId"
            required
            defaultValue={v("clienteId")}
            options={[
              { value: "", label: "Selecione..." },
              ...listaClientes.map((c) => ({ value: c.id, label: c.nome })),
            ]}
          />
          <Campo label="Nome" name="nome" required defaultValue={v("nome")} />
          <Campo label="Nome Anterior" name="nomeAnterior" defaultValue={v("nomeAnterior")} />
          <Campo label="Número de Inscrição" name="numeroInscricao" defaultValue={v("numeroInscricao")} />
          <Campo label="Tipo" name="tipo" defaultValue={v("tipo")} />
          <Campo label="Atividade" name="atividade" defaultValue={v("atividade")} />
          <Campo label="Área de Navegação" name="areaNavegacao" defaultValue={v("areaNavegacao")} />
          <Campo label="Ano" name="ano" type="number" defaultValue={v("ano")} />
          <Campo label="Comprimento (m)" name="comprimento" type="number" defaultValue={v("comprimento")} />
          <Campo label="Boca (m)" name="boca" type="number" defaultValue={v("boca")} />
          <Campo label="Pontal (m)" name="pontal" type="number" defaultValue={v("pontal")} />
          <Campo label="Calado Máx (m)" name="caladoMax" type="number" defaultValue={v("caladoMax")} />
          <Campo label="Arqueação Bruta" name="arqueacaoBruta" type="number" defaultValue={v("arqueacaoBruta")} />
          <Campo label="Arqueação Líquida" name="arqueacaoLiquida" type="number" defaultValue={v("arqueacaoLiquida")} />
          <Campo label="PBT" name="pbt" type="number" defaultValue={v("pbt")} />
          <Campo label="LPP" name="lpp" type="number" defaultValue={v("lpp")} />
          <Campo label="Tripulantes" name="tripulantes" type="number" defaultValue={v("tripulantes")} />
          <Campo label="Passageiros" name="passageiros" type="number" defaultValue={v("passageiros")} />
          <Campo label="Lotação" name="lotacao" type="number" defaultValue={v("lotacao")} />
          <Campo label="Número do Casco" name="numeroCasco" defaultValue={v("numeroCasco")} />
          <Campo label="Material do Casco" name="materialCasco" defaultValue={v("materialCasco")} />
          <Campo label="Construtor" name="construtor" defaultValue={v("construtor")} />
          <Campo label="Cor" name="cor" defaultValue={v("cor")} />
          <Campo label="Tipo de Propulsão" name="tipoPropulsao" defaultValue={v("tipoPropulsao")} />
        </div>
      </SectionCard>

      <SectionCard title="Motores (até 3)">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Campo label={`Motor ${i} — Marca`} name={`motor${i}Marca`} defaultValue={v(`motor${i}Marca`)} />
              <Campo label={`Motor ${i} — Potência`} name={`motor${i}Potencia`} defaultValue={v(`motor${i}Potencia`)} />
              <Campo label={`Motor ${i} — Nº Série`} name={`motor${i}NumeroSerie`} defaultValue={v(`motor${i}NumeroSerie`)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Aquisição (opcional)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo label="Número da NF" name="numeroNf" defaultValue={v("numeroNf")} />
          <Campo label="Data da Venda" name="dataVenda" type="date" defaultValue={v("dataVenda")} />
          <Campo label="Local" name="localVenda" defaultValue={v("localVenda")} />
          <Campo label="Vendedor" name="vendedor" defaultValue={v("vendedor")} />
          <CampoCnpj
            label="CPF/CNPJ do Vendedor"
            name="cpfCnpjVendedor"
            defaultValue={v("cpfCnpjVendedor")}
            camposEmpresa={{ nome: "vendedor" }}
          />
          <CampoMoeda label="Valor" name="valorVenda" defaultValue={v("valorVenda")} />
        </div>
      </SectionCard>

      <SubmitButton>Salvar Embarcação</SubmitButton>
    </form>
  );
}
