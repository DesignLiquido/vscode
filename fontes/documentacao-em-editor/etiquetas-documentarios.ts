import { DefinicaoEtiquetaDocumentarioInterface } from '../interfaces/definicao-etiqueta-documentario-interface';

export const definicoesTagsDocumentario: DefinicaoEtiquetaDocumentarioInterface[] = [
    { canonica: '@abstrato', aliases: ['@abstrato', '@abstract', '@virtual'], titulo: 'Abstrato' },
    { canonica: '@acesso', aliases: ['@acesso', '@access'], titulo: 'Acesso' },
    { canonica: '@apelido', aliases: ['@apelido', '@alias'], titulo: 'Apelido' },
    { canonica: '@assincrono', aliases: ['@assincrono', '@async'], titulo: 'Assincrono' },
    { canonica: '@arquivo', aliases: ['@arquivo', '@file', '@fileoverview', '@overview'], titulo: 'Arquivo' },
    { canonica: '@autor', aliases: ['@autor', '@author'], titulo: 'Autor' },
    { canonica: '@cede', aliases: ['@cede', '@lends'], titulo: 'Cede' },
    { canonica: '@classe', aliases: ['@classe', '@class', '@constructor'], titulo: 'Classe' },
    { canonica: '@constante', aliases: ['@constante', '@constant', '@const'], titulo: 'Constante' },
    { canonica: '@constroi', aliases: ['@constroi', '@constructs'], titulo: 'Constroi' },
    { canonica: '@definicaodetipo', aliases: ['@definicaodetipo', '@typedef'], titulo: 'Definicao de tipo' },
    { canonica: '@desde', aliases: ['@desde', '@since'], titulo: 'Desde' },
    { canonica: '@descricao', aliases: ['@descricao', '@description', '@desc'], titulo: 'Descricao' },
    { canonica: '@descricaodaclasse', aliases: ['@descricaodaclasse', '@classdesc'], titulo: 'Descricao da classe' },
    { canonica: '@direitosautorais', aliases: ['@direitosautorais', '@copyright'], titulo: 'Direitos autorais' },
    { canonica: '@dispara', aliases: ['@dispara', '@fires', '@emits'], titulo: 'Dispara' },
    { canonica: '@enumeracao', aliases: ['@enumeracao', '@enum'], titulo: 'Enumeracao' },
    { canonica: '@espacodenomes', aliases: ['@espacodenomes', '@namespace'], titulo: 'Espaco de nomes' },
    { canonica: '@estatico', aliases: ['@estatico', '@static'], titulo: 'Estatico' },
    { canonica: '@estende', aliases: ['@estende', '@augments', '@extends'], titulo: 'Estende' },
    { canonica: '@evento', aliases: ['@evento', '@event'], titulo: 'Evento' },
    { canonica: '@exemplo', aliases: ['@exemplo', '@example'], titulo: 'Exemplo' },
    { canonica: '@exporta', aliases: ['@exporta', '@exports'], titulo: 'Exporta' },
    { canonica: '@externo', aliases: ['@externo', '@external', '@host'], titulo: 'Externo' },
    { canonica: '@fazer', aliases: ['@fazer', '@todo'], titulo: 'Fazer' },
    { canonica: '@funcao', aliases: ['@funcao', '@function', '@func', '@method'], titulo: 'Funcao' },
    { canonica: '@gerador', aliases: ['@gerador', '@generator'], titulo: 'Gerador' },
    { canonica: '@global', aliases: ['@global'], titulo: 'Global' },
    { canonica: '@herdadoc', aliases: ['@herdadoc', '@inheritdoc'], titulo: 'Herdadoc' },
    { canonica: '@ignorar', aliases: ['@ignorar', '@ignore'], titulo: 'Ignorar' },
    { canonica: '@implementa', aliases: ['@implementa', '@implements'], titulo: 'Implementa' },
    { canonica: '@instancia', aliases: ['@instancia', '@instance'], titulo: 'Instancia' },
    { canonica: '@interface', aliases: ['@interface'], titulo: 'Interface' },
    { canonica: '@interno', aliases: ['@interno', '@inner'], titulo: 'Interno' },
    { canonica: '@isto', aliases: ['@isto', '@this'], titulo: 'Isto' },
    { canonica: '@lanca', aliases: ['@lanca', '@throws', '@exception'], titulo: 'Lanca' },
    { canonica: '@licenca', aliases: ['@licenca', '@license'], titulo: 'Licenca' },
    { canonica: '@membro', aliases: ['@membro', '@member', '@var'], titulo: 'Membro' },
    { canonica: '@membrode', aliases: ['@membrode', '@memberof'], titulo: 'Membro de' },
    { canonica: '@mescla', aliases: ['@mescla', '@mixes'], titulo: 'Mescla' },
    { canonica: '@mistura', aliases: ['@mistura', '@mixin'], titulo: 'Mistura' },
    { canonica: '@modulo', aliases: ['@modulo', '@module'], titulo: 'Modulo' },
    { canonica: '@nome', aliases: ['@nome', '@name'], titulo: 'Nome' },
    { canonica: '@obsoleto', aliases: ['@obsoleto', '@deprecated'], titulo: 'Obsoleto' },
    { canonica: '@ocultaconstrutor', aliases: ['@ocultaconstrutor', '@hideconstructor'], titulo: 'Oculta construtor' },
    { canonica: '@pacote', aliases: ['@pacote', '@package'], titulo: 'Pacote' },
    { canonica: '@padrao', aliases: ['@padrao', '@default', '@defaultvalue'], titulo: 'Padrao' },
    { canonica: '@param', aliases: ['@param', '@arg', '@argument'], titulo: 'Parametros' },
    { canonica: '@privado', aliases: ['@privado', '@private'], titulo: 'Privado' },
    { canonica: '@produz', aliases: ['@produz', '@yields', '@yield'], titulo: 'Produz' },
    { canonica: '@propriedade', aliases: ['@propriedade', '@property', '@prop'], titulo: 'Propriedades' },
    { canonica: '@protegido', aliases: ['@protegido', '@protected'], titulo: 'Protegido' },
    { canonica: '@publico', aliases: ['@publico', '@public'], titulo: 'Publico' },
    { canonica: '@requer', aliases: ['@requer', '@requires'], titulo: 'Requer' },
    { canonica: '@retorna', aliases: ['@retorna', '@returns', '@return'], titulo: 'Retorna' },
    { canonica: '@resumo', aliases: ['@resumo', '@summary'], titulo: 'Resumo' },
    { canonica: '@sobrescreve', aliases: ['@sobrescreve', '@override'], titulo: 'Sobrescreve' },
    { canonica: '@somenteleitura', aliases: ['@somenteleitura', '@readonly'], titulo: 'Somente leitura' },
    { canonica: '@tipo', aliases: ['@tipo', '@type'], titulo: 'Tipo' },
    { canonica: '@tipoitem', aliases: ['@tipoitem', '@kind'], titulo: 'Tipo do item' },
    { canonica: '@tutorial', aliases: ['@tutorial'], titulo: 'Tutorial' },
    { canonica: '@variacao', aliases: ['@variacao', '@variation'], titulo: 'Variacao' },
    { canonica: '@veja', aliases: ['@veja', '@see'], titulo: 'Veja tambem' },
    { canonica: '@versao', aliases: ['@versao', '@version'], titulo: 'Versao' },
    { canonica: '@empresta', aliases: ['@empresta', '@borrows'], titulo: 'Empresta' },
    { canonica: '@escuta', aliases: ['@escuta', '@listens'], titulo: 'Escuta' },
];

const mapaAliasParaCanonica = new Map<string, DefinicaoEtiquetaDocumentarioInterface>();

for (const definicao of definicoesTagsDocumentario) {
    for (const alias of definicao.aliases) {
        mapaAliasParaCanonica.set(alias.toLowerCase(), definicao);
    }
}

export function normalizarEtiquetaDocumentario(tag: string): DefinicaoEtiquetaDocumentarioInterface | undefined {
    const tagNormalizada = tag.startsWith('@') ? tag.toLowerCase() : `@${tag.toLowerCase()}`;
    return mapaAliasParaCanonica.get(tagNormalizada);
}

export function ehEtiquetaVeja(tag: string): boolean {
    return normalizarEtiquetaDocumentario(tag)?.canonica === '@veja';
}

export function obterAliasesEtiquetasDocumentario(): string[] {
    return Array.from(mapaAliasParaCanonica.keys()).sort();
}