# Pull Request Skill

Creates or updates a Pull Request targeting `main` using GitHub CLI (`gh`).

## File Structure

```
.skills/pull-request/
├── SKILL.md      — Instructions OpenCode follows when this skill is active
└── README.md     — Human-readable documentation
```

## When to Activate

- The user says "create a PR", "open a pull request", "pull request", or similar.
- After a series of commits the user signals the work is done — it's natural to prompt with `Ready to open a PR?`

## What It Does

1. Checks `gh auth status` — aborts with a friendly prompt if not authenticated.
2. Resolves the remote URL and current branch.
3. Checks for existing PRs on the branch targeting `main` (`gh pr list --head <branch> --base main`).
4. Creates a new PR if none exists, updates the description if one exists, or presents options if multiple exist.
5. Returns the PR URL after creation or update.

## Notes

This repo uses **husky** + **lint-staged**. All commits should pass the pre-commit lint hook (`eslint` + `prettier` on staged `.ts`/`.tsx` files). The PR checklist includes `pnpm lint:check` verification.
