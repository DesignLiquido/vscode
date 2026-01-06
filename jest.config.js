/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    // Arquivos de teste
    testMatch: [
        '**/teste/**/*.test.ts',
        '**/*.test.ts'
    ],

    // Ignorar node_modules e dist
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],

    // Configuração do TypeScript
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                baseUrl: '.',
                module: 'commonjs',
                target: 'ES2020',
                strict: false,
                noImplicitAny: false,
                removeComments: false,
                noUnusedLocals: false,
                noImplicitThis: false,
                strictNullChecks: false,
                strictPropertyInitialization: false,
                noUnusedParameters: false,
                esModuleInterop: true,
                skipLibCheck: true
            }
        }]
    },

    // Mapeamento de módulos
    // Nota: Os módulos @designliquido não usam pasta 'dist', os arquivos estão na raiz
    moduleNameMapper: {
        '^@designliquido/birl/(.*)$': '<rootDir>/node_modules/@designliquido/birl/$1',
        '^@designliquido/birl$': '<rootDir>/node_modules/@designliquido/birl',
        '^@designliquido/delegua/(.*)$': '<rootDir>/node_modules/@designliquido/delegua/$1',
        '^@designliquido/delegua$': '<rootDir>/node_modules/@designliquido/delegua',
        '^@designliquido/mapler/(.*)$': '<rootDir>/node_modules/@designliquido/mapler/$1',
        '^@designliquido/mapler$': '<rootDir>/node_modules/@designliquido/mapler',
        '^@designliquido/portugol-studio/(.*)$': '<rootDir>/node_modules/@designliquido/portugol-studio/$1',
        '^@designliquido/portugol-studio$': '<rootDir>/node_modules/@designliquido/portugol-studio',
        '^@designliquido/potigol/(.*)$': '<rootDir>/node_modules/@designliquido/potigol/$1',
        '^@designliquido/potigol$': '<rootDir>/node_modules/@designliquido/potigol',
        '^@designliquido/visualg/(.*)$': '<rootDir>/node_modules/@designliquido/visualg/$1',
        '^@designliquido/visualg$': '<rootDir>/node_modules/@designliquido/visualg'
    },

    // Extensões de arquivo
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // Cobertura de código
    collectCoverageFrom: [
        'fontes/**/*.ts',
        '!fontes/**/*.d.ts',
        '!**/node_modules/**',
        '!**/dist/**'
    ],

    // Diretório de cobertura
    coverageDirectory: 'coverage',

    // Reporters de cobertura
    coverageReporters: ['text', 'lcov', 'html', 'text-summary'],

    // Limites de cobertura (opcional)
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0
        }
    },

    // Configurações adicionais
    verbose: true,
    clearMocks: true,
    restoreMocks: true,
    resetMocks: true,

    // Timeout para testes (10 segundos)
    testTimeout: 10000
};
