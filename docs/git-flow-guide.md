# Git Flow Guide

This project follows a strict Git Flow branching strategy to ensure code quality and organized
development.

## Branch Structure

```
main (production)
  ↑ PR only from dev
dev (development)
  ↑ PR from feature branches
feature/* | fix/* | docs/* | refactor/*
```

## Workflow Rules

1. **Protected Branches**: Both `main` and `dev` are protected - no direct commits allowed
2. **Feature Development**: Create branches from `dev` using naming convention: `type/description`
3. **Pull Requests**: All changes must go through PR review process
4. **Automated Validation**: GitHub Actions validates that PRs to `main` only come from `dev`
5. **CI/CD**: All PRs run automated tests and linting before merge

## Common Commands

```bash
# Create feature branch
git checkout dev
git pull origin dev
git checkout -b feature/your-feature

# After development
git add .
git commit -m "feat: your feature description"
git push -u origin feature/your-feature
# Create PR to dev via GitHub

# After PR merged to dev
git checkout dev
git pull origin dev
git branch -d feature/your-feature
```

## Working with Feature Branches

### Incremental PRs (Recommended for large features)

You can create multiple PRs from the same feature branch:

```bash
# PR 1: Initial implementation
git add .
git commit -m "feat: add domain entities"
git push
# Create PR to dev → Merge → DON'T DELETE branch

# Continue working on same branch
git pull origin dev  # Sync with dev
git add .
git commit -m "feat: add use cases"
git push
# Create new PR to dev → Merge → DON'T DELETE

# Final PR (complete feature)
git add .
git commit -m "feat: add integration tests"
git push
# Create final PR → Merge → NOW DELETE branch
```

### Staying Synchronized with Updates

While working on your feature branch, you can check and incorporate updates from dev:

```bash
# Method 1: Check what's new in dev without merging
git fetch origin dev
git log HEAD..origin/dev --oneline  # See new commits
git diff HEAD...origin/dev          # See actual changes

# Method 2: Merge dev updates into your branch
git fetch origin dev
git merge origin/dev
# Resolve conflicts if any

# Method 3: Rebase on top of dev (cleaner history)
git fetch origin dev
git rebase origin/dev
# Resolve conflicts if any

# Method 4: Check specific files that changed
git fetch origin dev
git diff HEAD...origin/dev --name-only  # List changed files
git diff HEAD...origin/dev -- README.md  # Check specific file
```

### Checking Task Updates and Specifications

If another developer is updating documentation or specifications:

```bash
# See if docs were updated in dev
git fetch origin dev
git diff HEAD...origin/dev -- docs/  # Check all docs
git diff HEAD...origin/dev -- "*.md"  # Check all markdown files

# Cherry-pick specific commits if needed (use carefully)
git fetch origin dev
git log origin/dev --oneline -10  # See recent commits
git cherry-pick <commit-hash>      # Apply specific commit

# Get updates from a specific colleague's branch
git fetch origin feature/planning-tasks
git diff HEAD...origin/feature/planning-tasks -- docs/
# Or merge their changes
git merge origin/feature/planning-tasks
```

## Best Practices

1. **Sync frequently**: `git fetch origin dev` daily to stay aware of changes
2. **Small PRs**: Create incremental PRs for easier reviews
3. **Clear commits**: Use conventional commits for better tracking
4. **Communicate**: Inform team when merging significant changes to dev
5. **Clean history**: Consider rebasing before final PR for cleaner history

## Branch Protection Rules

### Main Branch

- Requires pull request reviews
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators in restrictions

### Dev Branch

- Requires pull request reviews
- Require status checks to pass before merging
- No direct pushes allowed

## Commit Message Convention

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer(s)]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

Examples:

```bash
git commit -m "feat: add user authentication"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs: update API documentation"
```
