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
