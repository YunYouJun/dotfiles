import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, it } from 'vitest'
import { detectSecrets, findPlaceholders, loadSecretsFile, maskSecrets, saveSecrets, unmaskSecrets } from '../src/secrets'
import { createTempDir, removePath } from './utils'

let tempDir: string | undefined
const originalRepoRoot = process.env.DOTFILES_REPO_ROOT

function useTempRepo() {
  tempDir = createTempDir('dotfiles-secrets-')
  process.env.DOTFILES_REPO_ROOT = tempDir
  return tempDir
}

afterEach(() => {
  removePath(tempDir)
  tempDir = undefined

  if (originalRepoRoot === undefined)
    delete process.env.DOTFILES_REPO_ROOT
  else
    process.env.DOTFILES_REPO_ROOT = originalRepoRoot
})

describe('secrets', () => {
  it('detects sensitive shell assignments and ignores placeholders', () => {
    const content = [
      'export API_TOKEN="secret-token-123"',
      'NORMAL_VALUE="secret-token-123"',
      'PASSWORD={{DOTFILES_SECRET:PASSWORD}}',
      'SHORT_TOKEN=short',
    ].join('\n')

    assert.deepEqual(detectSecrets(content), [
      { key: 'API_TOKEN', value: 'secret-token-123' },
    ])
  })

  it('masks, finds, and restores placeholders', () => {
    const content = 'export API_TOKEN="secret-token-123"\n'
    const secrets = detectSecrets(content)
    const masked = maskSecrets(content, secrets)

    assert.equal(masked, 'export API_TOKEN="{{DOTFILES_SECRET:API_TOKEN}}"\n')
    assert.deepEqual(findPlaceholders(masked), ['API_TOKEN'])

    const restored = unmaskSecrets(masked, new Map([['API_TOKEN', 'secret-token-123']]))
    assert.equal(restored.content, content)
    assert.deepEqual(restored.missing, [])
  })

  it('keeps missing placeholders and reports missing keys', () => {
    const content = 'export API_TOKEN="{{DOTFILES_SECRET:API_TOKEN}}"\n'
    const result = unmaskSecrets(content, new Map())

    assert.equal(result.content, content)
    assert.deepEqual(result.missing, ['API_TOKEN'])
  })

  it('saves and loads secrets from the isolated repo .env.local', () => {
    const repoRoot = useTempRepo()

    saveSecrets([
      { key: 'API_TOKEN', value: 'secret-token-123' },
      { key: 'PASSWORD', value: 'password-123' },
    ])

    const envPath = path.join(repoRoot, '.env.local')
    assert.equal(fs.existsSync(envPath), true)
    assert.deepEqual([...loadSecretsFile()], [
      ['API_TOKEN', 'secret-token-123'],
      ['PASSWORD', 'password-123'],
    ])
  })
})
