CREATE TYPE "public"."status_pedido_pagamento" AS ENUM('pendente', 'aprovado', 'rejeitado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."status_publicacao" AS ENUM('rascunho', 'publicado');--> statement-breakpoint
CREATE TABLE "pedidos_pagamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"materia_id" uuid NOT NULL,
	"valor_centavos" integer NOT NULL,
	"status" "status_pedido_pagamento" DEFAULT 'pendente' NOT NULL,
	"mercadopago_preference_id" text,
	"mercadopago_payment_id" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp
);
--> statement-breakpoint
ALTER TABLE "aulas" ADD COLUMN "status" "status_publicacao" DEFAULT 'rascunho' NOT NULL;--> statement-breakpoint
ALTER TABLE "capitulos" ADD COLUMN "status" "status_publicacao" DEFAULT 'rascunho' NOT NULL;--> statement-breakpoint
ALTER TABLE "materias" ADD COLUMN "preco_centavos" integer;--> statement-breakpoint
ALTER TABLE "provas" ADD COLUMN "status" "status_publicacao" DEFAULT 'rascunho' NOT NULL;--> statement-breakpoint
ALTER TABLE "respostas_aluno" ADD COLUMN "opcoes_escolhidas" jsonb;--> statement-breakpoint
ALTER TABLE "pedidos_pagamento" ADD CONSTRAINT "pedidos_pagamento_aluno_id_alunos_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos_pagamento" ADD CONSTRAINT "pedidos_pagamento_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_aluno_id_materia_id_unique" UNIQUE("aluno_id","materia_id");--> statement-breakpoint
ALTER TABLE "progresso_aula" ADD CONSTRAINT "progresso_aula_aluno_id_aula_id_unique" UNIQUE("aluno_id","aula_id");