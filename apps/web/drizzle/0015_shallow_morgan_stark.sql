CREATE TYPE "public"."solicitacao_status" AS ENUM('pendente', 'concluida', 'expirada');--> statement-breakpoint
CREATE TYPE "public"."solicitacao_tipo" AS ENUM('cadastro_cliente', 'cadastro_embarcacao', 'documentos_processo', 'aprovacao_orcamento', 'acompanhamento_processo');--> statement-breakpoint
CREATE TABLE "requisitos_documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"servico_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"obrigatorio" boolean DEFAULT true NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solicitacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "solicitacao_tipo" NOT NULL,
	"token" text NOT NULL,
	"status" "solicitacao_status" DEFAULT 'pendente' NOT NULL,
	"cliente_id" uuid,
	"processo_id" uuid,
	"orcamento_id" uuid,
	"embarcacao_id" uuid,
	"expira_em" timestamp NOT NULL,
	"concluida_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "solicitacoes_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "arquivos" ADD COLUMN "processo_id" uuid;--> statement-breakpoint
ALTER TABLE "arquivos" ADD COLUMN "requisito_id" uuid;--> statement-breakpoint
ALTER TABLE "requisitos_documento" ADD CONSTRAINT "requisitos_documento_servico_id_servicos_id_fk" FOREIGN KEY ("servico_id") REFERENCES "public"."servicos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_processo_id_processos_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_embarcacao_id_embarcacoes_id_fk" FOREIGN KEY ("embarcacao_id") REFERENCES "public"."embarcacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_processo_id_processos_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arquivos" ADD CONSTRAINT "arquivos_requisito_id_requisitos_documento_id_fk" FOREIGN KEY ("requisito_id") REFERENCES "public"."requisitos_documento"("id") ON DELETE set null ON UPDATE no action;