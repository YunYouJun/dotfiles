import type { SyncDirection, SyncMode } from './sync'
import cac from 'cac'
import { version } from '../package.json'
import { diff, status, sync, syncInteractive } from './sync'

const cli = cac('dotfiles')

cli
  .command('push', 'Push dotfiles from home to repo (auto-mask secrets)')
  .option('--force', 'Overwrite existing files (with backup)', { default: false })
  .option('--dry-run', 'Preview changes without applying', { default: false })
  .action(async (options) => {
    await sync({
      direction: 'push',
      mode: 'copy',
      force: options.force,
      dryRun: options.dryRun,
    })
  })

cli
  .command('pull', 'Pull dotfiles from repo to home (auto-restore secrets)')
  .option('--mode <mode>', 'Sync mode: link or copy', { default: 'copy' })
  .option('--force', 'Overwrite existing files (with backup)', { default: false })
  .option('--dry-run', 'Preview changes without applying', { default: false })
  .action(async (options) => {
    await sync({
      direction: 'pull',
      mode: options.mode as SyncMode,
      force: options.force,
      dryRun: options.dryRun,
    })
  })

cli
  .command('sync', 'Sync dotfiles (specify direction)')
  .option('--direction <dir>', 'Sync direction: push or pull', { default: 'pull' })
  .option('--mode <mode>', 'Sync mode: link or copy', { default: 'copy' })
  .option('--force', 'Overwrite existing files (with backup)', { default: false })
  .option('--dry-run', 'Preview changes without applying', { default: false })
  .option('-i, --interactive', 'Interactive mode', { default: false })
  .action(async (options) => {
    if (options.interactive) {
      await syncInteractive()
    }
    else {
      await sync({
        direction: options.direction as SyncDirection,
        mode: options.mode as SyncMode,
        force: options.force,
        dryRun: options.dryRun,
      })
    }
  })

cli
  .command('diff', 'Show differences between repo and home dotfiles')
  .action(() => {
    diff()
  })

cli
  .command('status', 'Show sync status of dotfiles')
  .action(() => {
    status()
  })

cli
  .command('', 'Interactive sync (default)')
  .action(async () => {
    await syncInteractive()
  })

cli.help()
cli.version(version)
cli.parse()
