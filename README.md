# Simulador de Autômatos Finitos Determinísticos (AFD)

Este projeto consiste em um simulador de Autômatos Finitos Determinísticos (AFD) desenvolvido em TypeScript.

O programa é uma aplicação de console interativa que permite ao usuário:
1.  Definir um AFD: `A = (Q, Σ, δ, q0, F)`.
2.  Validar se a definição do autômato é consistente.
3.  Testar múltiplas cadeias de caracteres para verificar se são aceitas ou rejeitadas pelo AFD definido.

## 1. Requisitos

Para executar o simulador, você precisa ter o seguinte software instalado:

-   **Node.js**: Ambiente de execução para JavaScript/TypeScript.
-   **TypeScript**: Compilador do TypeScript.
-   **ts-node**: Biblioteca que permite executar arquivos TypeScript diretamente sem compilação manual.

## 2. Instalação

Abra um terminal ou prompt de comando e instale o `ts-node` globalmente com o seguinte comando:

```bash
npm install -g ts-node
````

## 3\. Como Executar

```bash
npm run start
```

## 4\. Guia de Uso

Ao iniciar o programa, você será guiado por um processo de 5 passos para definir seu autômato.

### Passo 1: Definir os Estados (Q)

Você deve fornecer todos os estados do autômato, separados por vírgula.
`Exemplo: q0,q1,q2`

### Passo 2: Definir o Alfabeto (Σ)

Forneça os símbolos que compõem o alfabeto, também separados por vírgula.
`Exemplo: 0,1`

### Passo 3: Definir o Estado Inicial (q0)

Informe qual dos estados previamente definidos será o estado inicial. O programa irá validar se o estado informado realmente existe.
`Exemplo: q0`

### Passo 4: Definir os Estados Finais (F)

Informe o conjunto de estados de aceitação, separados por vírgula.
`Exemplo: q2`

### Passo 5: Definir a Função de Transição (δ)

O programa irá pedir, uma por uma, a transição para cada par `(estado, símbolo)`. Você deve informar o estado de destino para cada transição.
`Exemplo:`
`δ(q0, 0) -> q1`
`δ(q0, 1) -> q0`
`... e assim por diante.`

### Testando Cadeias

Após a definição do autômato, o programa entrará no modo de teste.

  - Digite qualquer cadeia de caracteres e pressione `Enter`.
  - O simulador exibirá o caminho percorrido e o resultado (`ACEITA` ou `REJEITA`).
  - Para encerrar o programa, digite `:sair` ou `:quit` e pressione `Enter`.

## 5\. Exemplo de Uso Completo

Vamos definir um AFD que aceita cadeias binárias terminadas em `0`.

  - **Estados (Q)**: `{q0, q1}`
  - **Alfabeto (Σ)**: `{0, 1}`
  - **Estado Inicial (q0)**: `q0`
  - **Estados Finais (F)**: `{q1}`
  - **Transições (δ)**:
      - δ(q0, 0) = q1
      - δ(q0, 1) = q0
      - δ(q1, 0) = q1
      - δ(q1, 1) = q0

**Interação com o programa:**

```
--- Simulador de Autômato Finito Determinístico ---
Por favor, defina os componentes do seu AFD.
1. Estados (separados por vírgula. Ex: q0,q1,q2): q0, q1
2. Alfabeto (símbolos separados por vírgula. Ex: 0,1): 0, 1
3. Estado Inicial (deve ser um dos estados definidos. Ex: q0): q0
4. Estados Finais/Aceitação (separados por vírgula. Ex: q2): q1
5. Funções de Transição (δ):
   δ(q0, 0) -> q1
   δ(q0, 1) -> q0
   δ(q1, 0) -> q1
   δ(q1, 1) -> q0

✅ Autômato definido e validado com sucesso!

--- Iniciar Testes ---
Digite uma cadeia para testar ou ':sair' para encerrar.
> 110
   Caminho: q0 --(1)-> q0 --(1)-> q0 --(0)-> q1
   Resultado: ✅ ACEITA (Estado final "q1" é um estado de aceitação).

Digite uma cadeia para testar ou ':sair' para encerrar.
> 101
   Caminho: q0 --(1)-> q0 --(0)-> q1 --(1)-> q0
   Resultado: ❌ REJEITA (Estado final "q0" não é um estado de aceitação).

Digite uma cadeia para testar ou ':sair' para encerrar.
> 0
   Caminho: q0 --(0)-> q1
   Resultado: ✅ ACEITA (Estado final "q1" é um estado de aceitação).

Digite uma cadeia para testar ou ':sair' para encerrar.
> 11
   Caminho: q0 --(1)-> q0 --(1)-> q0
   Resultado: ❌ REJEITA (Estado final "q0" não é um estado de aceitação).

Digite uma cadeia para testar ou ':sair' para encerrar.
> 101a
   -> ❗️ Erro: Símbolo "a" na posição 3 não pertence ao alfabeto.

Digite uma cadeia para testar ou ':sair' para encerrar.
> :sair
 encerrando...
```
