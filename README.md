# 📖 Tradução da Bíblia: Tradução do Novo Mundo da Bíblia Sagrada (nwt, pt_BR, 2015)

Este repositório pode ser acessado online no endereço: https://nwt-pt-br.bible.raciocinios.com.br/

---

Projeto pessoal com Next.js e Antora para documentação e anotações.

## 🔧 Tecnologias

- [Next.js](https://nextjs.org) para a aplicação
- [Antora](https://antora.org) para gerar documentação AsciiDoc como conteúdo web estático

## 📦 Scripts

```
# Geração da documentação Antora
npm run antora

# Desenvolvimento Next.js
npm run dev

# Build completo para deploy com Antora + Next.js
npm run vercel-build

# Inicia a aplicação após o build.
npm start
```

## ▶️ Desenvolvimento

1. Copie o `.env.example` para `.env.local` e configure as variáveis.
2. Execute o servidor: `npm run dev`
3. Acesse http://localhost:3000

## 📁 Estrutura

- `/app`: frontend e api com Next.js
- `/docs/antora`: customização da Antora
- `/docs/components`: pastas das documentações
- `/public`: saída estática da Antora servido pelo frontend
