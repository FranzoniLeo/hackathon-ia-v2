# 📋 Kanban de Ideias - Hackathon IA v2

## 🎯 Sobre o Projeto

Este projeto foi desenvolvido durante um Hackathon com foco em Inteligência Artificial. Trata-se de um **Kanban de Ideias** interativo e colaborativo, onde usuários podem propor ideias, votar, comentar e mover cards entre diferentes colunas de status.

O objetivo é criar uma plataforma onde equipes podem gerenciar suas ideias de forma visual e dinâmica, com atualizações em tempo real e uma interface moderna e intuitiva.

## ✨ Funcionalidades Principais

- **Gestão de Cards**: Criação, edição e movimentação de cards entre colunas
- **Sistema de Votação**: Cada usuário pode votar uma vez por card (sistema de toggle)
- **Comentários**: Sistema completo de CRUD para comentários em cada card
- **Busca Avançada**: Pesquisa por título, criador ou descrição
- **Filtros**: Filtragem por coluna específica
- **Drag & Drop**: Interface intuitiva de arrastar e soltar
- **Tempo Real**: Atualizações instantâneas para todos os usuários conectados
- **Multilíngue**: Suporte para Português (PT-BR) e Inglês (EN)

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js** - Framework React para aplicações web
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface moderna
- **dnd-kit** - Biblioteca para drag-and-drop
- **TanStack Query** - Gerenciamento de estado e cache

### Backend
- **API Routes/Server Actions** - Backend integrado ao Next.js
- **Prisma** - ORM para banco de dados
- **PostgreSQL** ou **Supabase** - Banco de dados

### Serviços
- **Supabase Auth** - Sistema de autenticação
- **Supabase Realtime** - Atualizações em tempo real
- **WebSockets** - Comunicação bidirecional

## 🔐 Regras de Negócio

- **Visualização**: Todos os usuários autenticados podem ver o board
- **Criação**: Qualquer usuário pode criar cards e comentar
- **Edição**: Apenas o criador pode editar título/descrição de um card
- **Comentários**: Apenas o autor pode editar/excluir seus próprios comentários
- **Movimentação**: Qualquer usuário pode mover cards entre colunas
- **Votação**: Um voto único por card/usuário (sistema de toggle)

## 🏆 Critérios de Avaliação (Hackathon)

1. **Engenharia de Prompt**: Qualidade da base de código gerada
2. **Funcionalidade**: Qualidade e completude do produto final
3. **Criatividade**: Implementação de funcionalidades inovadoras
4. **Organização**: Estruturação e organização do projeto

---

## 🤖 Desenvolvimento com IA

Este projeto foi otimizado para desenvolvimento assistido por IA (Cursor). O arquivo `.cursorrules` e `CONTEXT.md` garantem que a IA sempre tenha o contexto completo do projeto.

---

## 📚 Documentação

- 🚀 **Setup e instalação**: [docs/SETUP.md](./docs/SETUP.md) - Guia completo para executar o projeto
- 📄 **Informações técnicas**: [TECHNICAL.md](./TECHNICAL.md) - Detalhes sobre desenvolvimento e deploy
- 📋 **Contexto do projeto**: [CONTEXT.md](./CONTEXT.md) - Especificações técnicas e funcionais  
- 📁 **Documentação completa**: [docs/](./docs/) - Prompt inicial, instruções do hackathon e mais
