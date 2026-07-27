import * as vscode from 'vscode';

import { comandosLiquido, comandoPorId, TIPO_TAREFA_LIQUIDO, ComandoLiquido } from './comandos-liquido';
import { PseudoterminalLiquido } from './pseudoterminal-liquido';

interface DefinicaoTarefaLiquido extends vscode.TaskDefinition {
    type: typeof TIPO_TAREFA_LIQUIDO;
    comando: string;
}

/**
 * Provedor de tarefas para o host de extensão Web (vscode.dev, github.dev).
 *
 * O host Web não tem shell nem `child_process`, então `ShellExecution` não
 * funciona. Cada comando é executado por `CustomExecution`: o callback devolve
 * um `Pseudoterminal` que roda como JS dentro do _web worker_ da extensão.
 *
 * Só os comandos marcados como `disponivelNaWeb` são oferecidos; o servidor de
 * desenvolvimento (que exige HTTP real) é omitido aqui.
 */
export class ProvedorTarefasLiquidoWeb implements vscode.TaskProvider {
    static readonly tipo = TIPO_TAREFA_LIQUIDO;

    provideTasks(): vscode.Task[] {
        return comandosLiquido
            .filter(comando => comando.disponivelNaWeb && !comando.requerServidor)
            .map(comando => this.criarTarefa(comando));
    }

    resolveTask(tarefa: vscode.Task): vscode.Task | undefined {
        const comando = comandoPorId((tarefa.definition as DefinicaoTarefaLiquido).comando);
        if (!comando || !comando.disponivelNaWeb || comando.requerServidor) {
            return undefined;
        }
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

        const execucao = new vscode.CustomExecution(
            async (): Promise<vscode.Pseudoterminal> => new PseudoterminalLiquido(comando)
        );

        const tarefa = new vscode.Task(
            definicaoTarefa,
            vscode.TaskScope.Workspace,
            comando.titulo.replace(/^Liquido:\s*/, ''),
            'liquido',
            execucao
        );
        tarefa.detail = comando.descricao;
        return tarefa;
    }
}
