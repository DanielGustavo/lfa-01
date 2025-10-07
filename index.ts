import * as readline from 'readline';

type Estado = string;
type Simbolo = string;

/*
  Exemplo: {
    "q0": { 0: "q1", 1: "q0" },
    "q1": { 0: "q1": 1: "q0" }
  }
*/
type FuncaoTransicao = Record<Estado, Record<Simbolo, Estado>>;

interface AFD {
  estados: Set<Estado>;
  alfabeto: Set<Simbolo>;
  transicoes: FuncaoTransicao;
  estadoInicial: Estado;
  estadosFinais: Set<Estado>;
}

class SimuladorAFD {
  private afd: AFD | null = null;
  private readonly leitor: readline.Interface;

  constructor() {
    this.leitor = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private perguntar(pergunta: string): Promise<string> {
    return new Promise((resolve) => {
      this.leitor.question(pergunta, resolve);
    });
  }

  public async iniciar(): Promise<void> {
    console.log('--- Simulador de Autômato Finito Determinístico ---');
    console.log('Por favor, defina os componentes do seu AFD.');

    try {
      await this.definirAFD();
       
      if (this.afd) {
        console.log('\n✅ Autômato definido e validado com sucesso!');
        this.iniciarLoopDeTeste();
      }
    } catch (erro) {
      if (erro instanceof Error) {
        console.error(`\n❌ Erro na definição do autômato: ${erro.message}`);
      } else {
        console.error('\n❌ Ocorreu um erro inesperado.');
      }
       
      this.leitor.close();
    }
  }

  private async definirAFD(): Promise<void> {
    const estadosStr = await this.perguntar('1. Estados (separados por vírgula. Ex: q0,q1,q2): ');
    const estados = new Set(estadosStr.split(',').map(s => s.trim()));
    if (estados.size === 0) throw new Error("O conjunto de estados não pode ser vazio.");

    const alfabetoStr = await this.perguntar('2. Alfabeto (símbolos separados por vírgula. Ex: 0,1): ');
    const alfabeto = new Set(alfabetoStr.split(',').map(s => s.trim()));
    if (alfabeto.size === 0) throw new Error("O alfabeto não pode ser vazio.");

    const estadoInicial = await this.perguntar('3. Estado Inicial (deve ser um dos estados definidos. Ex: q0): ');
    if (!estados.has(estadoInicial)) {
      throw new Error(`O estado inicial "${estadoInicial}" não pertence ao conjunto de estados.`);
    }

    const estadosFinaisStr = await this.perguntar('4. Estados Finais/Aceitação (separados por vírgula. Ex: q2): ');
    const estadosFinais = new Set(estadosFinaisStr.split(',').map(s => s.trim()));
     
    for (const ef of estadosFinais) {
      if (!estados.has(ef)) {
        throw new Error(`O estado final "${ef}" não pertence ao conjunto de estados.`);
      }
    }
    
    console.log('5. Funções de Transição (δ):');
    const transicoes = await this.definirTransicoes(estados, alfabeto);

    this.afd = { estados, alfabeto, transicoes, estadoInicial, estadosFinais };
  }

  private async definirTransicoes(estados: Set<Estado>, alfabeto: Set<Simbolo>): Promise<FuncaoTransicao> {
    const transicoes: FuncaoTransicao = {};
     
    for (const estado of estados) {
      transicoes[estado] = {};
       
      for (const simbolo of alfabeto) {
        let proximoEstado = '';
        let estadoValido = false;
        
        // Loop até que um estado de destino válido seja fornecido
        while(!estadoValido) {
          proximoEstado = await this.perguntar(`   δ(${estado}, ${simbolo}) -> `);
          if (estados.has(proximoEstado.trim())) {
            estadoValido = true;
          } else {
            console.log(`   [Aviso] Estado "${proximoEstado}" não é válido. Por favor, insira um estado existente.`);
          }
        }
         
        transicoes[estado][simbolo] = proximoEstado.trim();
      }
    }
     
    return transicoes;
  }

  private iniciarLoopDeTeste(): void {
    this.leitor.on('line', (linha) => {
      const cadeia = linha.trim();
      if (cadeia.toLowerCase() === ':sair' || cadeia.toLowerCase() === ':quit') {
        console.log(' encerrando...');
        this.leitor.close();
        return;
      }

      if (!this.afd) {
        console.error('Autômato não definido.');
        return;
      }

      try {
        this.testarCadeia(cadeia);
      } catch(erro) {
        if (erro instanceof Error) {
           console.log(`   -> ❗️ Erro: ${erro.message}`);
        }
      }
      console.log("\nDigite uma cadeia para testar ou ':sair' para encerrar.");
      process.stdout.write('> ');
    });

    console.log("\n--- Iniciar Testes ---");
    console.log("Digite uma cadeia para testar ou ':sair' para encerrar.");
    process.stdout.write('> ');
  }
   
  private testarCadeia(cadeia: string): void {
    if (!this.afd) throw new Error("AFD não foi inicializado.");

    let estadoAtual = this.afd.estadoInicial;
    let caminho = estadoAtual;

    for (let i = 0; i < cadeia.length; i++) {
      const simbolo = cadeia[i];

      if (!this.afd.alfabeto.has(simbolo)) {
        throw new Error(`Símbolo "${simbolo}" na posição ${i} não pertence ao alfabeto.`);
      }

      const proximoEstado = this.afd.transicoes[estadoAtual]?.[simbolo];
      if (proximoEstado === undefined) {
        throw new Error(`Transição não definida para o estado "${estadoAtual}" com o símbolo "${simbolo}".`);
      }
      
      estadoAtual = proximoEstado;
      caminho += ` --(${simbolo})-> ${estadoAtual}`;
    }

    const aceita = this.afd.estadosFinais.has(estadoAtual);

    console.log(`   Caminho: ${caminho}`);
    if (aceita) {
      console.log(`   Resultado: ✅ ACEITA (Estado final "${estadoAtual}" é um estado de aceitação).`);
    } else {
      console.log(`   Resultado: ❌ REJEITA (Estado final "${estadoAtual}" não é um estado de aceitação).`);
    }
  }
}

const simulador = new SimuladorAFD();
simulador.iniciar();
