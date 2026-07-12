CREATE TYPE "public"."assinatura_status" AS ENUM('pendente', 'assinado', 'expirado');--> statement-breakpoint
CREATE TYPE "public"."audit_acao" AS ENUM('criar', 'atualizar', 'excluir', 'login');--> statement-breakpoint
CREATE TABLE "assinaturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documento_id" uuid NOT NULL,
	"cliente_id" uuid NOT NULL,
	"token" text NOT NULL,
	"status" "assinatura_status" DEFAULT 'pendente' NOT NULL,
	"hash" text,
	"ip" text,
	"assinado_em" timestamp,
	"expira_em" timestamp NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assinaturas_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"usuario_nome" text,
	"acao" "audit_acao" NOT NULL,
	"entidade" text NOT NULL,
	"entidade_id" text,
	"detalhes" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "excluido_em" timestamp;--> statement-breakpoint
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_documento_id_documentos_gerados_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos_gerados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;