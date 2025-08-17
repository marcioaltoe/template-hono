# Development Standards & Guidelines

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Overview

Vulcanus MVP is a high-performance, enterprise-grade ETL (Extract, Transform, Load) integration
platform designed for seamless ERP system integration. Built with Clean Architecture principles and
Domain-Driven Design, it provides a robust, scalable solution for multi-tenant SaaS deployments.

## Quick Commands

- **Run tests**: `bun run test`
- **Generate migrations**: `bun db:generate`
- **Apply migrations**: `bun db:migrate`
- **Format code**: `bun format`
- **Lint**: `bun lint`
- **Type check**: `bun type-check`

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

---

Last Updated: August 2025 Version: 1.0.0
