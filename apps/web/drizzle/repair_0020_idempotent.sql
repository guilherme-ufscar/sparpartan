DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'embarcacao_classe') THEN
    CREATE TYPE "public"."embarcacao_classe" AS ENUM('esporte_recreio', 'comercial');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taxa_status') THEN
    CREATE TYPE "public"."taxa_status" AS ENUM('pendente', 'pago');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'servico_categoria' AND e.enumlabel = 'engenharia'
  ) THEN
    ALTER TYPE "public"."servico_categoria" ADD VALUE 'engenharia';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'servico_categoria' AND e.enumlabel = 'ultrassom'
  ) THEN
    ALTER TYPE "public"."servico_categoria" ADD VALUE 'ultrassom';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "agenda_interessados" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "evento_id" uuid NOT NULL,
  "cliente_id" uuid,
  "nome_interessado" text NOT NULL,
  "cpf_interessado" text,
  "servico_solicitado" text,
  "criado_em" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "arquivos_empresa" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "categoria" text NOT NULL,
  "titulo" text NOT NULL,
  "descricao" text,
  "arquivo_caminho" text NOT NULL,
  "criado_em" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "engenheiros" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome_completo" text NOT NULL,
  "cpf" text,
  "crea" text,
  "titulo_profissional" text,
  "ativo" boolean DEFAULT true NOT NULL,
  "criado_em" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "mensagens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "usuario_id" uuid,
  "usuario_nome" text NOT NULL,
  "corpo" text NOT NULL,
  "criado_em" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "taxas_pagar" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "processo_id" uuid,
  "cliente_id" uuid,
  "servico_contratado_id" uuid,
  "descricao" text NOT NULL,
  "valor" numeric NOT NULL,
  "vencimento" date,
  "status" "taxa_status" DEFAULT 'pendente' NOT NULL,
  "arquivo_caminho" text,
  "pago_em" timestamp,
  "forma_pagamento" text,
  "criado_em" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "agenda_eventos" ADD COLUMN IF NOT EXISTS "local" text;
ALTER TABLE "agenda_eventos" ADD COLUMN IF NOT EXISTS "representante_legal" text;
ALTER TABLE "arquivos" ADD COLUMN IF NOT EXISTS "embarcacao_id" uuid;
ALTER TABLE "despesas" ADD COLUMN IF NOT EXISTS "recorrente" boolean DEFAULT false NOT NULL;
ALTER TABLE "despesas" ADD COLUMN IF NOT EXISTS "dia_vencimento" integer;
ALTER TABLE "embarcacoes" ADD COLUMN IF NOT EXISTS "classe" "embarcacao_classe" DEFAULT 'esporte_recreio' NOT NULL;
ALTER TABLE "embarcacoes" ADD COLUMN IF NOT EXISTS "excluido_em" timestamp;
ALTER TABLE "obras" ADD COLUMN IF NOT EXISTS "engenheiro_id" uuid;
ALTER TABLE "obras" ADD COLUMN IF NOT EXISTS "excluido_em" timestamp;
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "descricao" text;
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "observacoes" text;
ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "excluido_em" timestamp;
ALTER TABLE "processos" ADD COLUMN IF NOT EXISTS "excluido_em" timestamp;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_interessados_evento_id_agenda_eventos_id_fk') THEN
    ALTER TABLE "agenda_interessados" ADD CONSTRAINT "agenda_interessados_evento_id_agenda_eventos_id_fk"
      FOREIGN KEY ("evento_id") REFERENCES "public"."agenda_eventos"("id") ON DELETE cascade ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_interessados_cliente_id_clientes_id_fk') THEN
    ALTER TABLE "agenda_interessados" ADD CONSTRAINT "agenda_interessados_cliente_id_clientes_id_fk"
      FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mensagens_usuario_id_usuarios_id_fk') THEN
    ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_usuario_id_usuarios_id_fk"
      FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'taxas_pagar_processo_id_processos_id_fk') THEN
    ALTER TABLE "taxas_pagar" ADD CONSTRAINT "taxas_pagar_processo_id_processos_id_fk"
      FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE set null ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'taxas_pagar_cliente_id_clientes_id_fk') THEN
    ALTER TABLE "taxas_pagar" ADD CONSTRAINT "taxas_pagar_cliente_id_clientes_id_fk"
      FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE set null ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'taxas_pagar_servico_contratado_id_servicos_contratados_id_fk') THEN
    ALTER TABLE "taxas_pagar" ADD CONSTRAINT "taxas_pagar_servico_contratado_id_servicos_contratados_id_fk"
      FOREIGN KEY ("servico_contratado_id") REFERENCES "public"."servicos_contratados"("id") ON DELETE set null ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'arquivos_embarcacao_id_embarcacoes_id_fk') THEN
    ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_embarcacao_id_embarcacoes_id_fk"
      FOREIGN KEY ("embarcacao_id") REFERENCES "public"."embarcacoes"("id") ON DELETE set null ON UPDATE no action;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'obras_engenheiro_id_engenheiros_id_fk') THEN
    ALTER TABLE "obras" ADD CONSTRAINT "obras_engenheiro_id_engenheiros_id_fk"
      FOREIGN KEY ("engenheiro_id") REFERENCES "public"."engenheiros"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
