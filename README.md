
# Lumina Bank

Bem-vindo ao Lumina Bank, um projeto de aplicação bancária full-stack moderno, projetado para fornecer uma experiência de usuário limpa e intuitiva para operações financeiras essenciais.

## 📖 Sobre o Projeto

O Lumina Bank é uma simulação de plataforma bancária digital que permite aos usuários gerenciar suas contas, realizar transferências, visualizar extratos e muito mais. A aplicação é dividida em duas partes principais:

-   **Back-end:** Uma API RESTful robusta construída com Node.js, Express e TypeScript, responsável por toda a lógica de negócios, segurança e interação com o banco de dados.
-   **Front-end:** Uma interface de usuário reativa e elegante construída com Next.js, React e TypeScript, utilizando a arquitetura App Router e componentes de UI modernos.

## ✨ Features

-   **Autenticação de Usuário:** Sistema seguro de cadastro, login e gerenciamento de sessão com JSON Web Tokens (JWT).
-   **Gerenciamento de Contas:** Visualização de saldo e detalhes da conta.
-   **Extrato Financeiro:** Histórico detalhado de todas as transações.
-   **Transferências:** Realização de transferências entre contas.
-   **Sistema PIX:** Funcionalidades para gerenciar chaves PIX e realizar pagamentos instantâneos.
-   **Segurança:** Middlewares para proteção de rotas e criptografia de dados sensíveis.

## 🚀 Tech Stack

O projeto utiliza uma variedade de tecnologias modernas para garantir performance e escalabilidade.

### **Back-end**

-   **Node.js:** Ambiente de execução JavaScript.
-   **Express:** Framework para construção da API.
-   **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
-   **PostgreSQL** Banco de dados SQL para persistência de dados.
-   **Jest:** Framework para testes unitários e de integração.
-   **PM2:** Gerenciador de processos para produção.

### **Front-end**

-   **Next.js:** Framework React para renderização no servidor e geração de sites estáticos.
-   **React:** Biblioteca para construção de interfaces de usuário.
-   **TypeScript:** Linguagem para desenvolvimento robusto e escalável.
-   **Tailwind CSS:** Framework de CSS para estilização rápida.
-   **shadcn/ui:** Coleção de componentes de UI reutilizáveis.
-   **Jest & React Testing Library:** Ferramentas para testes de componentes e de interface.
-   **Context API:** Para gerenciamento de estado global (ex: autenticação).

## ⚙️ Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### **Pré-requisitos**

-   [Node.js](https://nodejs.org/) (versão 18.x ou superior)
-   [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
-   Um cliente SQL (como PostgreSQL, MySQL ou outro de sua preferência).

### **1. Clone o Repositório**

```bash
git clone <https://github.com/mockqv/Lumina-Bank>
cd Lumina-Bank
```

### **2. Configuração do Back-end**

1.  **Navegue até a pasta do back-end:**
    ```bash
    cd back-end
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados:**
    - Crie um banco de dados no seu cliente SQL.
    - Execute o script `database.sql` para criar as tabelas necessárias.

4.  **Configure as Variáveis de Ambiente:**
    - Renomeie o arquivo `.env.example` (se houver) para `.env`.
    - Preencha as variáveis com suas credenciais do banco de dados e um segredo para o JWT.
      ```env
      # Exemplo de .env para o back-end
      PORT=3001
      DB_HOST=localhost
      DB_USER=seu_usuario
      DB_PASSWORD=sua_senha
      DB_NAME=lumina_bank
      JWT_SECRET=seu_segredo_super_secreto
      ```

5.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run start:build
    ```
    O servidor estará disponível em `http://localhost:3001`.

### **3. Configuração do Front-end**

1.  **Navegue até a pasta do front-end (a partir da raiz):**
    ```bash
    cd front-end
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    - Crie um arquivo `.env.local` na raiz da pasta `front-end`.
    - Adicione a URL da API do back-end.
      ```env
      # .env.local para o front-end
      NEXT_PUBLIC_API_URL=http://localhost:3001
      ```

4.  **Execute o cliente de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:3000`.

## ✅ Testes

Para garantir a qualidade e a estabilidade do código, você pode executar os testes automatizados.

### **Back-end**

```bash
cd back-end
npm test
```

### **Front-end**

```bash
cd front-end
npm test
```

## 📁 Estrutura do Projeto

A estrutura de pastas foi organizada para separar claramente as responsabilidades:

```
Lumina-Bank/
├── back-end/      # Aplicação da API (Node.js/Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.ts
│   └── test/
└── front-end/     # Aplicação cliente (Next.js/React)
    └── src/
        ├── app/
        ├── components/
        ├── contexts/
        ├── services/
        └── tests/
```
