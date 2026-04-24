import { ResultadoAnaliseInterface } from '../interfaces';
import { EntradaCacheAnalise, OpcoesDefinirResultado, OpcoesValidacaoResultado } from '../interfaces/caches';

export const TTL_PADRAO_CACHE_ANALISE_MS = 10 * 60 * 1000;

const cache = new Map<string, EntradaCacheAnalise>();
const indiceDependenciasPorArquivo = new Map<string, Set<string>>();

function normalizarCaminhoArquivo(caminho: string): string {
    let resultado = caminho.trim();

    if (resultado.startsWith('file://')) {
        resultado = decodeURIComponent(resultado.replace(/^file:\/\//i, ''));
        if (/^\/[a-zA-Z]:\//.test(resultado)) {
            resultado = resultado.substring(1);
        }
    }

    return resultado.replace(/\\/g, '/').toLowerCase();
}

function removerDependenciasDoIndice(uri: string, dependenciasArquivos: string[]): void {
    for (const dependencia of dependenciasArquivos) {
        const chaveDependencia = normalizarCaminhoArquivo(dependencia);
        const entradasDependentes = indiceDependenciasPorArquivo.get(chaveDependencia);

        if (!entradasDependentes) {
            continue;
        }

        entradasDependentes.delete(uri);
        if (!entradasDependentes.size) {
            indiceDependenciasPorArquivo.delete(chaveDependencia);
        }
    }
}

function registrarDependenciasNoIndice(uri: string, dependenciasArquivos: string[]): string[] {
    const dependenciasNormalizadas = Array.from(
        new Set(
            dependenciasArquivos
                .filter(Boolean)
                .map(normalizarCaminhoArquivo)
        )
    );

    for (const dependencia of dependenciasNormalizadas) {
        const entradasDependentes = indiceDependenciasPorArquivo.get(dependencia) || new Set<string>();
        entradasDependentes.add(uri);
        indiceDependenciasPorArquivo.set(dependencia, entradasDependentes);
    }

    return dependenciasNormalizadas;
}

function removerEntrada(uri: string): void {
    const entrada = cache.get(uri);
    if (!entrada) {
        return;
    }

    removerDependenciasDoIndice(uri, entrada.dependenciasArquivos || []);
    cache.delete(uri);
}

function obterEntradaValida(uri: string): EntradaCacheAnalise | undefined {
    const entrada = cache.get(uri);
    if (!entrada) {
        return undefined;
    }

    if (Date.now() > entrada.expiraEm) {
        removerEntrada(uri);
        return undefined;
    }

    return entrada;
}

export function definirResultado(uri: string, resultado: ResultadoAnaliseInterface, opcoes?: OpcoesDefinirResultado) {
    const agora = Date.now();
    const ttlMs = opcoes?.ttlMs ?? TTL_PADRAO_CACHE_ANALISE_MS;
    const entradaAnterior = cache.get(uri);

    if (entradaAnterior) {
        removerDependenciasDoIndice(uri, entradaAnterior.dependenciasArquivos || []);
    }

    const dependenciasArquivos = registrarDependenciasNoIndice(uri, opcoes?.dependenciasArquivos || []);

    cache.set(uri, {
        resultado,
        diagnosticos: opcoes?.diagnosticos ?? [],
        dependenciasArquivos,
        criadoEm: agora,
        expiraEm: agora + ttlMs,
        ttlMs,
        versaoDocumento: opcoes?.versaoDocumento,
        hashConteudo: opcoes?.hashConteudo,
        motivo: opcoes?.motivo,
    });
}

export function obterResultado(uri: string): ResultadoAnaliseInterface | undefined {
    return obterEntradaValida(uri)?.resultado;
}

export function obterResultadoValido(uri: string, opcoes?: OpcoesValidacaoResultado): ResultadoAnaliseInterface | undefined {
    const entrada = obterEntradaValida(uri);
    if (!entrada) {
        return undefined;
    }

    if (opcoes?.versaoDocumento !== undefined && opcoes.versaoDocumento !== entrada.versaoDocumento) {
        return undefined;
    }

    if (opcoes?.hashConteudo !== undefined && opcoes.hashConteudo !== entrada.hashConteudo) {
        return undefined;
    }

    return entrada.resultado;
}

export function obterDiagnosticos(uri: string): any[] | undefined {
    return obterEntradaValida(uri)?.diagnosticos;
}

export function expirarResultado(uri: string, _motivo?: string): void {
    removerEntrada(uri);
}

export function expirarResultados(uris: string[], motivo?: string): void {
    for (const uri of uris) {
        expirarResultado(uri, motivo);
    }
}

export function expirarTudo(_motivo?: string): void {
    cache.clear();
    indiceDependenciasPorArquivo.clear();
}

export function expirarResultadosPorDependenciaArquivo(caminhosArquivos: string[], motivo?: string): void {
    const urisParaExpirar = new Set<string>();

    for (const caminho of caminhosArquivos) {
        const chaveDependencia = normalizarCaminhoArquivo(caminho);
        const entradasDependentes = indiceDependenciasPorArquivo.get(chaveDependencia);
        if (!entradasDependentes) {
            continue;
        }

        for (const uri of entradasDependentes) {
            urisParaExpirar.add(uri);
        }
    }

    expirarResultados(Array.from(urisParaExpirar), motivo);
}

export function limparResultadosExpirados(): number {
    let removidos = 0;

    for (const [uri, entrada] of cache.entries()) {
        if (Date.now() > entrada.expiraEm) {
            removerEntrada(uri);
            removidos++;
        }
    }

    return removidos;
}

export function obterEstatisticasCache() {
    return {
        totalEntradas: cache.size,
        totalDependenciasIndexadas: indiceDependenciasPorArquivo.size,
    };
}
