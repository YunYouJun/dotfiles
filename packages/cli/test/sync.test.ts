import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, it } from 'vitest'
import { createSyncFixture, removePath, runCli, vscodeSettingsPath, writeFile } from './utils'

const originalRepoRoot = process.env.DOTFILES_REPO_ROOT
const originalHome = process.env.DOTFILES_HOME
let tempDir: string | undefined

function useFixture() {
  const fixture = createSyncFixture()
  tempDir = fixture.tempDir
  return fixture
}

function runCliOk(args: string[], repoRoot: string, homeRoot: string) {
  const result = runCli(args, repoRoot, homeRoot)
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  return result
}

afterEach(() => {
  removePath(tempDir)
  tempDir = undefined

  if (originalRepoRoot === undefined)
    delete process.env.DOTFILES_REPO_ROOT
  else
    process.env.DOTFILES_REPO_ROOT = originalRepoRoot

  if (originalHome === undefined)
    delete process.env.DOTFILES_HOME
  else
    process.env.DOTFILES_HOME = originalHome
})

describe('sync CLI', () => {
  it('push masks secrets and stores real values in .env.local', () => {
    const { repoRoot, homeRoot } = useFixture()
    writeFile(path.join(homeRoot, '.zshrc'), 'export API_TOKEN="secret-token-123"\nalias ll="ls -la"\n')
    writeFile(vscodeSettingsPath(homeRoot), '{"editor.fontSize":14}\n')

    runCliOk(['push', '--force'], repoRoot, homeRoot)

    const repoZshrc = fs.readFileSync(path.join(repoRoot, '.zshrc'), 'utf-8')
    assert.equal(repoZshrc.includes('secret-token-123'), false)
    assert.equal(repoZshrc.includes('{{DOTFILES_SECRET:API_TOKEN}}'), true)

    const envLocal = fs.readFileSync(path.join(repoRoot, '.env.local'), 'utf-8')
    assert.equal(envLocal.includes('API_TOKEN="secret-token-123"'), true)
  })

  it('pull restores secrets, and a later push removes sync metadata', () => {
    const { repoRoot, homeRoot } = useFixture()
    writeFile(path.join(repoRoot, '.zshrc'), 'export API_TOKEN="{{DOTFILES_SECRET:API_TOKEN}}"\nalias ll="ls -la"\n')
    writeFile(path.join(repoRoot, '.env.local'), 'API_TOKEN="secret-token-123"\n')
    writeFile(path.join(repoRoot, '.vscode', 'settings.json'), '{"editor.fontSize":14}\n')

    runCliOk(['pull', '--force'], repoRoot, homeRoot)

    const homeZshrcPath = path.join(homeRoot, '.zshrc')
    const homeZshrc = fs.readFileSync(homeZshrcPath, 'utf-8')
    assert.equal(homeZshrc.includes('secret-token-123'), true)
    assert.match(homeZshrc, /# synced by @yunyoujun\/dotfiles at /)

    runCliOk(['push', '--force'], repoRoot, homeRoot)

    const repoZshrc = fs.readFileSync(path.join(repoRoot, '.zshrc'), 'utf-8')
    assert.equal(repoZshrc.includes('secret-token-123'), false)
    assert.equal(repoZshrc.includes('# synced by'), false)
    assert.equal(repoZshrc, 'export API_TOKEN="{{DOTFILES_SECRET:API_TOKEN}}"\nalias ll="ls -la"\n')
  })

  it('dry-run does not write repo or home files', () => {
    const { repoRoot, homeRoot } = useFixture()
    writeFile(path.join(repoRoot, '.zshrc'), 'alias ll="ls -la"\n')
    writeFile(path.join(repoRoot, '.vscode', 'settings.json'), '{"editor.fontSize":14}\n')

    runCliOk(['sync', '--direction', 'pull', '--dry-run'], repoRoot, homeRoot)

    assert.equal(fs.existsSync(path.join(homeRoot, '.zshrc')), false)
    assert.equal(fs.existsSync(vscodeSettingsPath(homeRoot)), false)
  })

  it('diff masks local secrets before printing output', () => {
    const { repoRoot, homeRoot } = useFixture()
    writeFile(path.join(repoRoot, '.zshrc'), 'export API_TOKEN="{{DOTFILES_SECRET:API_TOKEN}}"\nalias ll="ls -la"\n')
    writeFile(path.join(repoRoot, '.vscode', 'settings.json'), '{"editor.fontSize":14}\n')
    writeFile(path.join(homeRoot, '.zshrc'), 'export API_TOKEN="secret-token-123"\nalias gs="git status"\n')
    writeFile(vscodeSettingsPath(homeRoot), '{"editor.fontSize":14}\n')

    const result = runCliOk(['diff'], repoRoot, homeRoot)

    assert.equal(result.stdout.includes('secret-token-123'), false)
    assert.equal(result.stdout.includes('{{DOTFILES_SECRET:API_TOKEN}}'), true)
    assert.equal(result.stdout.includes('alias gs="git status"'), true)
  })
})
