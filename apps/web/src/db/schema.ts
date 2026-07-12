import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  date,
  numeric,
  integer,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "operador", "leitura"]);
export const clienteTipo = pgEnum("cliente_tipo", ["pessoa_fisica", "pessoa_juridica"]);
export const habilitacaoTipo = pgEnum("habilitacao_tipo", ["CHA", "CIR"]);
export const servicoCategoria = pgEnum("servico_categoria", ["despachante", "escola"]);
export const catalogoTipo = pgEnum("catalogo_tipo", ["embarcacao", "motor", "carreta"]);
export const documentoStatus = pgEnum("documento_status", ["gerado", "protocolado", "vencido"]);
export const processoStatus = pgEnum("processo_status", [
  "aberto",
  "documentos_pendentes",
  "pronto_para_protocolo",
  "protocolado",
  "concluido",
  "cancelado",
]);
export const orcamentoStatus = pgEnum("orcamento_status", [
  "pendente",
  "aprovado",
  "recusado",
  "expirado",
]);
export const pagamentoStatus = pgEnum("pagamento_status", ["pendente", "pago", "atrasado"]);
export const eventoTipo = pgEnum("evento_tipo", ["compromisso", "prova", "vencimento"]);
export const eventoStatus = pgEnum("evento_status", [
  "pendente",
  "confirmado",
  "concluido",
  "cancelado",
]);
export const envioStatus = pgEnum("envio_status", ["enviado", "falhou"]);
export const despesaCategoria = pgEnum("despesa_categoria", [
  "fixa",
  "variavel",
  "imposto",
  "outra",
]);
export const materialTipo = pgEnum("material_tipo", ["pdf", "video", "link"]);
export const obraSimNao = pgEnum("obra_sim_nao", ["sim", "nao"]);
export const auditAcao = pgEnum("audit_acao", ["criar", "atualizar", "excluir", "login"]);
export const assinaturaStatus = pgEnum("assinatura_status", ["pendente", "assinado", "expirado"]);
export const solicitacaoTipo = pgEnum("solicitacao_tipo", [
  "cadastro_cliente",
  "cadastro_embarcacao",
  "documentos_processo",
  "aprovacao_orcamento",
  "acompanhamento_processo",
]);
export const solicitacaoStatus = pgEnum("solicitacao_status", [
  "pendente",
  "concluida",
  "expirada",
]);
export const clienteClassificacao = pgEnum("cliente_classificacao", [
  "cliente",
  "aluno",
  "ambos",
]);
export const tipoConteudoAula = pgEnum("tipo_conteudo_aula", [
  "video_upload",
  "video_link",
  "texto",
  "misto",
]);
export const tipoQuestao = pgEnum("tipo_questao", [
  "escolha_unica",
  "escolha_multipla",
  "verdadeiro_falso",
  "dissertativa",
  "associacao",
]);
export const tipoMaterialApoio = pgEnum("tipo_material_apoio", ["upload", "drive", "link"]);
export const statusAcessoAluno = pgEnum("status_acesso_aluno", ["ativo", "expirado", "revogado"]);
export const statusTentativaProva = pgEnum("status_tentativa_prova", [
  "em_andamento",
  "aguardando_correcao",
  "corrigida",
]);
export const statusPublicacao = pgEnum("status_publicacao", ["rascunho", "publicado"]);
export const statusPedidoPagamento = pgEnum("status_pedido_pagamento", [
  "pendente",
  "aprovado",
  "rejeitado",
  "cancelado",
]);

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  role: userRole("role").notNull().default("operador"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const clientes = pgTable("clientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  tipo: clienteTipo("tipo").notNull().default("pessoa_fisica"),
  cpfCnpj: text("cpf_cnpj").notNull().unique(),
  rg: text("rg"),
  orgaoEmissor: text("orgao_emissor"),
  dataEmissaoRg: date("data_emissao_rg"),
  dataNascimento: date("data_nascimento"),
  nacionalidade: text("nacionalidade"),
  naturalidade: text("naturalidade"),
  email: text("email"),
  telefone: text("telefone"),
  celular: text("celular"),
  cep: text("cep"),
  rua: text("rua"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  uf: text("uf"),
  despachante: text("despachante"),
  indicadoPor: text("indicado_por"),
  classificacao: clienteClassificacao("classificacao").notNull().default("cliente"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").notNull().default(true),
  portalSenhaHash: text("portal_senha_hash"),
  excluidoEm: timestamp("excluido_em"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const embarcacoes = pgTable("embarcacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "restrict" }),
  nome: text("nome").notNull(),
  nomeAnterior: text("nome_anterior"),
  opcaoNome2: text("opcao_nome_2"),
  opcaoNome3: text("opcao_nome_3"),
  numeroInscricao: text("numero_inscricao"),
  tipo: text("tipo"),
  atividade: text("atividade"),
  areaNavegacao: text("area_navegacao"),
  comprimento: numeric("comprimento"),
  boca: numeric("boca"),
  pontal: numeric("pontal"),
  contorno: numeric("contorno"),
  caladoMax: numeric("calado_max"),
  arqueacaoBruta: numeric("arqueacao_bruta"),
  arqueacaoLiquida: numeric("arqueacao_liquida"),
  pbt: numeric("pbt"),
  lpp: numeric("lpp"),
  tripulantes: integer("tripulantes"),
  passageiros: integer("passageiros"),
  lotacao: integer("lotacao"),
  ano: integer("ano"),
  dataConstrucao: date("data_construcao"),
  numeroCasco: text("numero_casco"),
  materialCasco: text("material_casco"),
  construtor: text("construtor"),
  cor: text("cor"),
  localInscricao: text("local_inscricao"),
  dataInscricao: date("data_inscricao"),
  registroTm: text("registro_tm"),
  apoliceDpem: text("apolice_dpem"),
  validadeDpem: date("validade_dpem"),
  tipoPropulsao: text("tipo_propulsao"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const motores = pgTable("motores", {
  id: uuid("id").primaryKey().defaultRandom(),
  embarcacaoId: uuid("embarcacao_id")
    .notNull()
    .references(() => embarcacoes.id, { onDelete: "cascade" }),
  ordem: integer("ordem").notNull().default(1),
  marca: text("marca"),
  potencia: text("potencia"),
  numeroSerie: text("numero_serie"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const aquisicoes = pgTable("aquisicoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  embarcacaoId: uuid("embarcacao_id")
    .notNull()
    .references(() => embarcacoes.id, { onDelete: "cascade" }),
  numeroNf: text("numero_nf"),
  dataVenda: date("data_venda"),
  local: text("local"),
  vendedor: text("vendedor"),
  cpfCnpjVendedor: text("cpf_cnpj_vendedor"),
  valor: numeric("valor"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const habilitacoes = pgTable("habilitacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  tipo: habilitacaoTipo("tipo").notNull(),
  numero: text("numero"),
  dataEmissao: date("data_emissao"),
  categoria: text("categoria"),
  validade: date("validade"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const obras = pgTable("obras", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "restrict" }),
  // Identificação da obra (NORMAM-303, requerimento 2-B-1)
  idObra: text("id_obra"),
  titulo: text("titulo"),
  tipoObra: text("tipo_obra"),
  itemObraCodigo: text("item_obra_codigo"),
  descricaoObra: text("descricao_obra"),
  normamDeUso: text("normam_de_uso"),
  cpDlAg: text("cp_dl_ag"),
  respTecnico: text("resp_tecnico"),
  nCrea: text("n_crea"),
  // Localização
  rioLocalizado: text("rio_localizado"),
  distanciaRioKm: numeric("distancia_rio_km"),
  areaNavegacao: text("area_navegacao"),
  atividade: text("atividade"),
  pontoA: text("ponto_a"),
  pontoB: text("ponto_b"),
  pontoC: text("ponto_c"),
  pontoD: text("ponto_d"),
  // Dimensões e estrutura (Memorial Descritivo)
  comprimento: numeric("comprimento"),
  largura: numeric("largura"),
  areaConstruida: numeric("area_construida"),
  apoiadoSobre: text("apoiado_sobre"),
  estruturaCober: text("estrutura_cober"),
  matEstrutura: text("mat_estrutura"),
  matParedes: text("mat_paredes"),
  matPiso: text("mat_piso"),
  matCobertura: text("mat_cobertura"),
  listaMatConstrucaoDimensoes: text("lista_mat_construcao_dimensoes"),
  fontEnergia: text("font_energia"),
  banheiroSn: obraSimNao("banheiro_sn"),
  piaOuOutros: text("pia_ou_outros"),
  // Calados e deslocamento
  caladoCar: numeric("calado_car"),
  caladoLeve: numeric("calado_leve"),
  deslCar: numeric("desl_car"),
  deslLeve: numeric("desl_leve"),
  pesoAdicional: numeric("peso_adicional"),
  cargaSuportada: numeric("carga_suportada"),
  lotacaoMax: integer("lotacao_max"),
  // Salvatagem e tambores de flutuação
  coletes: integer("coletes"),
  boias: integer("boias"),
  matTambores: text("mat_tambores"),
  qntTambores: integer("qnt_tambores"),
  volumeTambores: numeric("volume_tambores"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const servicos = pgTable("servicos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  valor: numeric("valor"),
  custo: numeric("custo"),
  categoria: servicoCategoria("categoria").notNull().default("despachante"),
  norma: text("norma"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const catalogoItens = pgTable("catalogo_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: catalogoTipo("tipo").notNull(),
  descricao: text("descricao").notNull(),
  marca: text("marca"),
  modelo: text("modelo"),
  preco: numeric("preco"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const salvatagemItens = pgTable("salvatagem_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  embarcacaoId: uuid("embarcacao_id")
    .notNull()
    .references(() => embarcacoes.id, { onDelete: "cascade" }),
  item: text("item").notNull(),
  quantidade: integer("quantidade").notNull().default(1),
  validade: date("validade"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const arquivos = pgTable("arquivos", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  processoId: uuid("processo_id").references(() => processos.id, { onDelete: "set null" }),
  requisitoId: uuid("requisito_id").references(() => requisitosDocumento.id, {
    onDelete: "set null",
  }),
  tipo: text("tipo").notNull(),
  nomeOriginal: text("nome_original").notNull(),
  caminho: text("caminho").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const requisitosDocumento = pgTable("requisitos_documento", {
  id: uuid("id").primaryKey().defaultRandom(),
  servicoId: uuid("servico_id")
    .notNull()
    .references(() => servicos.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  obrigatorio: boolean("obrigatorio").notNull().default(true),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const modelosDocumento = pgTable("modelos_documento", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  categoria: text("categoria"),
  norma: text("norma"),
  servicoId: uuid("servico_id").references(() => servicos.id, { onDelete: "set null" }),
  arquivoCaminho: text("arquivo_caminho").notNull(),
  campos: jsonb("campos").notNull().$type<string[]>(),
  obrigatorio: boolean("obrigatorio").notNull().default(false),
  duasVias: boolean("duas_vias").notNull().default(false),
  /** Quando preenchido, o documento gerado ganha vencimento = hoje + N meses. */
  validadeMeses: integer("validade_meses"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const processos = pgTable("processos", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "restrict" }),
  embarcacaoId: uuid("embarcacao_id").references(() => embarcacoes.id, {
    onDelete: "set null",
  }),
  servicoId: uuid("servico_id")
    .notNull()
    .references(() => servicos.id, { onDelete: "restrict" }),
  responsavelId: uuid("responsavel_id").references(() => usuarios.id, {
    onDelete: "set null",
  }),
  status: processoStatus("status").notNull().default("aberto"),
  numeroProtocolo: text("numero_protocolo"),
  dataProtocolo: date("data_protocolo"),
  protocoloEscaneadoCaminho: text("protocolo_escaneado_caminho"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const documentosGerados = pgTable("documentos_gerados", {
  id: uuid("id").primaryKey().defaultRandom(),
  modeloId: uuid("modelo_id")
    .notNull()
    .references(() => modelosDocumento.id, { onDelete: "restrict" }),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "restrict" }),
  embarcacaoId: uuid("embarcacao_id").references(() => embarcacoes.id, {
    onDelete: "set null",
  }),
  processoId: uuid("processo_id").references(() => processos.id, { onDelete: "set null" }),
  dadosPreenchidos: jsonb("dados_preenchidos").notNull().$type<Record<string, string>>(),
  docxCaminho: text("docx_caminho").notNull(),
  pdfCaminho: text("pdf_caminho"),
  status: documentoStatus("status").notNull().default("gerado"),
  vencimento: date("vencimento"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const orcamentos = pgTable("orcamentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  numero: text("numero").notNull().unique(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "restrict" }),
  servicoId: uuid("servico_id")
    .notNull()
    .references(() => servicos.id, { onDelete: "restrict" }),
  embarcacaoId: uuid("embarcacao_id").references(() => embarcacoes.id, {
    onDelete: "set null",
  }),
  vendedorId: uuid("vendedor_id").references(() => usuarios.id, { onDelete: "set null" }),
  valor: numeric("valor").notNull(),
  status: orcamentoStatus("status").notNull().default("pendente"),
  validoAte: date("valido_ate"),
  pdfCaminho: text("pdf_caminho"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const servicosContratados = pgTable("servicos_contratados", {
  id: uuid("id").primaryKey().defaultRandom(),
  orcamentoId: uuid("orcamento_id").references(() => orcamentos.id, { onDelete: "set null" }),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "restrict" }),
  servicoId: uuid("servico_id")
    .notNull()
    .references(() => servicos.id, { onDelete: "restrict" }),
  processoId: uuid("processo_id").references(() => processos.id, { onDelete: "set null" }),
  vendedorId: uuid("vendedor_id").references(() => usuarios.id, { onDelete: "set null" }),
  valor: numeric("valor").notNull(),
  dataContratacao: date("data_contratacao").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const pagamentos = pgTable("pagamentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  servicoContratadoId: uuid("servico_contratado_id")
    .notNull()
    .references(() => servicosContratados.id, { onDelete: "cascade" }),
  valor: numeric("valor").notNull(),
  /** Quando a cobrança vence. Null = registro avulso de algo já pago. */
  dataVencimento: date("data_vencimento"),
  dataPagamento: date("data_pagamento"),
  formaPagamento: text("forma_pagamento"),
  status: pagamentoStatus("status").notNull().default("pendente"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const agendaEventos = pgTable("agenda_eventos", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id").references(() => clientes.id, { onDelete: "cascade" }),
  processoId: uuid("processo_id").references(() => processos.id, { onDelete: "set null" }),
  titulo: text("titulo").notNull(),
  dataHora: timestamp("data_hora").notNull(),
  tipo: eventoTipo("tipo").notNull().default("compromisso"),
  status: eventoStatus("status").notNull().default("pendente"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const materiaisEstudo = pgTable("materiais_estudo", {
  id: uuid("id").primaryKey().defaultRandom(),
  servicoId: uuid("servico_id")
    .notNull()
    .references(() => servicos.id, { onDelete: "cascade" }),
  categoria: text("categoria"),
  titulo: text("titulo").notNull(),
  tipo: materialTipo("tipo").notNull().default("pdf"),
  url: text("url").notNull(),
  ordem: integer("ordem").notNull().default(1),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const progressoEstudo = pgTable("progresso_estudo", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => materiaisEstudo.id, { onDelete: "cascade" }),
  concluido: boolean("concluido").notNull().default(false),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "set null" }),
  usuarioNome: text("usuario_nome"),
  acao: auditAcao("acao").notNull(),
  entidade: text("entidade").notNull(),
  entidadeId: text("entidade_id"),
  detalhes: text("detalhes"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const assinaturas = pgTable("assinaturas", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentoId: uuid("documento_id")
    .notNull()
    .references(() => documentosGerados.id, { onDelete: "cascade" }),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  status: assinaturaStatus("status").notNull().default("pendente"),
  hash: text("hash"),
  ip: text("ip"),
  assinadoEm: timestamp("assinado_em"),
  expiraEm: timestamp("expira_em").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const despesas = pgTable("despesas", {
  id: uuid("id").primaryKey().defaultRandom(),
  descricao: text("descricao").notNull(),
  valor: numeric("valor").notNull(),
  categoria: despesaCategoria("categoria").notNull().default("variavel"),
  data: date("data").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const templatesEmail = pgTable("templates_email", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  tipo: text("tipo").notNull(),
  assunto: text("assunto").notNull(),
  corpo: text("corpo").notNull(),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const enviosEmail = pgTable("envios_email", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id").references(() => clientes.id, { onDelete: "set null" }),
  templateId: uuid("template_id").references(() => templatesEmail.id, { onDelete: "set null" }),
  orcamentoId: uuid("orcamento_id").references(() => orcamentos.id, { onDelete: "set null" }),
  destinatario: text("destinatario").notNull(),
  assunto: text("assunto").notNull(),
  corpo: text("corpo").notNull(),
  status: envioStatus("status").notNull().default("enviado"),
  erro: text("erro"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const lembretes = pgTable("lembretes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id").references(() => clientes.id, { onDelete: "cascade" }),
  mensagem: text("mensagem").notNull(),
  dataLembrete: date("data_lembrete").notNull(),
  resolvido: boolean("resolvido").notNull().default(false),
  origem: text("origem").notNull().default("manual"),
  referenciaTipo: text("referencia_tipo"),
  referenciaId: uuid("referencia_id"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const solicitacoes = pgTable("solicitacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: solicitacaoTipo("tipo").notNull(),
  token: text("token").notNull().unique(),
  status: solicitacaoStatus("status").notNull().default("pendente"),
  clienteId: uuid("cliente_id").references(() => clientes.id, { onDelete: "cascade" }),
  processoId: uuid("processo_id").references(() => processos.id, { onDelete: "cascade" }),
  orcamentoId: uuid("orcamento_id").references(() => orcamentos.id, { onDelete: "cascade" }),
  embarcacaoId: uuid("embarcacao_id").references(() => embarcacoes.id, { onDelete: "cascade" }),
  expiraEm: timestamp("expira_em").notNull(),
  concluidaEm: timestamp("concluida_em"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// LMS (Área de Estudos) — migração 0018
// ---------------------------------------------------------------------------

export const alunos = pgTable("alunos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  telefone: text("telefone"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const materias = pgTable("materias", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  icone: text("icone"),
  ordem: integer("ordem").notNull().default(1),
  ativo: boolean("ativo").notNull().default(true),
  precoCentavos: integer("preco_centavos"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const capitulos = pgTable("capitulos", {
  id: uuid("id").primaryKey().defaultRandom(),
  materiaId: uuid("materia_id")
    .notNull()
    .references(() => materias.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  ordem: integer("ordem").notNull().default(1),
  status: statusPublicacao("status").notNull().default("rascunho"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const aulas = pgTable("aulas", {
  id: uuid("id").primaryKey().defaultRandom(),
  capituloId: uuid("capitulo_id")
    .notNull()
    .references(() => capitulos.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  tipoConteudo: tipoConteudoAula("tipo_conteudo").notNull().default("texto"),
  corpoHtml: text("corpo_html"),
  videoUrl: text("video_url"),
  videoArquivo: text("video_arquivo"),
  ordem: integer("ordem").notNull().default(1),
  duracaoMinutos: integer("duracao_minutos"),
  status: statusPublicacao("status").notNull().default("rascunho"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const materiaisApoio = pgTable("materiais_apoio", {
  id: uuid("id").primaryKey().defaultRandom(),
  capituloId: uuid("capitulo_id").references(() => capitulos.id, { onDelete: "cascade" }),
  aulaId: uuid("aula_id").references(() => aulas.id, { onDelete: "cascade" }),
  tipo: tipoMaterialApoio("tipo").notNull().default("upload"),
  titulo: text("titulo").notNull(),
  url: text("url").notNull(),
  ordem: integer("ordem").notNull().default(1),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const provas = pgTable("provas", {
  id: uuid("id").primaryKey().defaultRandom(),
  capituloId: uuid("capitulo_id").references(() => capitulos.id, { onDelete: "cascade" }),
  materiaId: uuid("materia_id").references(() => materias.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  notaMinima: integer("nota_minima").notNull().default(60),
  status: statusPublicacao("status").notNull().default("rascunho"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const questoes = pgTable("questoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  provaId: uuid("prova_id")
    .notNull()
    .references(() => provas.id, { onDelete: "cascade" }),
  enunciado: text("enunciado").notNull(),
  tipo: tipoQuestao("tipo").notNull(),
  ordem: integer("ordem").notNull().default(1),
  pontos: integer("pontos").notNull().default(1),
});

export const opcoesQuestao = pgTable("opcoes_questao", {
  id: uuid("id").primaryKey().defaultRandom(),
  questaoId: uuid("questao_id")
    .notNull()
    .references(() => questoes.id, { onDelete: "cascade" }),
  texto: text("texto").notNull(),
  parTexto: text("par_texto"),
  correta: boolean("correta").notNull().default(false),
  ordem: integer("ordem").notNull().default(1),
});

export const matriculas = pgTable(
  "matriculas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    alunoId: uuid("aluno_id")
      .notNull()
      .references(() => alunos.id, { onDelete: "cascade" }),
    materiaId: uuid("materia_id")
      .notNull()
      .references(() => materias.id, { onDelete: "cascade" }),
    liberadoEm: timestamp("liberado_em").notNull().defaultNow(),
    expiraEm: timestamp("expira_em"),
    status: statusAcessoAluno("status").notNull().default("ativo"),
    origem: text("origem").notNull().default("manual"),
    pagamentoId: text("pagamento_id"),
    criadoEm: timestamp("criado_em").notNull().defaultNow(),
  },
  (table) => [unique().on(table.alunoId, table.materiaId)]
);

export const progressoAula = pgTable(
  "progresso_aula",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    alunoId: uuid("aluno_id")
      .notNull()
      .references(() => alunos.id, { onDelete: "cascade" }),
    aulaId: uuid("aula_id")
      .notNull()
      .references(() => aulas.id, { onDelete: "cascade" }),
    concluida: boolean("concluida").notNull().default(false),
    concluidaEm: timestamp("concluida_em"),
  },
  (table) => [unique().on(table.alunoId, table.aulaId)]
);

export const tentativasProva = pgTable("tentativas_prova", {
  id: uuid("id").primaryKey().defaultRandom(),
  alunoId: uuid("aluno_id")
    .notNull()
    .references(() => alunos.id, { onDelete: "cascade" }),
  provaId: uuid("prova_id")
    .notNull()
    .references(() => provas.id, { onDelete: "cascade" }),
  iniciadaEm: timestamp("iniciada_em").notNull().defaultNow(),
  finalizadaEm: timestamp("finalizada_em"),
  notaObtida: integer("nota_obtida"),
  status: statusTentativaProva("status").notNull().default("em_andamento"),
});

export const respostasAluno = pgTable("respostas_aluno", {
  id: uuid("id").primaryKey().defaultRandom(),
  tentativaId: uuid("tentativa_id")
    .notNull()
    .references(() => tentativasProva.id, { onDelete: "cascade" }),
  questaoId: uuid("questao_id")
    .notNull()
    .references(() => questoes.id, { onDelete: "cascade" }),
  opcaoEscolhidaId: uuid("opcao_escolhida_id").references(() => opcoesQuestao.id, {
    onDelete: "set null",
  }),
  textoResposta: text("texto_resposta"),
  paresResposta: jsonb("pares_resposta").$type<{ esquerdaId: string; direitaTexto: string }[]>(),
  opcoesEscolhidas: jsonb("opcoes_escolhidas").$type<string[]>(),
  correta: boolean("correta"),
  pontosObtidos: integer("pontos_obtidos"),
});

export const pedidosPagamento = pgTable("pedidos_pagamento", {
  id: uuid("id").primaryKey().defaultRandom(),
  alunoId: uuid("aluno_id")
    .notNull()
    .references(() => alunos.id, { onDelete: "cascade" }),
  materiaId: uuid("materia_id")
    .notNull()
    .references(() => materias.id, { onDelete: "cascade" }),
  valorCentavos: integer("valor_centavos").notNull(),
  status: statusPedidoPagamento("status").notNull().default("pendente"),
  mercadopagoPreferenceId: text("mercadopago_preference_id"),
  mercadopagoPaymentId: text("mercadopago_payment_id"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em"),
});
