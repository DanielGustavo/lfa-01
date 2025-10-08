# Manual de Uso e Documentação – Simulador de Autômatos Finitos Determinísticos

- **Nota**: Para exemplos práticos e detalhados de como modelar e testar diferentes autômatos, acesse os [Exemplos de Uso](./exemplos.md).

## 1. Objetivo do Projeto
Este documento detalha a implementação de um Simulador de Autômatos Finitos Determinísticos (AFD).

O objetivo principal é fornecer uma ferramenta de console interativa que permita a um usuário carregar a definição de qualquer AFD a partir de um arquivo externo e testar o reconhecimento de múltiplas cadeias de caracteres, validando se elas pertencem ou não à linguagem regular definida pelo autômato.

## 2. Visão Geral da Solução
O simulador foi desenvolvido em TypeScript, uma linguagem que adiciona tipagem estática ao JavaScript. A aplicação é executada no ambiente Node.js, permitindo que seja utilizada diretamente no terminal (console) de qualquer sistema operacional (Windows, macOS ou Linux).

A definição dos autômatos é lida de um arquivo de configuração chamado ```afds.json```.

## 3. Tecnologias Utilizadas
- **Node.js**: Ambiente de execução que permite rodar o código TypeScript/JavaScript fora de um navegador.
- **TypeScript**: Linguagem de programação principal, escolhida pela segurança de tipos e organização do código.
- **Chalk**: Biblioteca utilizada para adicionar cores e formatação ao texto no terminal

## 4. Guia de Instalação do Ambiente (Passo a Passo)
Para executar o simulador, é necessário ter o **Node.js** instalado no computador.

### Passo 1: Instalar o Node.js
- Acesse o site oficial do Node.js: https://nodejs.org/
- Baixe a versão LTS (Long Term Support), que é a mais estável e recomendada para a maioria dos usuários.
- Execute o arquivo baixado e siga as instruções do instalador.

### Passo 2: Verificar a Instalação
1. Abra um terminal no seu computador.
2. Digite os dois comandos abaixo (um de cada vez) e pressione Enter. Eles devem retornar as versões instaladas, confirmando que a instalação foi bem-sucedida.

```
node -v
npm -v
```

### Passo 3: Instalar as Dependências do Projeto

1. Abra o terminal no diretório do projeto
2. Agora, execute o seguinte comando. Ele irá ler o arquivo package.json e baixar automaticamente as bibliotecas necessárias.
   
```
npm install
```

## 5. Executando o Simulador
Com o ambiente pronto, no terminal dentro da pasta do projeto, execute o comando:

```
npm start
```

O programa será iniciado, e você poderá começar a usar o simulador.

## 6. Estrutura dos Arquivos do Projeto
- ```index.ts```: Contém todo o código-fonte do simulador em TypeScript.
- ```afds.json```: Arquivo de configuração onde os autômatos são definidos no formato JSON.
- ```package.json```: Arquivo que gerencia as dependências do projeto e define scripts úteis, como o npm start.

## 7. Formato do Arquivo de Definição (afds.json)
Para adicionar ou editar um autômato, você deve modificar o arquivo afds.json. Ele é um array de objetos, onde cada objeto representa um AFD e deve seguir a estrutura abaixo:

| Chave         | Tipo                                  | Descrição                                                                                                                           |
|---------------|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| ```descricao```     | ```string```                                | Um texto breve que descreve o que o autômato faz. Será exibido no menu de seleção.                                                  |
| ```estados```       | ```array de strings```                      | Uma lista com o nome de todos os estados do autômato (ex: ```["q0", "q1", "q_erro"]```).                                                  |
| ```alfabeto```      | ```objeto```                                | Define os símbolos da linguagem. Contém duas chaves opcionais: ```grupos``` e ```isolados```.                                                   |
| ```  ↳ grupos```      | ```objeto (chave: string, valor: string)``` | Permite agrupar símbolos sob um nome. Ex: ```"digito": "0,1,2,3,4,5,6,7,8,9"```. Os símbolos devem ser separados por vírgula.             |
| ```  ↳ isolados```     | ```array de strings```                      | Define símbolos individuais do alfabeto (ex: ```["+", "-", "."]```).                                                                      |
| ```estadoInicial``` | ```string```                                | O nome do estado inicial. Deve ser um dos estados listados em ```estados```.                                                              |
| ```estadosFinais``` | ```array de strings```                      | Uma lista com os nomes de todos os estados de aceitação.                                                                            |
| ```transicoes```    | ```objeto```                                | Define a função de transição δ. Cada chave é um estado de origem, e seu valor é um objeto com as transições (```"símbolo": "destino"```). |
