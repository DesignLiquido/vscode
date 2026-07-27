import * as vscode from 'vscode';

import { comandosLiquido, comandoPorId, TIPO_TAREFA_LIQUIDO, ComandoLiquido } from './comandos-liquido';

/**
 * Definição de tarefa Liquido para o desktop.
 */
interface DefinicaoTarefaLiquido extends vscode.TaskDefinition {
    type: typeof TIPO_TAREFA_LIQUIDO;
    comando: string;
}

/**
 * Provedor de tarefas para o host de extensão de desktop.
 *
 * Cada comando do CLI `liquido` vira uma `vscode.Task` executada via
 * `ShellExecution`, chamando o binário `liquido` local do projeto
 * (`node_modules/.bin/liquido`). Assim o usuário roda servidor, geração,
 * documentação, banco e testes pela paleta de tarefas, sem alternar para um
 * terminal externo nem decorar comandos.
 */
export class ProvedorTarefasLiquidoDesktop implements vscode.TaskProvider {
    static readonly tipo = TIPO_TAREFA_LIQUIDO;

    provideTasks(): vscode.Task[] {
        return comandosLiquido.map(comando => this.criarTarefa(comando));
    }

    resolveTask(tarefa: vscode.Task): vscode.Task | undefined {
        const comando = comandoPorId((tarefa.definition as DefinicaoTarefaLiquido).comando);
        if (!comando) {
            return undefined;
        }
        // Preserva a definição informada pelo usuário (em tasks.json) ao
        // reconstruir a execução.
        return this.criarTarefa(comando, tarefa.definition as DefinicaoTarefaLiquido);
    }

    private criarTarefa(
        comando: ComandoLiquido,
        definicao?: DefinicaoTarefaLiquido
    ): vscode.Task {
        const definicaoTarefa: DefinicaoTarefaLiquido = definicao ?? {
            type: TIPO_TAREFA_LIQUIDO,
            comando: comando.id
        };

        // Caminho para o binário local do projeto, entre aspas para tolerar
        // espaços no caminho da pasta de trabalho.
        const binarioLiquido = '"${workspaceFolder}/node_modules/.bin/liquido"';
        const execucao = new vscode.ShellExecution(binarioLiquido, comando.argumentosCli);

        const tarefa = new vscode.Task(
            definicaoTarefa,
            vscode.TaskScope.Workspace,
            comando.titulo.replace(/^Liquido:\s*/, ''),
            'liquido',
            execucao
        );

        // O servidor é um processo de longa duração: mantém o painel dedicado e
        // não some ao terminar. Os demais são de execução curta.
        tarefa.isBackground = comando.requerServidor === true;
        tarefa.presentationOptions = {
            reveal: vscode.TaskRevealKind.Always,
            panel: comando.requerServidor
                ? vscode.TaskPanelKind.Dedicated
                : vscode.TaskPanelKind.Shared,
            clear: true
        };
        tarefa.detail = comando.descricao;

        return tarefa;
    }
}
