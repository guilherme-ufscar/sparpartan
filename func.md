# Propostas de Melhoria — Sparapan Solução Naval

> Baseado no mapeamento de funcionalidades atuais ([funcionalidades.md](./funcionalidades.md)). Organizado por impacto: automações de fluxo, funcionalidades novas, e melhorias de UX/gestão.

## 1. Automação de Documentos e Processos (maior impacto)

Hoje o fluxo é manual em várias etapas: cadastrar cliente → cadastrar embarcação → criar processo → gerar documento → enviar email → cobrar vencimento. Isso deveria ser um pipeline conectado.

- **Fluxo único "Novo Atendimento"**: um wizard que, a partir de um cliente (novo ou existente), encadeia automaticamente: seleção de embarcação → seleção de serviço → geração do processo → geração dos documentos (com anexos corretos por norma) → orçamento → envio por e-mail — tudo em uma tela só, em vez de 5 páginas separadas (GeradorDocumentos, Processos, Orcamentos, EnviarEmails).
- **Geração automática de documento ao criar processo**: hoje "Processos" e "GeradorDocumentos" são desacoplados (o processo tem botão "Gerar documentos" separado). Unificar: ao criar um processo, já oferecer a geração dos documentos daquela norma.
- **Preenchimento automático de anexos por norma**: já existe lógica de "2-B/2-C/2-G sempre incluídos" — expandir para que, ao escolher Norma + tipo de serviço, o sistema monte a lista de anexos obrigatórios automaticamente (hoje parece fixo/manual), evitando erro humano na escolha de quais anexos (Procuração, 2-H, 2-K) incluir.
- **Status de processo automático**: mover processo de "Em análise" → "Aguardando documento" → "Documento pronto" → "Enviado" → "Concluído" automaticamente conforme as ações acontecem (documento gerado, email enviado, pagamento confirmado), em vez de status manual.

## 2. Vencimento de Documentos → Alertas Proativos

A tela `/VencimentoDocumentos` hoje é passiva (você precisa entrar para ver). Isso é o tipo de coisa que gera perda de clientes por documento vencido.

- **Notificações automáticas**: e-mail/WhatsApp automático para o cliente 30/15/7 dias antes do vencimento de um documento (habilitação, registro, seguro DPEM etc.), disparado por um job agendado, sem intervenção manual.
- **Alerta no dashboard (Home)**: já existe o card "Vencimentos 30 dias" — torná-lo clicável direto para a lista filtrada e adicionar destaque visual (vermelho/laranja) quando houver itens vencidos, não só "próximos".
- **Renovação em 1 clique**: a partir de um documento vencendo, botão "Gerar renovação" que já pré-preenche um novo processo com o mesmo cliente/embarcação/serviço de renovação.

## 3. Integração Agenda ↔ Processos ↔ Lembretes

Atualmente Agenda, Lembretes e Pendentes parecem sistemas paralelos com dados sobrepostos (cliente, serviço, data).

- **Lembretes gerados automaticamente** a partir de processos/orçamentos pendentes de pagamento, em vez de "Adicionar Lembrete" manual.
- **Eventos de agenda automáticos**: ao agendar um processo (Agenda já tem "Processos Agendados"), criar automaticamente o compromisso na agenda do dia — hoje parecem ser cadastrados em telas separadas.
- **Confirmação automática de compromissos**: envio de lembrete por e-mail/WhatsApp 1 dia antes de um compromisso agendado.

## 4. E-mail mais robusto e rastreável

`/EnviarEmails` hoje é só disparo simples. Dá pra torná-lo um canal de comunicação de verdade, sem depender de WhatsApp.

- **Templates de e-mail reutilizáveis** (orçamento, lembrete de vencimento, confirmação de agendamento, cobrança), com variáveis automáticas (nome do cliente, embarcação, valor, data), em vez de digitar assunto/mensagem toda vez.
- **Histórico de envios por cliente**: registrar quando um e-mail foi enviado, para qual serviço/processo, e se foi aberto (tracking simples de abertura), visível na aba do `ClienteDetalhes`.
- **Envio automático em gatilhos**: orçamento gerado → e-mail automático; documento pronto → e-mail automático com anexo; vencimento próximo → e-mail automático (ver §2). Reduz o "Enviar Emails" manual a exceção, não regra.
- **Anexar PDF automaticamente**: ao enviar e-mail de orçamento/documento, já anexar o PDF gerado, sem precisar baixar e reanexar manualmente.

## 5. Financeiro (Gráfico de Vendas está subutilizado)

Hoje é só visualização (cards + gráfico). Falta a camada de controle financeiro real.

- **Fluxo de caixa**: entradas (vendas) x saídas (custos — já existe campo "Custo" em Serviços, mas não é usado em nenhum relatório).
- **Margem por serviço/cliente/colaborador**: usar o campo "Custo" x "Valor" para calcular lucro real, não só faturamento bruto.
- **Contas a receber**: a aba "Pagamentos" em Pendentes tem status "Não Pago" — conectar isso ao Gráfico de Vendas como "a receber" vs "recebido", com data de vencimento de cobrança.
- **Exportação financeira** (CSV/Excel) para contador.

## 6. Cliente 360°

`ClienteDetalhes` já tem abas Embarcações/Documentos/Vendas — dá pra ir além:

- **Timeline de atendimento**: histórico cronológico único (documentos gerados, e-mails enviados, pagamentos, compromissos) em vez de abas separadas.
- **Score/tag de cliente**: ex. "documentação em dia", "pendência de pagamento", "aniversariante do mês" — visível direto na listagem `/Clientes` como badge, sem precisar entrar no detalhe.
- **Indicações**: já existe campo "Indicado por" no cadastro — criar relatório de quem mais indica clientes (útil para programa de indicação/comissão).

## 7. Área de Estudos → Escola Náutica como produto

A Área de Estudos hoje é só um repositório de PDFs por categoria (Arrais Amador etc.). Para quem também vende curso de habilitação náutica:

- Progresso do aluno (quais materiais já acessou), não só "visualizar/compartilhar".
- Simulado/quiz por categoria com nota, ligado ao processo de habilitação do cliente.
- Vincular materiais liberados ao serviço contratado (ex.: cliente que contratou "Habilitação Arrais" só vê material de Arrais).

## 8. Busca e Filtros Globais

Cada tela tem busca própria e desconectada.

- **Busca global** no topo (sidebar/header) que busca cliente, embarcação, processo ou documento ao mesmo tempo, com atalho de teclado (ex. `Ctrl+K`).
- **Filtros salvos**: em telas com muitos filtros (Processos, Pendentes, VencimentoDocumentos), permitir salvar uma combinação de filtro como view padrão.

## 9. Gestão Multiusuário / Colaboradores

O Gráfico de Vendas já menciona "Vendas por Colaborador", indicando que há mais de um usuário no sistema, mas não há tela de gestão de equipe no mapeamento.

- Tela de **Colaboradores/Equipe**: cadastro de usuários, permissões (quem pode excluir orçamento, quem só visualiza), atribuição de clientes/processos por responsável.
- **Log de auditoria**: quem criou/editou/excluiu o quê e quando (importante já que existem botões de "Excluir" em Orçamentos e Processos sem histórico visível).

## 10. Qualidade de vida / UX pequenas mas de alto retorno

- **Botão "Excluir" com confirmação clara** e, idealmente, soft-delete (lixeira recuperável por 30 dias) em vez de exclusão definitiva — hoje Orçamentos e Processos têm exclusão direta.
- **Validação de CPF/CEP em tempo real** no CadastrarCliente, com preenchimento automático de endereço via CEP (integração ViaCEP).
- **Upload de documentos do cliente** (RG, CPF, CRLV da embarcação) direto na ficha do cliente, junto da Pasta de Arquivos, em vez de arquivo genérico solto.
- **Modo escuro** aproveitando a aba "Aparência" em Configurações, que hoje só mexe em fonte/tamanho.
- **Exportação em massa** (PDF/Excel) das listagens (Clientes, Orçamentos, Processos) para relatórios externos.
- **Dashboard por período**: hoje Home mostra só "hoje/próximos 30 dias" fixos — permitir escolher período (semana, mês, trimestre) nos cards.

## 11. Portal do Cliente (self-service)

Hoje tudo passa pela equipe Sparapan. Um portal simples (login por CPF/e-mail) reduziria trabalho manual repetitivo:

- Cliente consulta status do próprio processo/documento sem precisar ligar/perguntar.
- Cliente baixa segunda via de orçamento/documento já gerado.
- Cliente vê data de vencimento dos próprios documentos e pode solicitar renovação com 1 clique (cai como pendência para a equipe tratar).
- Reduz drasticamente o volume de "cadê meu documento?" que hoje consome tempo da equipe.

## 12. Assinatura Digital de Documentos

Documentos náuticos (procurações, termos) hoje provavelmente são impressos/assinados fisicamente ou por fora do sistema.

- Integração com assinatura eletrônica (ex. D4Sign, Clicksign, ou até um fluxo simples de aceite com token por e-mail) direto no fluxo do Gerador de Documentos.
- Status do documento passa a incluir "Aguardando assinatura" / "Assinado", eliminando papel e idas/vindas por e-mail.

## 13. OCR e leitura automática de documentos

No cadastro de cliente/embarcação, muito dado (CPF, RG, número de registro da embarcação) vem de um documento físico ou PDF que o cliente manda.

- Upload de foto/PDF do documento (RG, CRLV) com extração automática dos campos via OCR, pré-preenchendo o formulário de cadastro em vez de digitação manual.
- Reduz erro de digitação e tempo de cadastro, que hoje é 100% manual em `/CadastrarCliente`.

## 14. Checklist de conformidade por norma

Cada norma (NORMAM 211, 212 etc.) exige um conjunto específico de documentos/anexos para o processo ser aprovado pela Marinha.

- Checklist visual por processo mostrando exatamente o que falta (ex. "falta: comprovante de residência, falta: 2-H assinado") antes de permitir enviar/protocolar.
- Isso evita retrabalho quando a Marinha devolve um processo por documentação incompleta — hoje esse controle parece não existir de forma explícita.

## 15. Relatórios e Business Intelligence

Além do Gráfico de Vendas, faltam relatórios operacionais que ajudam a gerir a empresa:

- Tempo médio de conclusão de processo (do cadastro até documento entregue), por tipo de serviço e por norma — identifica gargalos.
- Taxa de conversão orçamento → serviço contratado (hoje `/Orcamentos` e `/ServicosContratados` são desconectados, sem indicar quantos orçamentos viram venda).
- Ranking de serviços mais vendidos / mais lucrativos (cruzando com o campo "Custo").
- Relatório de sazonalidade (ex. picos de renovação de habilitação em certos meses) para planejar capacidade da equipe.

## 16. Mobile / PWA

Uso em campo (vistoria de embarcação, atendimento fora do escritório) provavelmente acontece pelo celular.

- Transformar o sistema em PWA instalável, com camadas otimizadas para toque (formulários simplificados, câmera nativa para fotos de embarcação/documento).
- Modo offline básico para cadastro de cliente/embarcação em local sem sinal, sincronizando depois.

## Priorização sugerida

| Prioridade | Item | Motivo |
|---|---|---|
| Alta | Alertas automáticos de vencimento (§2) | Risco direto de perda de cliente/documento vencido |
| Alta | Fluxo único "Novo Atendimento" (§1) | Reduz erro humano e tempo operacional em toda operação diária |
| Alta | Checklist de conformidade por norma (§14) | Evita retrabalho/reprovação de processo pela Marinha |
| Alta | E-mail automático em gatilhos (§4) | Canal já existente, só falta automatizar o disparo |
| Média | Financeiro/contas a receber (§5) | Visibilidade de caixa, hoje só vaidade métrica |
| Média | Cliente 360° (§6) | Melhora atendimento, mas não bloqueia operação |
| Média | Portal do Cliente (§11) | Reduz carga operacional da equipe a médio prazo |
| Média | Relatórios/BI (§15) | Ajuda gestão, não bloqueia operação diária |
| Baixa | OCR de documentos (§13), Assinatura digital (§12) | Ganho real, mas exige integração externa/custo |
| Baixa | Área de Estudos gamificada (§7), busca global (§8) | Nice-to-have, não crítico |
| Baixa | Multiusuário/auditoria (§9), Mobile/PWA (§16) | Depende do tamanho da equipe e uso em campo |
