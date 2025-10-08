import * as readline from 'readline';
import * as fs from 'fs';

type Estado = string;
type Simbolo = string;
type Grupo = string;

type FuncaoTransicao = Record<Estado, Record<Grupo, Estado>>;

interface AFD {
  estados: Set<Estado>;
  alfabetoCompleto: Set<Simbolo>;
  gruposDoAlfabeto: Map<Grupo, Set<Simbolo>>;
  transicoes: FuncaoTransicao;
  estadoInicial: Estado;
  estadosFinais: Set<Estado>;
}

interface DefinicaoAFDJson {
  descricao: string;
  estados: string[];
  alfabeto: {
    grupos?: Record<string, string>;
    isolados?: string[];
  };
  estadoInicial: string;
  estadosFinais: string[];
  transicoes: Record<string, Record<string, string>>;
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

    try {
      const definicoes = this.carregarAFDsDeArquivo('afds.json');
      if (definicoes.length === 0) {
        throw new Error("Nenhum AFD encontrado em 'afds.json'. O arquivo está vazio ou não existe.");
      }
      
      const definicaoEscolhida = await this.selecionarAFD(definicoes);
      
      if (definicaoEscolhida) {
        this.afd = this.construirAFD(definicaoEscolhida);
        console.log(`\n✅ AFD "${definicaoEscolhida.descricao}" carregado com sucesso!`);
        this.iniciarLoopDeTeste();
      } else {
        console.log("Nenhum AFD selecionado. Encerrando.");
        this.leitor.close();
      }
    } catch (erro) {
      if (erro instanceof Error) {
        console.error(`\n❌ Erro: ${erro.message}`);
      } else {
        console.error('\n❌ Ocorreu um erro inesperado.');
      }
      this.leitor.close();
    }
  }

  private carregarAFDsDeArquivo(caminho: string): DefinicaoAFDJson[] {
    try {
      const dados = fs.readFileSync(caminho, 'utf-8');
      const definicoes = JSON.parse(dados);
       
      if (!Array.isArray(definicoes)) {
        throw new Error("O JSON deve ser um array de definições de AFD.");
      }
       
      return definicoes as DefinicaoAFDJson[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Arquivo de definição '${caminho}' não encontrado.`);
      }
       
      throw new Error(`Erro ao ler ou parsear o arquivo '${caminho}': ${(error as Error).message}`);
    }
  }

  private async selecionarAFD(definicoes: DefinicaoAFDJson[]): Promise<DefinicaoAFDJson | null> {
    console.log("\nPor favor, escolha um AFD para simular:");
     
    definicoes.forEach((def, index) => {
      console.log(`  ${index + 1}. ${def.descricao}`);
    });

    while (true) {
      const resposta = await this.perguntar("Digite o número do AFD desejado (ou 'sair'): ");
      if (resposta.trim().toLowerCase() === 'sair') return null;

      const num = parseInt(resposta, 10);
      if (!isNaN(num) && num > 0 && num <= definicoes.length) {
        return definicoes[num - 1];
      } else {
        console.log("   [Aviso] Escolha inválida. Por favor, digite um número da lista.");
      }
    }
  }

  private construirAFD(def: DefinicaoAFDJson): AFD {
    const estados = new Set(def.estados);
     
    if (!estados.has(def.estadoInicial)) {
      throw new Error(`Estado inicial "${def.estadoInicial}" não está no conjunto de estados.`);
    }
     
    def.estadosFinais.forEach((ef) => {
      if (!estados.has(ef)) {
        throw new Error(`Estado final "${ef}" não está no conjunto de estados.`);
      }
    });

    const { gruposDoAlfabeto, alfabetoCompleto } = this.processarAlfabeto(def.alfabeto);

    for (const estadoOrigem in def.transicoes) {
      if (!estados.has(estadoOrigem)) {
        throw new Error(`Estado de origem "${estadoOrigem}" nas transições não é válido.`);
      }
       
      for (const simboloGrupo in def.transicoes[estadoOrigem]) {
        if (!gruposDoAlfabeto.has(simboloGrupo)) {
          throw new Error(`Símbolo/grupo "${simboloGrupo}" na transição de "${estadoOrigem}" não foi definido no alfabeto.`);
        }
         
        const estadoDestino = def.transicoes[estadoOrigem][simboloGrupo];
         
        if (!estados.has(estadoDestino)) {
          throw new Error(`Estado de destino "${estadoDestino}" na transição de "${estadoOrigem}" com "${simboloGrupo}" não é válido.`);
        }
      }
    }

    return {
      estados: new Set(def.estados),
      alfabetoCompleto,
      gruposDoAlfabeto,
      transicoes: def.transicoes,
      estadoInicial: def.estadoInicial,
      estadosFinais: new Set(def.estadosFinais)
    };
  }
  
  private processarAlfabeto(
    alfabetoDef: DefinicaoAFDJson['alfabeto']
  ): {
    gruposDoAlfabeto: Map<Grupo, Set<Simbolo>>,
    alfabetoCompleto: Set<Simbolo>
  } {
      const gruposDoAlfabeto = new Map<Grupo, Set<Simbolo>>();
      const alfabetoCompleto = new Set<Simbolo>();

      if (alfabetoDef.grupos) {
        for (const nomeGrupo in alfabetoDef.grupos) {
          const simbolosStr = alfabetoDef.grupos[nomeGrupo];
          const simbolos = this.parseSimbolos(simbolosStr);
           
          simbolos.forEach((s) => {
            if (alfabetoCompleto.has(s)) {
              throw new Error(`Símbolo "${s}" definido em múltiplos locais.`);
            }
             
            alfabetoCompleto.add(s);
          });
           
          gruposDoAlfabeto.set(nomeGrupo, simbolos);
        }
      }

      if (alfabetoDef.isolados) {
        const simbolos = this.parseSimbolos(alfabetoDef.isolados.join(','));
         
        simbolos.forEach((s) => {
          if (alfabetoCompleto.has(s)) {
            throw new Error(`Símbolo "${s}" definido em múltiplos locais.`);
          }
           
          alfabetoCompleto.add(s);
          gruposDoAlfabeto.set(s, new Set([s]));
        });
      }
       
      return { gruposDoAlfabeto, alfabetoCompleto };
  }

  private parseSimbolos(input: string): Set<Simbolo> {
    const simbolos = new Set<Simbolo>();
    const parts = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const part of parts) {
      simbolos.add(part);
    }
     
    return simbolos;
  }

  private iniciarLoopDeTeste(): void {
    this.leitor.on('line', (linha) => {
      const cadeia = linha.trim();
       
      if (cadeia.toLowerCase() === ':sair' || cadeia.toLowerCase() === ':quit') {
        console.log(' encerrando...');
        this.leitor.close();
        return;
      }
       
      if (!this.afd) return;
       
      try {
        this.testarCadeia(cadeia);
      } catch(erro) {
        if (erro instanceof Error) console.log(`   -> ❗️ Erro: ${erro.message}`);
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

    const encontrarGrupoParaSimbolo = (simbolo: Simbolo): Grupo | undefined => {
      for (const [grupo, simbolosDoGrupo] of this.afd!.gruposDoAlfabeto.entries()) {
        if (simbolosDoGrupo.has(simbolo)) return grupo;
      }
       
      return undefined;
    };

    for (let i = 0; i < cadeia.length; i++) {
      const simbolo = cadeia[i];
       
      if (!this.afd.alfabetoCompleto.has(simbolo)) {
        throw new Error(`Símbolo "${simbolo}" na posição ${i} não pertence ao alfabeto.`);
      }
       
      const grupoDoSimbolo = encontrarGrupoParaSimbolo(simbolo);
       
      if (!grupoDoSimbolo) {
        throw new Error(`Erro interno: não foi possível encontrar o grupo para o símbolo "${simbolo}".`);
      }
       
      const proximoEstado = this.afd.transicoes[estadoAtual]?.[grupoDoSimbolo];
       
      if (proximoEstado === undefined) {
        throw new Error(`Transição não definida para o estado "${estadoAtual}" com o grupo de símbolos "${grupoDoSimbolo}".`);
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

