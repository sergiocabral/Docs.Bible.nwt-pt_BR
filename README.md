# 📖 Traduções da Bíblia

Projeto pessoal com Next.js e Antora para documentação e anotações.

## 🔧 Tecnologias

- [Next.js](https://nextjs.org) (App Router, autenticação com NextAuth)
- [React](https://react.dev)
- [Antora](https://antora.org) para documentação estática
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com) para deploy
- [Umami](https://umami.is) para analytics (injetado em `/public`)

## 📦 Scripts

```
# Geração da documentação Antora
npm run antora

# Desenvolvimento Next.js
npm run dev

# Build Next.js
npm run build

# Build completo para deploy com Antora + Next.js
npm run vercel-build

# Injeção do Umami na pasta /public
npm run inject-umami

# Injeção do loader na pasta /public/script.js
npm run inject-loader

# Injeção de ambos (Umami + Loader)
npm run inject

# Geração de navegação Antora com base nas pastas
npm run antora-factory-nav

# Geração do menu no layout com base nas pastas e .env
npm run antora-factory-menu

# Execução combinada: navegação + menu
npm run antora-factory
```

## ▶️ Desenvolvimento

1. Copie o `.env.example` para `.env.local` e configure as variáveis.
2. Execute o servidor: `npm run dev`
3. Acesse http://localhost:3000

## 🚀 Deploy

Recomenda-se o deploy via Vercel: `npm run vercel-build`

## 📁 Estrutura

- `/app`: frontend com Next.js
- `/docs/antora`: customização da Antora
- `/docs/components`: pastas das documentações
- `/public`: saída estática da Antora
