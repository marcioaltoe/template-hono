# Cerberus Backend - Project Overview

## Purpose

Cerberus is a high-performance authentication microservice built for the Gesttione platform. It
provides JWT-based authentication with multi-tenancy support.

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

## Key Features

- JWT authentication with RS256
- Multi-tenancy with organization/company structure
- Brazilian market support (CNPJ validation, LGPD compliance)
- API key management for M2M authentication
- Rate limiting and security middleware
- Swagger API documentation

## Performance Targets

- Sub-100ms response times
- Support for 10,000+ concurrent users
- Horizontal scalability

## Project Status

The project is in early development stage (v0.1.0). Basic infrastructure is set up with logging,
configuration, and initial API documentation routes.
