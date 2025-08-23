Markdown

# 🚀 Processador de Logs de Partidas

## 1. Visão Geral do Projeto
Esta é uma aplicação backend robusta, construída com NestJS (Node.js), projetada para ser uma solução completa no processamento e análise de logs de partidas de jogos de tiro em primeira pessoa (FPS). [cite_start]🎮 

A API permite o upload de arquivos de log, processa os dados para extrair estatísticas detalhadas de cada partida e dos jogadores, persiste esses relatórios em um banco de dados PostgreSQL e expõe os resultados através de múltiplos endpoints para consulta e análise. É ideal para integração com ferramentas de Business Intelligence (BI) ou frontends interativos. [cite_start]📊 

O projeto foi desenvolvido com foco em Test-Driven Development (TDD), garantindo a qualidade e a corretude das regras de negócio. Isso inclui desde o cálculo de rankings por partida até a implementação de funcionalidades complexas como "kill streaks", "awards" (prêmios por desempenho) e a detecção de "friendly fire". [cite_start]✅ 

## 2. Tecnologias Utilizadas
Um olhar sobre as ferramentas que impulsionam este projeto:

* [cite_start]**Backend:** Node.js, NestJS 
* [cite_start]**Banco de Dados:** PostgreSQL (gerenciado via Supabase) 🐘 
* [cite_start]**ORM:** TypeORM 
* [cite_start]**Testes:** Jest (para testes unitários e E2E), Supertest 
* [cite_start]**Variáveis de Ambiente:** Dotenv 

## 3. Como Executar o Projeto
Siga estes passos para colocar a aplicação em funcionamento em sua máquina local:

### Pré-requisitos
Certifique-se de ter instalado:

* [cite_start]Node.js (v18 ou superior) 🟢 
* [cite_start]npm (gerenciador de pacotes do Node.js) 
* [cite_start]Uma instância de banco de dados PostgreSQL (local ou em nuvem como Supabase) 

### Passos para Instalação
1.  **Clonar o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd [NOME_DA_PASTA]
    ```

2.  **Instalar dependências:**
    ```bash
    npm install
    ```
    *Nota: Devido a conflitos em dependências de desenvolvimento, pode ser necessário usar o comando `npm install --legacy-peer-deps`.*

3.  **Configurar Variáveis de Ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto e preencha com suas credenciais do banco de dados:
    ```env
    POSTGRES_HOST=seu_host_do_banco
    POSTGRES_PORT=5432
    POSTGRES_USER=seu_usuario
    POSTGRES_PASSWORD=sua_senha
    POSTGRES_DB=seu_banco
    ```

4.  **Iniciar a aplicação em modo de desenvolvimento:**
    ```bash
    npm run start:dev
    ```
    O servidor estará disponível em `http://localhost:3000`. 🚀

### Rodando os Testes
Para garantir a integridade e a qualidade do código, execute a suíte de testes unitários e E2E:
```bash
npm test
4. Endpoints da API
Explore as funcionalidades da API através dos seguintes endpoints. A documentação interativa (Swagger UI) estará disponível em http://localhost:3000/api-docs após a aplicação ser iniciada. 📖 


POST /logs/upload 


GET /logs/matches 


GET /logs/matches/:id 


GET /logs/ranking/global 


GET /logs/matches/mvp 

5. Documentação da API (Swagger)
Para uma documentação completa, o projeto inclui duas especificações no formato Swagger 2.0, que foram movidas para a pasta /docs para melhor organização:

docs/mvpSwagger.json (Versão Atual):
Este arquivo representa a API como ela está atualmente implementada e funcional no repositório. Ele documenta todos os endpoints, parâmetros e modelos de dados que foram desenvolvidos e testados. 

docs/roadmapSwagger.json (Visão Futura):
Este arquivo serve como um documento de design técnico, descrevendo a visão para a evolução da API. Ele incorpora as melhorias planejadas no "Roadmap de Melhorias Técnicas", incluindo segurança OAuth 2.0, paginação e tratamento de erros detalhado. 

6. Decisões de Arquitetura
Este projeto foi cuidadosamente construído com base em princípios sólidos de engenharia de software, visando a qualidade, manutenibilidade e testabilidade do código. 🏗️ 


Arquitetura em Camadas (SOLID): A aplicação é rigidamente dividida em camadas claras (Controller, Service, Repository), seguindo o Princípio da Responsabilidade Única. 


Test-Driven Development (TDD): Todo o desenvolvimento da lógica de negócio foi guiado por testes, com cobertura para testes unitários e de ponta-a-ponta (E2E). 

Modelo de Dados Flexível: A decisão estratégica de armazenar o relatório completo de cada partida em uma única coluna jsonb no PostgreSQL oferece uma flexibilidade notável, permitindo a adição de novas métricas sem a necessidade de migrações complexas no esquema do banco. 🔄 

7. Roadmap de Melhorias Técnicas
Como parte de uma visão de produto contínua, foi elaborado um roadmap com os próximos passos para elevar a qualidade e a robustez da aplicação. 🗺️ 

Melhorias Planejadas

Refatoração e Qualidade de Código: Quebrar o método _generateReportForMatch em funções menores e com responsabilidades únicas. 

Infraestrutura e DevOps: Criar um Dockerfile e docker-compose.yml para padronizar os ambientes e configurar um workflow no GitHub Actions para automação de testes. 🐳 


Evolução da Arquitetura de Dados (Microserviços): Migrar da abordagem jsonb para um esquema de banco de dados relacional e normalizado para permitir consultas SQL complexas e eficientes. 

Robustez e Escalabilidade: Implementar paginação nos endpoints que retornam listas e adicionar índices estratégicos no banco de dados. ⚡ 

Segurança da API (OAuth 2.0): Proteger todos os endpoints utilizando um fluxo de autenticação e autorização robusto com Passport.js. 🔒 

Débitos Técnicos Identificados
Atualização de Dependências: Durante a instalação com npm install, foram identificados diversos pacotes depreciados (eslint, glob, supertest, etc.). É necessário planejar a atualização destes pacotes para versões mais recentes e suportadas para garantir a segurança e a estabilidade do projeto a longo prazo.

#### Evolução da Arquitetura para Grande Escala (Big Data)
A arquitetura atual, com seu `LogService` atuando como orquestrador, é ideal para um volume de dados na casa dos milhões de registros. No entanto, para escalar a solução para a casa dos **bilhões de registros**, seria necessária uma mudança de paradigma, saindo do cálculo "on-the-fly" (em tempo real) para uma abordagem de **Processamento em Lote (Batch Processing)**.

A estratégia para essa escala seria:

1.  **Pipeline de ETL (Extract, Transform, Load):** Implementar um processo em background, utilizando ferramentas open source como **Apache Spark**, que rodaria periodicamente (ex: de hora em hora).
2.  **Separação de Bancos (OLTP e OLAP):**
    * Manter o **PostgreSQL** como nosso banco transacional (OLTP), otimizado para a escrita rápida dos relatórios de partidas individuais.
    * O pipeline de ETL leria os dados do PostgreSQL, realizaria as agregações massivas (como o ranking global) e salvaria os resultados já consolidados em um **banco de dados analítico (OLAP)**, otimizado para leitura, como o **ClickHouse** ou **Apache Druid**.
3.  **Consumo Otimizado:** A API deixaria de calcular os rankings. Em vez disso, faria uma consulta simples e extremamente rápida ao banco analítico (OLAP) para buscar os dados já pré-calculados, entregando a resposta ao usuário em milissegundos, independentemente do volume de dados processado em background.

Esta abordagem garante que a experiência do usuário permaneça performática, movendo o custo computacional do processamento pesado para uma infraestrutura de dados assíncrona e dedicada.