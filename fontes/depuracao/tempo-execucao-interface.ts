import * as vscode from 'vscode';
import { DebugProtocol } from '@vscode/debugprotocol';
import { ElementoPilhaVsCode } from './elemento-pilha';

export interface TempoExecucaoInterface {
    on(eventName: string | symbol, listener: (...args: any[]) => void): any;
    iniciar(documento: vscode.TextDocument | undefined, arquivoInicial: string, pararNaEntrada: boolean): Promise<any>;
    adentrarEscopo(): void;
    continuar(): void;
    definirPontosParada(pontosParada: DebugProtocol.Breakpoint[]): void;
    reiniciarPontosParada(): void;
    escreverEmSaida(mensagem: string): void;
    escreverEmSaidaMesmaLinha(mensagem: string): void;
    obterVariavel(nome: string): any;
    passo(): void;
    pilhaExecucao(): ElementoPilhaVsCode[];
    sairEscopo(): void;
    variaveis(): { valor: any; nome: string; tipo: string; }[];
    finalizacao(): void;
    avisoPontoParadaAtivado(): void;
}