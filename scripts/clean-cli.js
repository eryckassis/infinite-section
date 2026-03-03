import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname, relative } from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'

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
            result += depth > 0 ? source[i] : '}'
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
      while (i < len && source[i] !== '\n') i++
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

  return result.replace(/\n{3,}/g, '\n\n')
}

function walkDir(dir, rootDir) {
  const files = []

  for (const entry of readdirSync(dir)) {
    if (DIRS_TO_SKIP.has(entry)) continue

    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath, rootDir))
    } else if (EXTENSIONS.has(extname(entry))) {
      files.push({
        fullPath,
        relativePath: relative(rootDir, fullPath),
        size: stat.size,
      })
    }
  }

  return files
}

function hasComments(source) {
  return /\/\/[^\n]*|\/\*[\s\S]*?\*\//.test(source)
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`
  return `${(bytes / 1024).toFixed(1)}KB`
}

function printBanner() {
  console.log(
    chalk.bold.cyan(`
╔══════════════════════════════════════════╗
║           Comment Cleaner CLI            ║
║     Remove comments from source files    ║
╚══════════════════════════════════════════╝
`),
  )
}

function printSummary(results) {
  const total = results.length
  const cleaned = results.filter((r) => r.cleaned).length
  const skipped = results.filter((r) => !r.cleaned).length
  const savedBytes = results.reduce((acc, r) => acc + (r.savedBytes ?? 0), 0)

  console.log(
    chalk.bold(`
┌────────────────────────────────────────────────────────────────────────┐
│                            ✅  Summary                                 │
├────────────────────────────────────────────────────────────────────────┤
│  ${chalk.green(`Cleaned : ${String(cleaned).padEnd(3)}`)}              │
│  ${chalk.yellow(`Skipped : ${String(skipped).padEnd(3)}`)}             │
│  ${chalk.cyan(`Total   : ${String(total).padEnd(3)}`)}                 │
│  ${chalk.magenta(`Saved   : ${formatSize(savedBytes).padEnd(7)}`)}     │
└────────────────────────────────────────────────────────────────────────┘`),
  )
}

async function run() {
  printBanner()

  const rootDir = process.argv[2] || '.'
  const spinner = ora({
    text: chalk.dim('Scanning files...'),
    color: 'cyan',
  }).start()

  const allFiles = walkDir(rootDir, rootDir)

  const filesWithComments = allFiles.filter((f) => {
    try {
      return hasComments(readFileSync(f.fullPath, 'utf-8'))
    } catch {
      return false
    }
  })

  spinner.succeed(
    chalk.green(
      `Found ${chalk.bold(filesWithComments.length)} file(s) with comments out of ${chalk.bold(allFiles.length)} scanned`,
    ),
  )

  if (filesWithComments.length === 0) {
    console.log(chalk.cyan('\n✨ No comments found. Everything is clean!\n'))
    return
  }

  console.log()

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: chalk.bold('How do you want to proceed?'),
      choices: [
        {
          name: `${chalk.green('●')} Clean ALL files (${filesWithComments.length} files)`,
          value: 'all',
        },
        {
          name: `${chalk.yellow('●')} Select files manually`,
          value: 'select',
        },
        {
          name: `${chalk.cyan('●')} Preview changes only (dry run)`,
          value: 'preview',
        },
        {
          name: `${chalk.red('●')} Cancel`,
          value: 'cancel',
        },
      ],
    },
  ])

  if (mode === 'cancel') {
    console.log(chalk.yellow('\n⚠️  Operation cancelled.\n'))
    return
  }

  let selectedFiles = filesWithComments

  if (mode === 'select') {
    console.log()
    const { chosen } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'chosen',
        message: chalk.bold('Select files to clean:'),
        pageSize: 15,
        choices: filesWithComments.map((f) => ({
          name: `${chalk.cyan(f.relativePath)} ${chalk.dim(`(${formatSize(f.size)})`)}`,
          value: f,
          checked: true,
        })),
      },
    ])

    if (chosen.length === 0) {
      console.log(chalk.yellow('\n⚠️  No files selected.\n'))
      return
    }

    selectedFiles = chosen
  }

  if (mode === 'preview') {
    console.log(
      chalk.bold.cyan('\n📋 Preview — files that would be cleaned:\n'),
    )
    for (const f of filesWithComments) {
      const original = readFileSync(f.fullPath, 'utf-8')
      const cleaned = removeComments(original)
      const savedBytes = original.length - cleaned.length
      console.log(
        `  ${chalk.green('✓')} ${chalk.cyan(f.relativePath)} ${chalk.dim(`→ saves ${formatSize(savedBytes)}`)}`,
      )
    }
    console.log(
      chalk.dim(
        `\n  Total files: ${filesWithComments.length} | Run without preview to apply.\n`,
      ),
    )
    return
  }

  console.log()
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.bold(
        `Clean ${chalk.cyan(selectedFiles.length)} file(s)? This action cannot be undone.`,
      ),
      default: false,
    },
  ])

  if (!confirm) {
    console.log(chalk.yellow('\n⚠️  Operation cancelled.\n'))
    return
  }

  console.log()
  const cleanSpinner = ora({
    text: chalk.dim('Cleaning files...'),
    color: 'cyan',
  }).start()

  const results = []

  for (const f of selectedFiles) {
    try {
      const original = readFileSync(f.fullPath, 'utf-8')
      const cleaned = removeComments(original)
      const savedBytes = original.length - cleaned.length

      if (cleaned !== original) {
        writeFileSync(f.fullPath, cleaned, 'utf-8')
        results.push({ ...f, cleaned: true, savedBytes })
        cleanSpinner.text = chalk.dim(`Cleaned: ${f.relativePath}`)
      } else {
        results.push({ ...f, cleaned: false, savedBytes: 0 })
      }
    } catch (err) {
      results.push({ ...f, cleaned: false, savedBytes: 0, error: err })
    }
  }

  cleanSpinner.succeed(chalk.green('Done!'))

  console.log()
  for (const r of results) {
    if (r.error) {
      console.log(
        `  ${chalk.red('✗')} ${chalk.red(r.relativePath)} ${chalk.dim('(error)')}`,
      )
    } else if (r.cleaned) {
      console.log(
        `  ${chalk.green('✓')} ${chalk.cyan(r.relativePath)} ${chalk.dim(`(saved ${formatSize(r.savedBytes)})`)}`,
      )
    } else {
      console.log(
        `  ${chalk.dim('–')} ${chalk.dim(r.relativePath)} ${chalk.dim('(no changes)')}`,
      )
    }
  }

  printSummary(results)
}

run().catch((err) => {
  console.error(chalk.red('\n❌ Unexpected error:'), err)
  process.exit(1)
})
