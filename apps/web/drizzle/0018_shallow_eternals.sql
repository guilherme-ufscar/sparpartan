CREATE TYPE "public"."status_acesso_aluno" AS ENUM('ativo', 'expirado', 'revogado');--> statement-breakpoint
CREATE TYPE "public"."status_tentativa_prova" AS ENUM('em_andamento', 'aguardando_correcao', 'corrigida');--> statement-breakpoint
CREATE TYPE "public"."tipo_conteudo_aula" AS ENUM('video_upload', 'video_link', 'texto', 'misto');--> statement-breakpoint
CREATE TYPE "public"."tipo_material_apoio" AS ENUM('upload', 'drive', 'link');--> statement-breakpoint
CREATE TYPE "public"."tipo_questao" AS ENUM('escolha_unica', 'escolha_multipla', 'verdadeiro_falso', 'dissertativa', 'associacao');--> statement-breakpoint
CREATE TABLE "alunos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"telefone" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alunos_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "aulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capitulo_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"tipo_conteudo" "tipo_conteudo_aula" DEFAULT 'texto' NOT NULL,
	"corpo_html" text,
	"video_url" text,
	"video_arquivo" text,
	"ordem" integer DEFAULT 1 NOT NULL,
	"duracao_minutos" integer,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capitulos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"materia_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"ordem" integer DEFAULT 1 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materiais_apoio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capitulo_id" uuid,
	"aula_id" uuid,
	"tipo" "tipo_material_apoio" DEFAULT 'upload' NOT NULL,
	"titulo" text NOT NULL,
	"url" text NOT NULL,
	"ordem" integer DEFAULT 1 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"icone" text,
	"ordem" integer DEFAULT 1 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matriculas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"materia_id" uuid NOT NULL,
	"liberado_em" timestamp DEFAULT now() NOT NULL,
	"expira_em" timestamp,
	"status" "status_acesso_aluno" DEFAULT 'ativo' NOT NULL,
	"origem" text DEFAULT 'manual' NOT NULL,
	"pagamento_id" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opcoes_questao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questao_id" uuid NOT NULL,
	"texto" text NOT NULL,
	"par_texto" text,
	"correta" boolean DEFAULT false NOT NULL,
	"ordem" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progresso_aula" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"aula_id" uuid NOT NULL,
	"concluida" boolean DEFAULT false NOT NULL,
	"concluida_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "provas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capitulo_id" uuid,
	"materia_id" uuid,
	"titulo" text NOT NULL,
	"descricao" text,
	"nota_minima" integer DEFAULT 60 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prova_id" uuid NOT NULL,
	"enunciado" text NOT NULL,
	"tipo" "tipo_questao" NOT NULL,
	"ordem" integer DEFAULT 1 NOT NULL,
	"pontos" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "respostas_aluno" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tentativa_id" uuid NOT NULL,
	"questao_id" uuid NOT NULL,
	"opcao_escolhida_id" uuid,
	"texto_resposta" text,
	"pares_resposta" jsonb,
	"correta" boolean,
	"pontos_obtidos" integer
);
--> statement-breakpoint
CREATE TABLE "tentativas_prova" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"prova_id" uuid NOT NULL,
	"iniciada_em" timestamp DEFAULT now() NOT NULL,
	"finalizada_em" timestamp,
	"nota_obtida" integer,
	"status" "status_tentativa_prova" DEFAULT 'em_andamento' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aulas" ADD CONSTRAINT "aulas_capitulo_id_capitulos_id_fk" FOREIGN KEY ("capitulo_id") REFERENCES "public"."capitulos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capitulos" ADD CONSTRAINT "capitulos_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiais_apoio" ADD CONSTRAINT "materiais_apoio_capitulo_id_capitulos_id_fk" FOREIGN KEY ("capitulo_id") REFERENCES "public"."capitulos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiais_apoio" ADD CONSTRAINT "materiais_apoio_aula_id_aulas_id_fk" FOREIGN KEY ("aula_id") REFERENCES "public"."aulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_aluno_id_alunos_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opcoes_questao" ADD CONSTRAINT "opcoes_questao_questao_id_questoes_id_fk" FOREIGN KEY ("questao_id") REFERENCES "public"."questoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progresso_aula" ADD CONSTRAINT "progresso_aula_aluno_id_alunos_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progresso_aula" ADD CONSTRAINT "progresso_aula_aula_id_aulas_id_fk" FOREIGN KEY ("aula_id") REFERENCES "public"."aulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provas" ADD CONSTRAINT "provas_capitulo_id_capitulos_id_fk" FOREIGN KEY ("capitulo_id") REFERENCES "public"."capitulos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provas" ADD CONSTRAINT "provas_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_prova_id_provas_id_fk" FOREIGN KEY ("prova_id") REFERENCES "public"."provas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respostas_aluno" ADD CONSTRAINT "respostas_aluno_tentativa_id_tentativas_prova_id_fk" FOREIGN KEY ("tentativa_id") REFERENCES "public"."tentativas_prova"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respostas_aluno" ADD CONSTRAINT "respostas_aluno_questao_id_questoes_id_fk" FOREIGN KEY ("questao_id") REFERENCES "public"."questoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respostas_aluno" ADD CONSTRAINT "respostas_aluno_opcao_escolhida_id_opcoes_questao_id_fk" FOREIGN KEY ("opcao_escolhida_id") REFERENCES "public"."opcoes_questao"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tentativas_prova" ADD CONSTRAINT "tentativas_prova_aluno_id_alunos_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tentativas_prova" ADD CONSTRAINT "tentativas_prova_prova_id_provas_id_fk" FOREIGN KEY ("prova_id") REFERENCES "public"."provas"("id") ON DELETE cascade ON UPDATE no action;