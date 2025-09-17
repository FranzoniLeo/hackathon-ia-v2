# 📌 Projeto - Kanban

## 🎯 Objetivo
Este projeto foi prospo durante um Hackathon.  
Ele consiste em um Kanban de Ideias, onde usuários podem propor ideias, votar, comentar e mover cards entre colunas.

## 🛠️ Stack
- **Frontend**: Next.js (React, TypeScript, Tailwind, shadcn/ui, dnd-kit, TanStack Query).
- **Backend**: API routes/Server Actions, Prisma/Postgres ou Supabase (DB + Auth + Realtime).
- **Auth**: Supabase Auth ou equivalente.
- **Realtime**: Supabase Realtime / WebSockets.
- **i18n**: PT-BR e EN.

## 📑 Regras principais
- Todos os usuários autenticados podem ver o board, criar cards, comentar e votar.
- Apenas o criador pode editar título/descrição de um card.
- Apenas o autor do comentário pode editar/excluir o próprio.
- Qualquer usuário pode mover cards entre colunas.
- Voto é único por card/usuário (toggle).

## 🔄 Funcionalidades obrigatórias
- Criar/editar/mover cards.
- Votos (contador por card).
- Comentários (CRUD).
- Busca (por título, criador, descrição).
- Filtro por coluna.
- Interface drag-and-drop.
- Atualizações em tempo real.
- Suporte multilíngue (PT-BR e EN).

## 🚀 Status atual
- [ ] Autenticação implementada.
- [ ] Drag-and-drop funcionando, mas com problema ao mover para colunas não vazias.
- [ ] Realtime parcialmente implementado.
- [ ] i18n inicial adicionado.

## ⚖️ Critérios de Avaliação (Hackathon)
1. Engenharia de prompt e qualidade da base gerada.
2. Qualidade e funcionalidade do produto final.
3. Criatividade em novas funcionalidades.
4. Organização e estruturação do projeto.

---
💡 **Instrução**:  
Use este arquivo como contexto sempre que for solicitado analisar, modificar ou implementar algo neste projeto.
