/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'dominio-limpio',
      severity: 'error',
      comment: 'El dominio no depende de infraestructura ni presentación',
      from: { path: '^src/domain/' },
      to: { path: '^src/(infrastructure|presentation)/' },
    },
    {
      name: 'dominio-sin-framework',
      severity: 'error',
      comment: 'El dominio no puede importar frameworks de presentación ni dependencias HTTP (Express, etc.)',
      from: { path: '^src/domain/' },
      to: {
        path: '(express|@types/express|cors|body-parser|fastapi|flask)',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.ts', '.js', '.mjs', '.cjs'],
    },
  },
}
