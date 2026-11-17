declare module 'eslint-plugin-fsd-lint' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    configs: Record<'recommended' | 'strict' | 'base', Linter.Config>
  }

  export default plugin
}
