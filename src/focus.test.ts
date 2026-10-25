import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// jsdom does not compute styles (and Vitest stubs CSS imports), so the visible
// focus (RQ-11) is guarded at the source: a global :focus-visible rule, and no
// stylesheet that removes outlines.
const srcDir = join(process.cwd(), 'src')
const stylesheets: Record<string, string> = Object.fromEntries(
  readdirSync(srcDir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.css'))
    .map((file) => [file.replaceAll('\\', '/'), readFileSync(join(srcDir, file), 'utf8')]),
)

describe('visible focus (RQ-11)', () => {
  it('finds the project stylesheets', () => {
    expect(Object.keys(stylesheets)).toContain('index.css')
    expect(Object.keys(stylesheets).length).toBeGreaterThan(1)
  })

  it('defines a global :focus-visible outline', () => {
    expect(stylesheets['index.css']).toMatch(/:focus-visible\s*\{[^}]*outline:\s*\d+px solid/)
  })

  it('never removes the outline of a control', () => {
    const offenders = Object.entries(stylesheets)
      .filter(([, css]) => /outline:\s*(none|0)\b/.test(css))
      .map(([file]) => file)
    expect(offenders).toEqual([])
  })
})
