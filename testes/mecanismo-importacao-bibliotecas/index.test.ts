// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@designliquido/delegua/interpretador/estruturas', () => ({
    DeleguaModulo: class DeleguaModulo {
        nome: string;
        componentes: Record<string, any> = {};
        constructor(nome: string) { this.nome = nome; }
    },
    FuncaoPadrao: class FuncaoPadrao {
        constructor(public aridade: number, public fn: Function) {}
    },
}), { virtual: true });

jest.mock('@designliquido/delegua-interface-grafica', () => ({
    InfraestruturaWebView: class InfraestruturaWebView {
        constructor(public painel: any) {}
    },
    InterfaceGrafica: class InterfaceGrafica {
        constructor(public infra: any) {}
        janela() {}
        botao() {}
        rotulo() {}
        caixaTexto() {}
        caixaVertical() {}
        caixaHorizontal() {}
        definirTexto() {}
        obterTexto() {}
        aoClicar() {}
        aoAlterar() {}
        iniciar() {}
        encerrar() {}
    },
}), { virtual: true });

import {
    definirFabricaPainelWebView,
    verificarModulosDelegua,
    carregarBibliotecaDelegua,
} from '../../fontes/mecanismo-importacao-bibliotecas';

describe('verificarModulosDelegua', () => {
    it('módulo conhecido retorna pacote npm', () => {
        expect(verificarModulosDelegua('arquivos')).toBe('@designliquido/delegua-arquivos');
        expect(verificarModulosDelegua('matematica')).toBe('@designliquido/delegua-matematica');
        expect(verificarModulosDelegua('matemática')).toBe('@designliquido/delegua-matematica');
        expect(verificarModulosDelegua('http')).toBe('@designliquido/delegua-http');
    });

    it('módulo desconhecido retorna false', () => {
        expect(verificarModulosDelegua('inexistente')).toBe(false);
        expect(verificarModulosDelegua('')).toBe(false);
    });
});

describe('definirFabricaPainelWebView', () => {
    it('registra fábrica sem lançar erro', () => {
        expect(() => definirFabricaPainelWebView(() => ({}))).not.toThrow();
    });
});

describe('carregarBibliotecaDelegua', () => {
    beforeEach(() => {
        // Registra fábrica antes de cada teste que precisa dela
        definirFabricaPainelWebView(() => ({ id: 'painel-mock' }));
    });

    it('carrega InterfaceGrafica com fábrica registrada', () => {
        const modulo = carregarBibliotecaDelegua('InterfaceGrafica');
        expect(modulo).toBeDefined();
        expect(modulo.nome).toBe('InterfaceGrafica');
        expect(modulo.componentes).toBeDefined();
        expect(typeof modulo.componentes.janela).toBeDefined();
    });

    it('carrega InterfaceGrafica — nome case insensitive', () => {
        const modulo = carregarBibliotecaDelegua('interfacegrafica');
        expect(modulo.nome).toBe('InterfaceGrafica');
    });

    it('biblioteca externa lança erro', () => {
        expect(() => carregarBibliotecaDelegua('http')).toThrow('não é suportada na extensão VSCode');
    });

    it('fábrica não registrada lança erro', () => {
        // Reseta a fábrica para null
        definirFabricaPainelWebView(null as any);
        expect(() => carregarBibliotecaDelegua('InterfaceGrafica')).toThrow('fábrica de painel não registrada');
    });
});
