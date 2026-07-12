CREATE TYPE "public"."documento_status" AS ENUM('gerado', 'protocolado', 'vencido');--> statement-breakpoint
CREATE TABLE "documentos_gerados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"modelo_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"embarcacao_id" uuid,
	"dados_preenchidos" jsonb NOT NULL,
	"docx_caminho" text NOT NULL,
	"pdf_caminho" text,
	"status" "documento_status" DEFAULT 'gerado' NOT NULL,
	"vencimento" date,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modelos_documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"categoria" text,
	"norma" text,
	"arquivo_caminho" text NOT NULL,
	"campos" jsonb NOT NULL,
	"obrigatorio" boolean DEFAULT false NOT NULL,
	"duas_vias" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documentos_gerados" ADD CONSTRAINT "documentos_gerados_modelo_id_modelos_documento_id_fk" FOREIGN KEY ("modelo_id") REFERENCES "public"."modelos_documento"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_gerados" ADD CONSTRAINT "documentos_gerados_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_gerados" ADD CONSTRAINT "documentos_gerados_embarcacao_id_embarcacoes_id_fk" FOREIGN KEY ("embarcacao_id") REFERENCES "public"."embarcacoes"("id") ON DELETE set null ON UPDATE no action;