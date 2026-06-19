# Pull Request Skill

Use this skill when the user wants to create or update a Pull Request. It uses GitHub CLI (`gh`).

## Prerequisites

- `gh` must be authenticated. If `gh auth status` fails, ask the user to authenticate first.
- The branch must have its changes committed (the code-commit skill can handle this first).

## Workflow

### 1. Determine branch information

Get remote URL and current branch:

```
git remote get-url origin
git branch --show-current
git log --oneline <origin/main>..HEAD   # show what's new since main
```

If `origin` is missing, check `git remote -v` and ask the user to set up the remote before proceeding.

### 2. Check for existing PRs on this branch

```
gh pr list --head <branch> --base main --state all --json number,title,state,url
```

### 3. Act based on match count

| Scenario         | Action                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **No PRs**       | Create a new PR: `gh pr create --base main --title "<title>" --body "<body>"`                                                               |
| **One PR**       | Update its description: `gh pr edit <number> --body "<new body>"` (keeps title intact). Ask the user if they also want to change the title. |
| **Multiple PRs** | Present all matching PRs (number, title, state, URL). Ask the user which one to update. If the user is unsure, default to the open PR.      |

### 4. Crafting the PR description

Include all of these sections (omit heading if there are no entries):

```markdown
## What

<One-line summary of the change>

## Why

<Why this change was needed — business or technical motivation>

## Changes

- <bullet>
- <bullet>

## Testing

<How this was verified>

## Checklist

- [ ] Build passes locally (`pnpm build`)
```

### 5. Final step

Echo back the PR URL after creation or update, and offer `Run the code-commit skill first?` if there are uncommitted changes.
