import * as vscode from 'vscode';
import { EsquemaPropriedade, TipoValor } from '../../interfaces';

/**
 * Propriedades conhecidas do namespace `liquido.roteador`.
 */
const esquemaRoteador: Record<string, EsquemaPropriedade> = {
    'diretorioEstatico': { tipo: 'texto' },
    'cors': { tipo: 'logico' },
    'bodyParser': { tipo: 'logico' },
    'morgan': { tipo: 'logico' },
    'cookieParser': { tipo: 'logico' },
    'passport': { tipo: 'logico' },
    'json': { tipo: 'logico' },
    'helmet': { tipo: 'logico' },
    'porta': { tipo: 'numero' },
};

/**
 * Propriedades conhecidas dentro de uma fonte de dados (`liquido.dados.<nome>`).
 */
const esquemaFonteDados: Record<string, EsquemaPropriedade> = {
    'tecnologia': { tipo: 'texto', valoresPermitidos: ['sqlite', 'mysql', 'postgres', 'mongodb', 'mssql'] },
    'caminho': { tipo: 'texto' },
    'host': { tipo: 'texto' },
    'porta': { tipo: 'numero' },
    'usuario': { tipo: 'texto' },
    'senha': { tipo: 'texto' },
    'banco': { tipo: 'texto' },
};

/**
 * Propriedades conhecidas do namespace `liquido.autenticacao`.
 */
const esquemaAutenticacao: Record<string, EsquemaPropriedade> = {
    'tecnologia': { tipo: 'texto', valoresPermitidos: ['jwt', 'session'] },
    'segredo': { tipo: 'texto' },
    'expiracao': { tipo: 'texto' },
};

function inferirTipoValor(valor: string): TipoValor | null {
    const v = valor.trim();
    if (v === 'verdadeiro' || v === 'falso') return 'logico';
    if (/^-?[0-9]+(\.[0-9]+)?$/.test(v)) return 'numero';
    if (/^'.*'$/.test(v) || /^".*"$/.test(v)) return 'texto';
    return null;
}

function extrairValorTexto(valor: string): string {
    const v = valor.trim();
    return v.slice(1, -1);
}

function validarPropriedadeLiquido(
    segmentos: string[],
    valor: string,
    linha: number,
    diagnosticos: vscode.Diagnostic[]
): void {
    if (segmentos.length < 2) {
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
            `Propriedade 'liquido' incompleta. Esperado pelo menos 'liquido.<namespace>.<propriedade>'.`,
            vscode.DiagnosticSeverity.Error
        ));
        return;
    }

    const namespace = segmentos[1];

    if (namespace === 'roteador') {
        if (segmentos.length < 3) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
                `Propriedade 'liquido.roteador' incompleta. Esperado 'liquido.roteador.<propriedade>'.`,
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }
        const propriedade = segmentos[2];
        const esquema = esquemaRoteador[propriedade];
        if (!esquema) {
            const conhecidas = Object.keys(esquemaRoteador).join(', ');
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
                `Propriedade desconhecida 'liquido.roteador.${propriedade}'. Propriedades conhecidas: ${conhecidas}.`,
                vscode.DiagnosticSeverity.Warning
            ));
            return;
        }
        validarTipoEValor(valor, esquema, `liquido.roteador.${propriedade}`, linha, diagnosticos);

    } else if (namespace === 'dados') {
        if (segmentos.length < 4) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
                `Propriedade 'liquido.dados' incompleta. Esperado 'liquido.dados.<nome>.<propriedade>'.`,
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }
        const nomeFonte = segmentos[2];
        const propriedade = segmentos[3];
        const esquema = esquemaFonteDados[propriedade];
        if (!esquema) {
            const conhecidas = Object.keys(esquemaFonteDados).join(', ');
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
                `Propriedade desconhecida 'liquido.dados.${nomeFonte}.${propriedade}'. Propriedades conhecidas: ${conhecidas}.`,
                vscode.DiagnosticSeverity.Warning
            ));
            return;
        }
        validarTipoEValor(valor, esquema, `liquido.dados.${nomeFonte}.${propriedade}`, linha, diagnosticos);

    } else if (namespace === 'autenticacao') {
        if (segmentos.length < 3) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
                `Propriedade 'liquido.autenticacao' incompleta. Esperado 'liquido.autenticacao.<propriedade>'.`,
                vscode.DiagnosticSeverity.Error
            ));
            return;
        }
        const propriedade = segmentos[2];
        const esquema = esquemaAutenticacao[propriedade];
        if (!esquema) {
            const conhecidas = Object.keys(esquemaAutenticacao).join(', ');
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
                `Propriedade desconhecida 'liquido.autenticacao.${propriedade}'. Propriedades conhecidas: ${conhecidas}.`,
                vscode.DiagnosticSeverity.Warning
            ));
            return;
        }
        validarTipoEValor(valor, esquema, `liquido.autenticacao.${propriedade}`, linha, diagnosticos);

    } else {
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
            `Namespace desconhecido 'liquido.${namespace}'. Namespaces conhecidos: roteador, dados, autenticacao.`,
            vscode.DiagnosticSeverity.Warning
        ));
    }
}

function validarTipoEValor(
    valor: string,
    esquema: EsquemaPropriedade,
    caminhoCompleto: string,
    linha: number,
    diagnosticos: vscode.Diagnostic[]
): void {
    const tipoInferido = inferirTipoValor(valor);
    if (tipoInferido === null) {
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
            `Valor inválido para '${caminhoCompleto}': '${valor.trim()}' não é um texto, número ou lógico reconhecido.`,
            vscode.DiagnosticSeverity.Error
        ));
        return;
    }
    if (tipoInferido !== esquema.tipo) {
        const nomesTipos: Record<TipoValor, string> = {
            logico: 'lógico (verdadeiro/falso)',
            texto: 'texto (entre aspas)',
            numero: 'número'
        };
        diagnosticos.push(new vscode.Diagnostic(
            new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
            `Tipo incorreto para '${caminhoCompleto}': esperado ${nomesTipos[esquema.tipo]}, recebido ${nomesTipos[tipoInferido]}.`,
            vscode.DiagnosticSeverity.Error
        ));
        return;
    }
    if (esquema.valoresPermitidos && tipoInferido === 'texto') {
        const valorTexto = extrairValorTexto(valor.trim());
        if (!esquema.valoresPermitidos.includes(valorTexto)) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(linha, 0, linha, Number.MAX_VALUE),
                `Valor '${valorTexto}' não é permitido para '${caminhoCompleto}'. Valores permitidos: ${esquema.valoresPermitidos.map(v => `'${v}'`).join(', ')}.`,
                vscode.DiagnosticSeverity.Error
            ));
        }
    }
}

/**
 * Analisa um documento `.delprops` e retorna todos os diagnósticos encontrados.
 */
export function validarDelprops(documento: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnosticos: vscode.Diagnostic[] = [];

    for (let i = 0; i < documento.lineCount; i++) {
        const linhaTexto = documento.lineAt(i).text;
        const semComentario = linhaTexto.replace(/\/\/.*$/, '').trim();

        if (semComentario === '') continue;

        const indiceIgual = semComentario.indexOf('=');
        if (indiceIgual === -1) {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, Number.MAX_VALUE),
                `Linha inválida: esperado o formato '<chave> = <valor>'.`,
                vscode.DiagnosticSeverity.Error
            ));
            continue;
        }

        const chave = semComentario.slice(0, indiceIgual).trim();
        const valor = semComentario.slice(indiceIgual + 1).trim();

        if (chave === '') {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, Number.MAX_VALUE),
                `Chave ausente antes do '='.`,
                vscode.DiagnosticSeverity.Error
            ));
            continue;
        }

        if (valor === '') {
            diagnosticos.push(new vscode.Diagnostic(
                new vscode.Range(i, 0, i, Number.MAX_VALUE),
                `Valor ausente após o '=' para a propriedade '${chave}'.`,
                vscode.DiagnosticSeverity.Error
            ));
            continue;
        }

        const segmentos = chave.split('.');
        const raiz = segmentos[0];

        if (raiz === 'liquido') {
            validarPropriedadeLiquido(segmentos, valor, i, diagnosticos);
        }
        // Outros namespaces são permitidos sem validação de esquema.
    }

    return diagnosticos;
}
