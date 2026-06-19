# Code Commit Skill

Ensures commits follow the repository's [Conventional Commits](https://www.conventionalcommits.org/) message format.

## File Structure

```
.skills/code-commit/
├── SKILL.md      — Instructions OpenCode follows when this skill is active
└── README.md     — Human-readable documentation
```

## When to Activate

- The user says "commit", "commit this", "git commit", "stage and commit", or similar.
- The work just completed and the user is implicitly moving on — it's natural to prompt with `Run the code-commit skill?`

## What It Does

1. Inspects `git status` and `git diff --staged`.
2. Asks the user to stage more files if needed.
3. Constructs or validates a commit message in the required format.
4. Runs `git commit` with the message.

## Pre-commit Lint Hook

Before committing, **lint-staged** automatically runs ESLint and Prettier on all staged `.ts`/`.tsx` files in `src/`. The auto-fix pass handles reformatting and fixable issues only. If remaining issues can't be auto-fixed (e.g. real ESLint errors), the commit is rejected immediately — it does **not retry**. **Do not fix lint errors yourself** — display the errors to the user in a clear, user-friendly message and ask them to fix the issues manually.
