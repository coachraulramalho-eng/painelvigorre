# Vigorre ADM™

Painel central de gestão da Vigorre - Inteligência, Tecnologia e Gestão Estratégica.

## 🚀 Tecnologias

- **Next.js 16** (Active LTS)
- **Node.js 24.x**
- **PostgreSQL** (Supabase)
- **Prisma ORM**
- **Tailwind CSS**
- **NextAuth.js**

## 📦 Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/painelvigorre.git
cd painelvigorre

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Atualizar DATABASE_URL no .env.local

# Rodar migrations
npx prisma db push

# Rodar seed (cria ADM Master)
npm run db:seed

# Iniciar desenvolvimento
npm run dev
