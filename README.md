# Template - Project Overview

## Tech Stack

- **Runtime**: Bun (TypeScript runtime, 2-3x faster than Node.js)
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis (via ioredis) for session storage
- **Queue**: BullMQ for background jobs
- **Validation**: TypeBox with Hono validator
- **Logging**: Winston
- **Testing**: Vitest with coverage reporting
- **Code Quality**: Biome for linting/formatting, Prettier for markdown
- **Version Control**: Git with Husky hooks and conventional commits

## Architecture

The project follows Clean Architecture and Domain-Driven Design (DDD) principles:

```
src/
├── domain/         # Enterprise Business Rules (no external dependencies)
├── application/    # Application Business Rules (orchestration)
├── infrastructure/ # Frameworks & Drivers (external interfaces)
└── presentation/   # Interface Adapters (HTTP, validation)
```

## Development Workflow

This project follows a strict Git Flow branching strategy. For detailed information about our
branching model, PR process, and synchronization strategies, see:

**[Git Flow Guide](./docs/git-flow-guide.md)**

### Quick Start

```bash
# Create feature branch from dev
git checkout dev && git pull origin dev
git checkout -b feature/your-feature

# Make changes and push
git add . && git commit -m "feat: description"
git push -u origin feature/your-feature

# Create PR to dev via GitHub
```
