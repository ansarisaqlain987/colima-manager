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
