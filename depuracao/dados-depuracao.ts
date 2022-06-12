export abstract class DadosDepuracao {
    static id = 0;

    public static mesmaInstancia(idInstancia: number): boolean {
        return DadosDepuracao.id === idInstancia;
    }

    public static obterId(): number {
        return DadosDepuracao.id;
    }

    public static obterProximoId(): number {
        return ++DadosDepuracao.id;
    }
}
