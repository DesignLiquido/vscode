export interface AcessorArquivos {
	lerArquivo(caminho: string): Promise<Uint8Array>;
	escreverArquivo(caminho: string, conteudo: Uint8Array): Promise<void>;
}
