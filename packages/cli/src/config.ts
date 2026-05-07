import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

export interface DotfileEntry {
  /** 仓库中的相对路径 */
  source: string
  /** 目标路径（相对于 $HOME） */
  target: string
  /** 描述 */
  description?: string
}

/**
 * dotfiles 映射表
 * source: 仓库根目录下的相对路径
 * target: 相对于 $HOME 的目标路径
 */
export const dotfiles: DotfileEntry[] = [
  {
    source: '.zshrc',
    target: '.zshrc',
    description: 'Oh-My-Zsh Config',
  },
  {
    source: '.vscode/settings.json',
    target: process.platform === 'darwin'
      ? path.join('Library', 'Application Support', 'Code', 'User', 'settings.json')
      : process.platform === 'win32'
        ? path.join('AppData', 'Roaming', 'Code', 'User', 'settings.json')
        : path.join('.config', 'Code', 'User', 'settings.json'),
    description: 'VSCode Global Settings',
  },
]

export function getRepoRoot(): string {
  if (process.env.DOTFILES_REPO_ROOT)
    return path.resolve(process.env.DOTFILES_REPO_ROOT)

  // packages/cli → 仓库根目录
  return path.resolve(import.meta.dirname, '..', '..', '..')
}

export function getHomeDir(): string {
  if (process.env.DOTFILES_HOME)
    return path.resolve(process.env.DOTFILES_HOME)

  return os.homedir()
}

export function resolveSource(entry: DotfileEntry): string {
  return path.resolve(getRepoRoot(), entry.source)
}

export function resolveTarget(entry: DotfileEntry): string {
  return path.resolve(getHomeDir(), entry.target)
}
