import * as vscode from 'vscode';

import { ComandoLiquido } from './comandos-liquido';

/**
 * Pseudoterminal que executa um comando Liquido inteiramente dentro do
 * processo de extensão (um _web worker_ no ambiente Web), sem depender de
 * shell nem de `child_process` — o caminho recomendado para tarefas no host
 * de extensão Web.
 *
 * A execução de fato dos comandos de scaffolding chama a API JS do
 * interpretador/CLI do Liquido e escreve arquivos via `vscode.workspace.fs`.
 * Enquanto essa integração não está publicada no pacote Web do Liquido, o
 * pseudoterminal informa com clareza o estado de cada comando, em vez de
 * falhar em silêncio.
 */
export class PseudoterminalLiquido implements vscode.Pseudoterminal {
    private readonly emissorEscrita = new vscode.EventEmitter<string>();
    private readonly emissorFechamento = new vscode.EventEmitter<number>();

    readonly onDidWrite: vscode.Event<string> = this.emissorEscrita.event;
    readonly onDidClose: vscode.Event<number> = this.emissorFechamento.event;

    constructor(private readonly comando: ComandoLiquido) {}

    async open(): Promise<void> {
        const escrever = (linha: string) => this.emissorEscrita.fire(linha + '\r\n');

        escrever(`\x1b[36m[Liquido]\x1b[0m ${this.comando.titulo}`);
        escrever(this.comando.descricao);
        escrever('');

        if (this.comando.requerServidor) {
            escrever(
                '\x1b[33mO servidor de desenvolvimento precisa de HTTP real, indisponível no host de extensão Web.\x1b[0m'
            );
            escrever(
                'Use a extensão de desktop para o servidor, ou uma solução baseada em WebContainers.'
            );
            this.emissorFechamento.fire(1);
            return;
        }

        try {
            await this.executarComando(escrever);
            escrever('');
            escrever('\x1b[32mConcluído.\x1b[0m');
            this.emissorFechamento.fire(0);
        } catch (erro) {
            escrever('');
            escrever(`\x1b[31mFalha:\x1b[0m ${(erro as Error).message}`);
            this.emissorFechamento.fire(1);
        }
    }

    close(): void {
        this.emissorEscrita.dispose();
        this.emissorFechamento.dispose();
    }

    /**
     * Ponto de integração com a API JS do Liquido no worker. Recebe uma função
     * de escrita para transmitir a saída ao pseudoterminal.
     */
    private async executarComando(escrever: (linha: string) => void): Promise<void> {
        const pasta = vscode.workspace.workspaceFolders?.[0];
        if (!pasta) {
            throw new Error('Nenhuma pasta de trabalho aberta.');
        }

        escrever(`Diretório do projeto: ${pasta.uri.toString()}`);
        escrever(
            '\x1b[33mExecução no ambiente Web ainda não está disponível para este comando.\x1b[0m'
        );
        escrever(
            'A base já roteia a tarefa por CustomExecution; falta conectar a API JS do Liquido publicada para Web.'
        );
    }
}
