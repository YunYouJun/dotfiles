# dotfiles

[![CI](https://github.com/YunYouJun/dotfiles/actions/workflows/ci.yml/badge.svg)](https://github.com/YunYouJun/dotfiles/actions/workflows/ci.yml)

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
```

### Push (Home → Repo)

将本地 `~/` 下的 dotfiles 推送到仓库，自动检测并遮罩敏感 token：

```bash
dotfiles push              # 仅推送有变更的文件
dotfiles push --force      # 强制覆盖（自动备份）
dotfiles push --dry-run    # 预览变更
```

### Pull (Repo → Home)

将仓库中的 dotfiles 拉取到本地，自动恢复 token：

```bash
dotfiles pull              # copy 模式（默认）
dotfiles pull --mode link  # symlink 模式
dotfiles pull --force      # 强制覆盖（自动备份）
dotfiles pull --dry-run    # 预览变更
```

### Sync

指定方向同步，或使用交互模式：

```bash
dotfiles sync --direction pull
dotfiles sync --direction push --force
dotfiles sync -i           # 交互式选择
```

### Diff & Status

```bash
dotfiles diff              # 查看仓库与本地的差异
dotfiles status            # 查看同步状态
```

### Secrets

Push 时自动将匹配 `API_KEY`、`TOKEN`、`SECRET`、`PASSWORD` 等关键词的环境变量值替换为 `{{DOTFILES_SECRET:KEY}}` 占位符，真实值保存在仓库根目录的 `.env.local`（已 gitignore）。

Pull 时自动从 `.env.local` 读取真实值并还原。

## Development

```bash
pnpm run lint        # ESLint
pnpm run typecheck   # TypeScript 类型检查
pnpm test            # Vitest 单元测试
pnpm run build       # 构建 CLI
pnpm run ci          # 一键运行 lint + typecheck + test + build
```

## Check Also

- [antfu/dotfiles](https://github.com/antfu/dotfiles)
