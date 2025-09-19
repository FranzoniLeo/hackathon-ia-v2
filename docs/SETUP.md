# 🚀 Setup do Projeto - Kanban de Ideias

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (ou yarn/pnpm)
- Conta no **Supabase**

## ⚙️ Configuração do Ambiente

### 1. **Instalar dependências**
```bash
npm install
```

### 2. **Configurar variáveis de ambiente**
```bash
# Copiar o template
cp .env.example .env

# Editar o arquivo .env com suas credenciais
nano .env  # ou seu editor preferido
```

### 3. **Configurar Supabase**

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Crie um novo projeto ou use um existente
3. Vá em **Settings > API**
4. Copie as credenciais para o arquivo `.env`:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

### 4. **Executar o projeto**
```bash
# Modo desenvolvimento
npm run dev

# O projeto estará disponível em: http://localhost:5173
```

## 🗄️ Configuração do Banco de Dados

O projeto usa as seguintes tabelas (conforme especificado no prompt inicial):
- `profiles`
- `columns` 
- `ideas`
- `votes`
- `comments`

Para configurar o banco, consulte os arquivos na pasta `supabase/` ou importe o schema necessário.

## 🔧 Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview da build
npm run lint       # Verificar código
```

## 🚨 Troubleshooting

### Erro de CORS / Supabase
- Verifique se as URLs estão corretas no `.env`
- Confirme que as policies RLS estão configuradas

### Porta já em uso
```bash
npm run dev -- --port 3000  # Usar porta diferente
```

### Dependencies issues
```bash
rm -rf node_modules package-lock.json
npm install
```

---

📚 **Para mais informações**, consulte a documentação completa na pasta `docs/`
