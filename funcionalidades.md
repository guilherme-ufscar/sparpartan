# Funcionalidades — Sparapan Solução Naval

> Mapeamento extraído por navegação real (Playwright) no sistema em https://sparapan.base44.app/, autenticado como usuário Tamires Galiano. Nenhuma ação de criação, edição ou exclusão foi executada — apenas navegação e leitura.

Sistema web de gestão para empresa de despachante/escola náutica: clientes, embarcações, serviços, documentos náuticos (normas NORMAM), orçamentos, agenda e financeiro.

## Navegação (Sidebar)

Home · Minha Agenda · Orçamentos · Lembretes · **Clientes** (Ver Clientes, Cadastrar Cliente, Aniversariantes) · Embarcações · Processos · Pendentes · **Criar Documentos** (Ver Documentos + atalhos por categoria: Termo de Construção, Embarcação Esporte e Recreio, Relatório de Verificação-PMC, Embarcação Comercial, Obras, Escola Náutica) · **Serviços** (Ver Serviços, Cadastrar Serviço) · Pasta de Arquivos · Gráfico de Vendas · **Gerador de Documentos** (Novo Documento, Ver Documentos, Gerenciar Modelos) · Enviar Emails · Vencimento Docs · Área de Estudos · Configurações. Rodapé com perfil do usuário logado e botão "Sair".

## Home

Dashboard com 6 cards-contador clicáveis (Clientes, Embarcações, Documentos, Pendências, Agenda Hoje, Vencimentos 30 dias), seção "Agenda de Hoje", "Próximos Vencimentos" e "Ações Rápidas" (Novo Cliente, Novo Documento, Agendar, Área de Estudos).

## Agenda (/Agenda)

Calendário mensal com navegação, painel do dia, botão "Novo Evento"; seção "Processos Agendados" (tabela: Representante Legal, Data/Hora, Clientes e Serviços, Status, Ações) com botões "Baixar PDF" / "Novo Processo".

## Aniversariantes (/Aniversariantes)

Abas por mês (Jan–Dez) com contadores; conteúdo do mês selecionado lista os aniversariantes.

## Área de Estudos (/AreaEstudos)

Busca + filtro por categoria; materiais agrupados por categoria (ex.: "Arrais Amador" → "Apostila Sparapan", PDF, botões Visualizar/Compartilhar).

## Arquivos (/Arquivos)

Pasta de arquivos com contador ("X arquivos"), botões "Anexar Protocolo" / "Novo Arquivo", busca + filtro de categoria.

## Cadastrar Cliente (/CadastrarCliente)

Formulário completo:
- **Dados Pessoais**: Nome*, CPF, RG, Órgão Emissor, Data de Emissão, Data de Nascimento, Tipo
- **Contato**: E-mail, Telefone*
- **Endereço**: CEP, Rua, Número, Complemento, Bairro, Cidade, Estado
- **Serviços Contratados**
- **Referências**: Despachante, Indicado por
- **Observações**

Botões: Cancelar / Cadastrar.

## Cadastrar Serviços (/CadastrarServicos)

Campos: Nome do Serviço*, Descrição, Valor*, Custo, Categoria (Despachante/Escola), switch "Serviço Ativo". Botões Cancelar/Cadastrar.

## Clientes (/Clientes)

Listagem de clientes cadastrados; tabela (Nome, Tipo, Contato, CPF, Cidade, Ações); busca + filtro; botão "Novo Cliente".

## Cliente Detalhes (/ClienteDetalhes)

Requer parâmetro `?id=` na URL (acessado a partir da listagem de Clientes). Header com nome/tipo/CPF, botão Editar; abas Embarcações / Documentos / Vendas (cada uma com contadores e botões de criação vinculados ao cliente).

## Configurações (/Configuracoes)

Abas:
- **Perfil**: nome/email somente leitura, telefone editável, botão "Salvar Perfil"
- **Aparência**: Fonte, Tamanho, botão "Aplicar Configurações"

## Criar Documentos (/CriarDocumentos)

Listagem de documentos cadastrados ("X documentos cadastrados"); tabela (Documento, Tipo, Cliente, Vencimento, Status, Ações); busca; suporta parâmetro `?categoria=` para filtrar por categoria de documento (atalhos do menu lateral).

## Editar Documento (/EditarDocumento)

Requer documento existente/ID válido (acessado a partir da listagem). Sem ID exibe "Documento não encontrado" + botão "Voltar ao Gerador".

## Embarcações (/Embarcacoes)

Listagem de embarcações cadastradas (cards com nome, tipo — ex.: Moto Aquática, Lancha —, proprietário, registro), botão "Nova Embarcação".

## Enviar Emails (/EnviarEmails)

Seleção múltipla de serviços/destinatários, campos Assunto* e Mensagem*, botão "Enviar Emails" (desabilitado até preenchimento obrigatório).

## Gerador de Documentos (/GeradorDocumentos)

Fluxo guiado: Cliente* → Embarcação (habilitada após seleção de cliente) → Serviço*; checkboxes de anexos opcionais (Procuração, Anexo 2-H, 2-K); anexos 2-B/2-C/2-G sempre incluídos automaticamente. Botão "Gerar Documento".

## Gerenciar Modelos (/GerenciarModelos)

Templates .docx organizados por norma em accordion (ex.: "Normam 211", "Normam 212"), cada um com modelos e ações Visualizar/Substituir/Desativar. Botão "Novo Modelo".

## Gráfico de Vendas (/GraficoVendas)

Cards financeiros do mês (faturamento etc.), gráfico de barras "Vendas por Mês", gráfico/lista "Vendas por Colaborador", tabela "Últimas Vendas". Botão "Nova Venda".

## Lembretes (/Lembretes)

Tabela (Ordem, Data, Contratante, Cliente, Serviço, Qtd, Valor Unitário, Valor Total, Status, Contato, Ações); botões "Baixar PDF" / "Adicionar Lembrete".

## Orçamentos (/Orcamentos)

Listagem de orçamentos (numeração no formato MMAAXXX, valores variados); tabela (Número, Cliente, Contratante, Data, Valor Total, Ações: Visualizar / Editar / Baixar PDF / Enviar Email / Excluir).

## Pendentes (/Pendentes)

Abas:
- **Pendências Gerais**: filtro por status
- **Pagamentos**: cards com status de pagamento (ex.: "Não Pago"), cliente, data de contratação

## Processos (/Processos)

Tabela de processos (Cliente, Embarcação, Serviço, Norma, Status, Data, Ações: Gerar documentos / Editar / Excluir); filtro por tipo de serviço.

## Serviços (/Servicos)

Catálogo de serviços cadastrados (ex.: Seguro DPEM AKAD comercial/normal, Renovação Habilitação, Arrais/Motonauta, Inscrições, Termo de Construção, Transferência), com preços e categorias (Despachante/Escola).

## Serviços Contratados (/ServicosContratados)

Contratos vinculados a clientes, tabela (Cliente, Serviço, Categoria, Status — ex.: "Em Andamento" —, Valor, Ações).

## Vencimento Documentos (/VencimentoDocumentos)

4 cards-filtro (Vencidos, Próx. 30 dias, 31-60 dias, Vigentes) + lista filtrável de documentos por vencimento.

## Ver Documentos (/VerDocumentos)

Listagem de documentos gerados ("X de Y documento(s)"); busca + filtro de tipo + filtro de data de criação.

---

## Observações gerais da arquitetura

- O sistema separa **Modelos** (.docx por norma) → **Processos** (associação cliente/embarcação/serviço) → **Documentos** gerados a partir dos processos.
- Distingue **Serviços** (catálogo de preços/categorias) de **Serviços Contratados** (contratos ativos vinculados a clientes).
- Fluxos de geração de documentos são baseados nas normas NORMAM (ex.: Normam 211, Normam 212) da Marinha do Brasil, condizente com o domínio de despachante náutico.
- Há integração de envio de e-mails, geração de PDF (orçamentos, lembretes, processos agendados) e gráficos financeiros (vendas por mês/colaborador).
