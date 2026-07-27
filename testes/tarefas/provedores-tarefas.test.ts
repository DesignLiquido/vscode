// @ts-nocheck
import { describe, it, expect, jest } from '@jest/globals';

/**
 * Testes de regressão para o achado A6 (issue #105):
 * o TaskProvider do Liquido deve expor os comandos do CLI, usar
 * ShellExecution no desktop e CustomExecution na Web, e a Web não deve
 * oferecer o servidor de desenvolvimento (que exige HTTP real).
 */

// Classes mínimas que imitam a API de Task do VSCode, registrando o tipo de
// execução usado para que os testes possam distingui-lo.
jest.mock('vscode', () => {
    class ShellExecution {
        constructor(public commandLine: string, public args: string[]) {}
    }
    class CustomExecution {
        constructor(public callback: any) {}
    }
    class Task {
        isBackground = false;
        presentationOptions: any = {};
        detail = '';
        constructor(
            public definition: any,
            public scope: any,
            public name: string,
            public source: string,
            public execution: any
        ) {}
    }
    class EventEmitter {
        event = jest.fn();
        fire = jest.fn();
        dispose = jest.fn();
    }
    return {
        ShellExecution,
        CustomExecution,
        Task,
        EventEmitter,
        TaskScope: { Workspace: 2 },
        TaskRevealKind: { Always: 1 },
        TaskPanelKind: { Shared: 1, Dedicated: 2 },
        workspace: { workspaceFolders: undefined }
    };
}, { virtual: true });

import { comandosLiquido, comandoPorId, TIPO_TAREFA_LIQUIDO } from '../../fontes/tarefas/comandos-liquido';
import { ProvedorTarefasLiquidoDesktop } from '../../fontes/tarefas/provedor-tarefas-desktop';
import { ProvedorTarefasLiquidoWeb } from '../../fontes/tarefas/provedor-tarefas-web';
import { PseudoterminalLiquido } from '../../fontes/tarefas/pseudoterminal-liquido';

describe('Catálogo de comandos Liquido', () => {
    it('inclui os comandos essenciais do CLI', () => {
        const ids = comandosLiquido.map(c => c.id);
        for (const esperado of ['servidor', 'novo', 'gerar', 'documentar', 'banco-iniciar', 'testes']) {
            expect(ids).toContain(esperado);
        }
    });

    it('marca apenas o servidor como requerServidor', () => {
        const comServidor = comandosLiquido.filter(c => c.requerServidor);
        expect(comServidor).toHaveLength(1);
        expect(comServidor[0].id).toBe('servidor');
    });

    it('comandoPorId resolve e devolve undefined para desconhecido', () => {
        expect(comandoPorId('gerar')?.id).toBe('gerar');
        expect(comandoPorId('inexistente')).toBeUndefined();
    });
});

describe('ProvedorTarefasLiquidoDesktop', () => {
    const provedor = new ProvedorTarefasLiquidoDesktop();

    it('oferece uma tarefa por comando do catálogo', () => {
        const tarefas = provedor.provideTasks();
        expect(tarefas).toHaveLength(comandosLiquido.length);
    });

    it('usa ShellExecution chamando o binário local com os argumentos certos', () => {
        const tarefas = provedor.provideTasks();
        const gerar = tarefas.find(t => t.definition.comando === 'gerar');
        expect(gerar.execution.constructor.name).toBe('ShellExecution');
        expect(gerar.execution.commandLine).toContain('node_modules/.bin/liquido');
        expect(gerar.execution.args).toEqual(['gerar']);

        const banco = tarefas.find(t => t.definition.comando === 'banco-iniciar');
        expect(banco.execution.args).toEqual(['banco', 'iniciar']);
    });

    it('marca a tarefa do servidor como background e painel dedicado', () => {
        const servidor = provedor.provideTasks().find(t => t.definition.comando === 'servidor');
        expect(servidor.isBackground).toBe(true);
        expect(servidor.presentationOptions.panel).toBe(2 /* Dedicated */);
    });

    it('resolveTask reconstrói tarefa conhecida e ignora desconhecida', () => {
        const resolvida = provedor.resolveTask({
            definition: { type: TIPO_TAREFA_LIQUIDO, comando: 'documentar' }
        });
        expect(resolvida?.execution.args).toEqual(['documentar']);

        const desconhecida = provedor.resolveTask({
            definition: { type: TIPO_TAREFA_LIQUIDO, comando: 'xyz' }
        });
        expect(desconhecida).toBeUndefined();
    });
});

describe('ProvedorTarefasLiquidoWeb', () => {
    const provedor = new ProvedorTarefasLiquidoWeb();

    it('não oferece o servidor de desenvolvimento na Web', () => {
        const ids = provedor.provideTasks().map(t => t.definition.comando);
        expect(ids).not.toContain('servidor');
    });

    it('oferece os comandos de scaffolding via CustomExecution', () => {
        const tarefas = provedor.provideTasks();
        const gerar = tarefas.find(t => t.definition.comando === 'gerar');
        expect(gerar.execution.constructor.name).toBe('CustomExecution');
        expect(typeof gerar.execution.callback).toBe('function');
    });

    it('resolveTask recusa o servidor na Web', () => {
        const servidor = provedor.resolveTask({
            definition: { type: TIPO_TAREFA_LIQUIDO, comando: 'servidor' }
        });
        expect(servidor).toBeUndefined();
    });
});

describe('PseudoterminalLiquido', () => {
    /** Coleta o que o pseudoterminal escreve e o código de saída. */
    async function executar(comando: any): Promise<{ saida: string; codigo: number }> {
        const pseudo = new PseudoterminalLiquido(comando);
        let saida = '';
        let codigo = -1;
        pseudo.onDidWrite = ((texto: string) => { saida += texto; }) as any;
        pseudo.onDidClose = ((c: number) => { codigo = c; }) as any;
        // Substitui os emissores por captura direta.
        (pseudo as any).emissorEscrita = { fire: (t: string) => { saida += t; }, dispose: jest.fn() };
        (pseudo as any).emissorFechamento = { fire: (c: number) => { codigo = c; }, dispose: jest.fn() };
        await pseudo.open();
        return { saida, codigo };
    }

    it('encerra com código de erro para o comando de servidor', async () => {
        const { saida, codigo } = await executar(comandoPorId('servidor'));
        expect(codigo).toBe(1);
        expect(saida).toContain('servidor de desenvolvimento');
    });

    it('reporta o comando de scaffolding e encerra sem erro de execução', async () => {
        const { saida } = await executar(comandoPorId('gerar'));
        expect(saida).toContain('Gerar código');
    });
});
