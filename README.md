# 🔐 Sistema de Controle de Acesso

> Implementação do modelo Bell-LaPadula com autenticação JWT, hashing de senhas e auditoria de logs.
> Repositório: https://github.com/BrunoGuerreiro08/control_access_system_SA25S

---

## 📋 Sobre o Projeto

Este projeto implementa um sistema de controle de acesso obrigatório baseado no modelo **Bell-LaPadula**, desenvolvido em Node.js com Express. O sistema classifica usuários e recursos em níveis de segurança e aplica as regras de **No Read Up** e **No Write Down** para garantir a confidencialidade das informações.

---

## ✅ Funcionalidades

- Autenticação de usuários com sessão persistente via cookies (HttpOnly, SameSite, Secure em produção)
- Login local com username/password via Passport.js (LocalStrategy)
- Login social via Google OAuth 2.0 (Passport.js GoogleStrategy)
- Senhas armazenadas com hash bcrypt (salt rounds: 10)
- Registo de novos utilizadores com nível de clearance
- Controle de acesso baseado no modelo Bell-LaPadula
- Níveis de segurança: `UNCLASSIFIED (0)` `CONFIDENTIAL (1)` `SECRET (2)` `TOP SECRET (3)`
- **No Read Up:** usuários não podem ler recursos acima do seu nível de clearance
- **No Write Down:** ao criar um recurso, o nível é automaticamente elevado ao clearance do utilizador caso tente escrever abaixo
- Criação de recursos restrita a utilizadores com clearance **SECRET** ou superior
- Auditoria completa via logs estruturados com pino (terminal e ficheiro)
- Interface web com EJS para login, registo e dashboard

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| Node.js + Express 5 | Servidor web |
| Prisma ORM v5 + SQLite | Base de dados |
| Passport.js | Autenticação (LocalStrategy + GoogleStrategy) |
| express-session + connect-sqlite3 | Gestão e persistência de sessões |
| bcrypt | Hash de senhas |
| EJS | Template engine |
| pino | Logging estruturado |
---

## 📦 Pré-requisitos

- Node.js v18 ou superior
- npm

---

## 🚀 Como Executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto ou renomeie o arquivo `.env.example`, o arquivo final deve conter ao menos o seguinte:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua_chave_secreta_aqui"
```

### 3. Executar as migrações do banco de dados

```bash
npx prisma migrate dev
```

### 4. (Opcional) Popular a base de dados com dados de teste

```bash
npm run seed
```

> Os usuários criados seguem o seguinte padrão e serão exibidos no console \
> Username: {name} \
> Password: {name}123

### 5. Iniciar o servidor

```bash
npm run dev
```

O servidor estará disponível em **http://localhost:3000** ou na porta definida na variável `PORT` dentro de `.env`.

---

## 📁 Estrutura do Projeto

```
src/
  controllers/    # Lógica dos endpoints
  middlewares/    # Autenticação JWT e Bell-LaPadula
  routes/         # Definição das rotas
  lib/            # Instância do Prisma, passport e logger
  policies/       # Regras de controle de acesso
  utils/          # Níveis de segurança
prisma/
  schema.prisma   # Modelos do banco de dados
  migrations/     # Histórico de migrações
views/            # Templates EJS
logs/             # Ficheiros de log (gerado automaticamente)
scripts/          # Scripts utilitários (seed e purge)
```

---

## 🔏 Modelo Bell-LaPadula

O modelo é implementado em `policies/` e aplicado via middleware. As duas regras principais são:

| Regra | Descrição |
|---|---|
| **No Read Up** | Um utilizador só pode ler recursos cujo nível de classificação seja igual ou inferior ao seu clearance. |
| **No Write Down** | Ao criar um recurso com nível inferior ao seu clearance, o sistema eleva automaticamente a classificação e notifica o utilizador no dashboard. |

---

## 🔑 Segurança de Senhas

As senhas são armazenadas com hash **bcrypt** com 10 salt rounds. Nunca são guardadas em texto simples na base de dados.

---

## 📜 Auditoria e Logs

Todos os eventos relevantes são registados com **pino** em formato JSON estruturado, tanto no terminal como no ficheiro `logs/app.log`.

| Evento | Nível |
|---|---|
| Login bem-sucedido | `info` |
| Login falhado | `warn` |
| Registo de novo utilizador | `info` |
| Acesso a recurso | `info` |
| Violação No Read Up | `warn` |
| Violação No Write Down | `warn` |
| Token inválido ou expirado | `warn` |
| Logout | `info` |

---

## 🗄️ Configuração Segura do Banco de Dados

### Proteção contra SQL Injection

O projeto usa **Prisma ORM**, que envia todos os valores fornecidos pelo utilizador como
parâmetros vinculados (*bound parameters*) ao driver SQLite — nunca como texto interpolado
na query SQL. Isto torna a injeção SQL estruturalmente impossível através das queries ORM normais.

Para os casos em que é necessária uma query raw, o projeto usa exclusivamente
`prisma.$queryRaw` com template literals (sintaxe `` $queryRaw`...` ``), que parameteriza
automaticamente qualquer valor interpolado com `${}`. O uso de `$queryRawUnsafe()` com
input do utilizador está explicitamente proibido no código.

### Prisma — boas práticas aplicadas

| Prática | Implementação |
|---|---|
| Password nunca exposta | `select` explícito exclui o campo `password` em todas as queries de listagem |
| Input do utilizador nunca interpolado em SQL | Uso exclusivo de Prisma ORM e `$queryRaw` com tagged templates |
| Sessões persistidas em base de dados separada | `connect-sqlite3` usa `sessions.db` isolado do `dev.db` |
| Credenciais fora do código | Todas as variáveis sensíveis via `.env` |