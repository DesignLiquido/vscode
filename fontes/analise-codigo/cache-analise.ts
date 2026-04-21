import { ResultadoAnaliseInterface } from '../interfaces';

const cache = new Map<string, ResultadoAnaliseInterface>();

export function definirResultado(uri: string, resultado: ResultadoAnaliseInterface) {
    cache.set(uri, resultado);
}

export function obterResultado(uri: string): ResultadoAnaliseInterface | undefined {
    return cache.get(uri);
}
