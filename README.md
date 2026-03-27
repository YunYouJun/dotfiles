# dotfiles

My custom dotfiles.

- [.zshrc](./.zshrc): Oh-My-Zsh Config
- [.vscode](./.vscode): VSCode Global Config

## Usage

### CLI

```bash
# Install dependencies
pnpm install

# Build CLI
pnpm build

# Interactive sync (default)
dotfiles

# Sync all dotfiles (symlink mode)
dotfiles sync

# Sync with copy mode
dotfiles sync --mode copy

# Force overwrite (with auto backup)
dotfiles sync --force

# Preview changes without applying
dotfiles sync --dry-run

# Show differences between repo and local files
dotfiles diff

# Show sync status
dotfiles status
```

## Check Also

- [antfu/dotfiles](https://github.com/antfu/dotfiles)
