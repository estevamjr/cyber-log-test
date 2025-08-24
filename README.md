🚀 CyberLogTest: Processador de Logs de Partidas
1. Visão Geral do Projeto
Bem-vindo ao CyberLogTest! Esta é uma aplicação backend robusta, construída com NestJS, projetada para processar e analisar logs de partidas de jogos. A aplicação é totalmente containerizada com Docker e utiliza um fluxo de trabalho de desenvolvimento profissional com VS Code e Dev Containers, garantindo um ambiente consistente e portátil para todos os desenvolvedores.

Este documento é o seu guia completo para configurar e rodar o projeto.

2. Pré-requisitos Essenciais
Para garantir um ambiente de desenvolvimento estável, é crucial ter as seguintes ferramentas instaladas e configuradas na sua máquina Windows:

Git: Para controle de versão. Download aqui.

Docker Desktop: A base da nossa containerização. Ele gerencia o WSL 2 automaticamente. Download aqui.

WSL 2 (Subsistema Windows para Linux): Essencial para a performance do Docker no Windows.

Instalação: Abra o PowerShell como Administrador e execute: wsl --install.

Distribuição: Recomendamos instalar o Ubuntu a partir da Microsoft Store.

VS Code: Nosso editor de código. Download aqui.

Extensões do VS Code (Instalar dentro do VS Code):

Dev Containers (ID: ms-vscode-remote.remote-containers): A extensão principal que gerencia nosso ambiente.

WSL (ID: ms-vscode-remote.remote-wsl): Permite ao VS Code se conectar ao ambiente Linux.

3. Configuração Inicial (Primeira Vez)
Siga estes passos exatamente para configurar o projeto do zero.

Passo 1: Clone o Projeto no Local Correto
Para garantir o funcionamento do hot-reload e a melhor performance, o projeto deve ser clonado dentro do sistema de arquivos do WSL, e não no seu C:\Users\....

Abra o terminal do Ubuntu (pelo Menu Iniciar).

Navegue para sua pasta "home" e clone o repositório:

cd ~
git clone https://github.com/estevamjr/cyber-log-test.git

Passo 2: Crie e Configure o Arquivo .env
As credenciais do banco de dados são gerenciadas por um arquivo .env.

Ainda no terminal do Ubuntu, navegue para a pasta do projeto:

cd cyber-log-test

Copie o arquivo de exemplo para criar seu arquivo .env local:

cp .env.example .env

Abra o projeto no VS Code (Modo WSL): Execute o comando abaixo. Uma nova janela do VS Code será aberta, conectada ao seu ambiente Linux.

code .

No VS Code, abra o arquivo .env que você acabou de criar e altere a senha POSTGRES_PASSWORD=changeme para uma senha segura de sua escolha.

Passo 3: Inicie o Ambiente Dev Container
Esta é a etapa final, onde o VS Code irá construir e iniciar os contêineres Docker.

Com o projeto aberto no VS Code (no modo WSL, com a barra de status verde), abra a paleta de comandos (Ctrl+Shift+P).

Digite e selecione a opção Dev Containers: Reopen in Container.

Aguarde. O VS Code irá construir a imagem Docker e iniciar os serviços api e db. Este processo pode demorar alguns minutos na primeira vez.

Quando terminar, seu ambiente estará 100% no ar. O terminal integrado do VS Code estará conectado ao contêiner da api, e a aplicação iniciará automaticamente com npm run start:dev.

4. Fluxo de Trabalho Diário
Iniciar o Ambiente
Abra a pasta do projeto (que está no WSL) com o VS Code.

Use o comando Dev Containers: Reopen in Container.

Aguarde a aplicação iniciar automaticamente no terminal integrado.

Hot-Reload
O hot-reload funciona automaticamente. Simplesmente salve uma alteração em qualquer arquivo na pasta src/, e a aplicação será reiniciada no terminal do VS Code.

Executando Testes e Comandos Git
Use o terminal integrado do VS Code (que já está dentro do contêiner Linux) para todos os comandos, como:

npm test

git status, git add, git commit

npm run push:test (para rodar os testes e enviar ao GitHub com segurança)

Parando o Ambiente
Para parar os contêineres e liberar os recursos da sua máquina, abra um terminal fora do VS Code (PowerShell) na pasta do projeto e execute:

docker-compose down

5. Guia de Resolução de Problemas (Troubleshooting)
Se encontrar problemas, é provável que já os tenhamos resolvido antes.

Erro: EADDRINUSE: address already in use (Porta em Uso)

Causa: Um processo de uma sessão anterior não foi encerrado corretamente.

Solução: Feche o VS Code. Na sua barra de tarefas do Windows, clique com o botão direito no ícone do Docker e selecione "Quit Docker Desktop". Aguarde 30 segundos e inicie tudo novamente. Não use taskkill, pois isso pode desestabilizar o WSL.

Erro: Could not connect to WSL ou o Dev Container não sobe

Causa: O serviço do WSL no Windows travou.

Solução: Abra o PowerShell como Administrador e execute wsl --shutdown. Aguarde o Docker Desktop reiniciar e tente novamente.

Erro: Exit code 137 durante a construção

Causa: Falta de memória RAM alocada para o Docker/WSL.

Solução: Crie um arquivo .wslconfig em C:\Users\seu_nome e adicione o conteúdo abaixo para aumentar a memória para 8GB. Depois, rode wsl --shutdown.

[wsl2]
memory=8GB

6. Roadmap de Pendências
Robustez e Escalabilidade:

[Pendente ⏳] Implementar paginação e índices de banco de dados.

Segurança da API:

[Pendente ⏳] Proteger endpoints com autenticação (ex: OAuth 2.0).

Débitos Técnicos:

[Pendente ⏳] Atualizar dependências obsoletas.
[Pendente ⏳] Erro 'listen' mesmo com microservice funcionando corretamente.

Evolução da Arquitetura:

[Visão Futura 🚀] Migrar para um esquema de dados totalmente relacional.