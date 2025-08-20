# Cerberus Authentication Service - Claude Guide

## Project Overview

Cerberus is a high-performance authentication microservice built with Clean Architecture,
Domain-Driven Design (DDD), and SOLID principles. It provides JWT-based authentication with
multi-tenancy support for the Gesttione platform.

## Quick Commands

- **Run tests**: `bun run test`
- **Generate migrations**: `bun db:generate`
- **Apply migrations**: `bun db:migrate`
- **Format code**: `bun format`
- **Lint**: `bun lint`
- **Type check**: `bun type-check`
- **Generate barrel files**: `bun run craft` (criar/atualizar index.ts)
- **Clean barrel files**: `bun run craft:clean` (limpar index.ts antigos)

## Import Strategy - Barrel Files

Este projeto usa **barrel-craft** para gerar arquivos index.ts automaticamente, permitindo imports
limpos:

```typescript
// ✅ Bom - usa barrel files
import { UserIdentity } from "@/domain/aggregate";
import { Email, Password } from "@/domain/value-object";

// ❌ Evitar - imports com caminhos relativos
import { UserIdentity } from "../../domain/aggregate/user-identity.aggregate";
```

**IMPORTANTE**: Após criar novos arquivos ou mover arquivos existentes, execute `bun run craft` para
atualizar os barrel files.

## Rules and Standards (source of truth)

- `.claude/rules/essentials.md` - Core development standards
- `.claude/rules/fundamental-design-principles.md` - Fundamental design principles (DRY, YAGNI,
  KISS, TDA)
- `.claude/rules/naming-conventions.md` - Naming and conventions
- `.claude/rules/tests.md` - Vitest testing patterns
- `.claude/rules/typescript-patterns.md` - TypeScript code patterns & standards
- `.claude/rules/api-standards.md` - Padrões HTTP/API específicos
- `.claude/rules/clean-architecture.md` - Clean Architecture, DDD, CQRS concepts & examples
- `.claude/rules/database-drizzle.md` - Drizzle specifics
- `.claude/rules/database-sql.md` - SQL Raw queries (mesmo usando Drizzle)
- `.claude/rules/folder-structure.md` - Project organization
- `.claude/rules/logging.md` - Winston logging patterns
- `.claude/rules/solid.md` - SOLID principles with examples
