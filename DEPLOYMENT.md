# 📦 DEPLOYMENT - VIGORRE ADM™

## 1. PRÉ-REQUISITOS

- Node.js 24.x
- npm ou yarn
- Git
- Conta na Vercel (ou outro hosting)
- Conta no Supabase (para banco de dados)

## 2. CONFIGURAÇÃO DO BANCO DE DADOS (SUPABASE)

1. Criar projeto no Supabase
2. Obter a URL de conexão (DATABASE_URL e DIRECT_URL)
3. Adicionar no `.env.local`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
