import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs'])

const DIRS_TO_SKIP = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.turbo',
  '.vercel',
  'scripts',
])

function removeComments(source) {
  let result = ''
  let i = 0
  const len = source.length

  while (i < len) {
    if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
      const quote = source[i]
      result += quote
      i++

      while (i < len) {
        if (source[i] === '\\' && i + 1 < len) {
          result += source[i] + source[i + 1]
          i += 2
          continue
        }

        if (quote === '`' && source[i] === '$' && source[i + 1] === '{') {
          let depth = 1
          result += '${'
          i += 2

          while (i < len && depth > 0) {
            if (source[i] === '{') depth++
            if (source[i] === '}') depth--

            if (depth > 0) {
              result += source[i]
            } else {
              result += '}'
            }
            i++
          }
          continue
        }

        result += source[i]

        if (source[i] === quote) {
          i++
          break
        }
        i++
      }
      continue
    }

    if (source[i] === '/' && source[i + 1] === '/') {
      while (i < len && source[i] !== '\n') {
        i++
      }
      continue
    }

    if (source[i] === '/' && source[i + 1] === '*') {
      i += 2
      while (i < len) {
        if (source[i] === '*' && source[i + 1] === '/') {
          i += 2
          break
        }
        i++
      }
      continue
    }

    result += source[i]
    i++
  }

  result = result.replace(/\n{3,}/g, '\n\n')

  return result
}

function walkDir(dir) {
  const files = []

  for (const entry of readdirSync(dir)) {
    if (DIRS_TO_SKIP.has(entry)) continue

    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath))
    } else if (EXTENSIONS.has(extname(entry))) {
      files.push(fullPath)
    }
  }

  return files
}

const rootDir = process.argv[2] || '.'
const files = walkDir(rootDir)

let modified = 0

for (const file of files) {
  const original = readFileSync(file, 'utf-8')
  const cleaned = removeComments(original)

  if (cleaned !== original) {
    writeFileSync(file, cleaned, 'utf-8')
    modified++
    console.log(`✓ ${file}`)
  }
}

console.log(`\n${modified} arquivo(s) limpo(s).`)
