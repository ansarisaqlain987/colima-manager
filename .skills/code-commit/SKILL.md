# Code Commit Skill

Use this skill when committing staged or unstaged code changes. It ensures every commit follows the repository's message format.

## Commit Message Format

Every commit message must follow this format:

```
<type>: <short description>

<body>          <- optional, only for non-trivial changes

<footer>        <- optional, only for breaking changes or issue references
```

### Types

| Type | When to use
|---|---|
| `feat` | A new feature
| `fix` | A bug fix
| `docs` | Documentation-only changes
| `style` | Formatting, semicolons, etc. (no code logic change)
| `refactor` | Code change that neither fixes a bug nor adds a feature
| `test` | Adding or updating tests
| `chore` | Build process, dependencies, or auxiliary tooling changes

### Rules

1. **First line (subject)**: Imperative voice, under 72 characters, no period at end.
   - Good: `feat: add colima status command`
   - Bad: `added a new feature` / `Fixed the bug`
2. **Body**: Wrap at 72 characters. Explain **what** and **why** — not **how**.
   - Omit entirely for small, self-evident changes.
3. **Footer**: Use Conventional Commits footer conventions for breaking changes (`BREAKING CHANGE: ...`) and issue references (`Refs #12`, `Closes #34`).

## Workflow

1. Check for uncommitted changes: `git status` and `git diff --staged`
2. If nothing needs committing, stop and report that there are no changes.
3. Stage more files if the user specifies which ones.
4. Run `git diff` mentally to confirm scope of the commit.
5. Construct the commit message using the format above.
6. Run: `git commit -m "<subject>" -m "<body>"` (multi-line when needed)
7. If the user passes a message that already matches the format, use it directly — do not re-wrap or alter it.
