CREATE TYPE "public"."catalogo_tipo" AS ENUM('embarcacao', 'motor', 'carreta');--> statement-breakpoint
CREATE TYPE "public"."habilitacao_tipo" AS ENUM('CHA', 'CIR');--> statement-breakpoint
CREATE TYPE "public"."servico_categoria" AS ENUM('despachante', 'escola');--> statement-breakpoint
CREATE TABLE "aquisicoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"embarcacao_id" uuid NOT NULL,
	"numero_nf" text,
	"data_venda" date,
	"local" text,
	"vendedor" text,
	"cpf_cnpj_vendedor" text,
	"valor" numeric,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalogo_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "catalogo_tipo" NOT NULL,
	"descricao" text NOT NULL,
	"marca" text,
	"modelo" text,
	"preco" numeric,
	"observacoes" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embarcacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"nome_anterior" text,
	"opcao_nome_2" text,
	"opcao_nome_3" text,
	"numero_inscricao" text,
	"tipo" text,
	"atividade" text,
	"area_navegacao" text,
	"comprimento" numeric,
	"boca" numeric,
	"pontal" numeric,
	"contorno" numeric,
	"calado_max" numeric,
	"arqueacao_bruta" numeric,
	"arqueacao_liquida" numeric,
	"pbt" numeric,
	"lpp" numeric,
	"tripulantes" integer,
	"passageiros" integer,
	"lotacao" integer,
	"ano" integer,
	"data_construcao" date,
	"numero_casco" text,
	"material_casco" text,
	"construtor" text,
	"cor" text,
	"local_inscricao" text,
	"data_inscricao" date,
	"registro_tm" text,
	"apolice_dpem" text,
	"validade_dpem" date,
	"tipo_propulsao" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habilitacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"tipo" "habilitacao_tipo" NOT NULL,
	"numero" text,
	"data_emissao" date,
	"categoria" text,
	"validade" date,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "motores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"embarcacao_id" uuid NOT NULL,
	"ordem" integer DEFAULT 1 NOT NULL,
	"marca" text,
	"potencia" text,
	"numero_serie" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salvatagem_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"embarcacao_id" uuid NOT NULL,
	"item" text NOT NULL,
	"quantidade" integer DEFAULT 1 NOT NULL,
	"validade" date,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servicos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"valor" numeric,
	"custo" numeric,
	"categoria" "servico_categoria" DEFAULT 'despachante' NOT NULL,
	"norma" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aquisicoes" ADD CONSTRAINT "aquisicoes_embarcacao_id_embarcacoes_id_fk" FOREIGN KEY ("embarcacao_id") REFERENCES "public"."embarcacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embarcacoes" ADD CONSTRAINT "embarcacoes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habilitacoes" ADD CONSTRAINT "habilitacoes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motores" ADD CONSTRAINT "motores_embarcacao_id_embarcacoes_id_fk" FOREIGN KEY ("embarcacao_id") REFERENCES "public"."embarcacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salvatagem_itens" ADD CONSTRAINT "salvatagem_itens_embarcacao_id_embarcacoes_id_fk" FOREIGN KEY ("embarcacao_id") REFERENCES "public"."embarcacoes"("id") ON DELETE cascade ON UPDATE no action;