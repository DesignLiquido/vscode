import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import realExecutablePath from 'real-executable-path';
import { DeleguaTempoExecucao } from "./delegua-tempo-execucao";

export class InvocacaoDelegua {
    /**
     * Localiza o executável padrão no sistema, se houver.
     * @returns String com o caminho para o executável.
     */
    public static localizarExecutavel(): Promise<string> {
        return new Promise<string>((resolve) => {
            realExecutablePath('delegua').then((resposta: any) => {
                console.log('real-executable-path:', resposta);
                resolve(resposta);
            });
        });
    }

    /**
     * Efetivamente invoca Delégua em modo de depuração.
     * @param caminhoExecutavel O caminho do executável. Pode ser ou o resultado de `localizarExecutavel` ou uma configuração previamente definida.
     * @param callbackResolucao Função chamada quando o servidor de depuração está pronto.
     * @param tempoExecucao Instância do tempo de execução. Quando a execução do processo finaliza, a extensão precisa ser informada que a depuração acabou.
     * @returns Objeto contendo dados do processo do executável Delégua. É usado pela sessão de depuração para algumas notificações da extensão.
     */
    public static invocarDelegua(caminhoExecutavel: string, 
            arquivoInicial: string, 
            callbackResolucao: (value: any) => void, 
            tempoExecucao: DeleguaTempoExecucao): ChildProcessWithoutNullStreams 
    {
        const processoDelegua: ChildProcessWithoutNullStreams = spawn(caminhoExecutavel, [
            "--depurador", 
            arquivoInicial
        ]);

        processoDelegua.on('spawn', () => {
            console.log('Inicializando Delégua...');
        });

        processoDelegua.stdout.on('data', (data) => {
            console.log(`[Delégua]: ${data}`);
            // TODO: Pensar numa forma melhor de capturar esse evento aqui.
            if (data.includes('7777')) {
                callbackResolucao(true);
            }
        });

        processoDelegua.stderr.on('data', (data) => {
            console.log(`[Delégua Erro]: ${data}`);
        });

        processoDelegua.on('exit', (code, signal) => {
            console.log(`[Delégua Saída]: ${code} código: ${signal}`);
            tempoExecucao.desconectarDoDepurador();
        });

        processoDelegua.on('close', (code: number, args: any[])=> {
            console.log(`[Delégua Fechamento]: ${code} argumentos: ${args}`);
        });
        

        return processoDelegua;
    }
}