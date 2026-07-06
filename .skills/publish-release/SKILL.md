# Skill: Publish a GitHub Release with Local Build Artifacts

## Purpose

This skill creates a GitHub Release for a repository using the GitHub CLI (`gh`) and uploads locally built release artifacts (such as a Tauri `.dmg` file).

The release **must always be created as a Draft by default**. The agent **must never publish the release without explicit user confirmation**.

---

# Requirements

- GitHub CLI (`gh`) is installed.
- User is authenticated (`gh auth status` succeeds).
- Git repository is clean or the user explicitly accepts releasing from the current state.
- The release artifacts already exist locally.
- The repository has a remote pointing to GitHub.

---

# Safety Rules

## 1. Never publish automatically

Always create releases as **Drafts**.

Do **not** use any command or API that immediately publishes a release unless the user explicitly says things like:

- "Publish it"
- "Release it now"
- "Make it public"
- "Go ahead and publish"

Until then:

- create only a Draft release
- upload all assets
- allow the user to review everything on GitHub

---

## 2. Never create a release without confirmation

Before creating a release, summarize:

- repository
- version/tag
- title
- attached files
- release notes source

Then ask:

> Ready to create the draft release?

Only continue after confirmation.

---

## 3. Never invent version numbers

If the version/tag cannot be determined, ask the user.

Examples:

- v1.2.0
- v0.8.5
- v2.0.0-beta.1

---

## 4. Verify artifacts exist

Before creating the release:

- ensure every asset exists
- fail with a clear error if any file is missing

Never upload nonexistent paths.

---

## 5. Verify authentication

Run:

```bash
gh auth status
```

If authentication fails:

- stop
- ask the user to run:

```bash
gh auth login
```

---

# Default Workflow

## Step 1

Determine:

- repository
- version
- title
- assets
- release notes

---

## Step 2

Verify GitHub authentication.

```bash
gh auth status
```

---

## Step 3

Verify git remote.

Example:

```bash
git remote -v
```

---

## Step 4

Verify release files exist.

Example:

```bash
ls src-tauri/target/release/bundle/dmg
```

---

## Step 5

Check whether the tag already exists.

```bash
git tag --list
```

If it does not exist:

Create it.

```bash
git tag v1.2.0
```

Push it.

```bash
git push origin v1.2.0
```

---

## Step 6

Create a Draft release.

Preferred command:

```bash
gh release create v1.2.0 \
    path/to/file.dmg \
    --draft \
    --generate-notes
```

If custom notes are supplied:

```bash
gh release create v1.2.0 \
    path/to/file.dmg \
    --draft \
    --title "v1.2.0" \
    --notes-file CHANGELOG.md
```

---

## Step 7

Display the Draft release URL.

Tell the user the draft is ready for review.

Do not publish it.

---

# Publishing

Only after explicit confirmation.

Command:

```bash
gh release edit v1.2.0 --draft=false
```

After publishing:

- show the release URL
- confirm success

---

# Tauri macOS Defaults

Typical artifact location:

```text
src-tauri/target/release/bundle/dmg/
```

Typical artifact:

```text
MyApp_1.2.0_aarch64.dmg
```

Default upload:

```bash
gh release create v1.2.0 \
    src-tauri/target/release/bundle/dmg/MyApp_1.2.0_aarch64.dmg \
    --draft \
    --generate-notes
```

---

# Decision Logic

## If no version is provided

Ask for it.

---

## If no artifact is found

Stop and explain which file is missing.

---

## If release already exists

Ask whether to:

- upload additional assets

```bash
gh release upload TAG FILE
```

- overwrite existing assets

```bash
gh release upload TAG FILE --clobber
```

- edit the release

Never delete a release automatically.

---

## If tag already exists but release does not

Reuse the existing tag.

---

## If release notes are not provided

Use:

```bash
--generate-notes
```

---

# User Confirmation Points

Require confirmation before:

- creating a tag
- pushing a tag
- creating the Draft release
- publishing the release

Do not assume permission.

---

# Success Criteria

A successful execution results in:

- GitHub authentication verified.
- Release artifacts verified.
- Tag created (or reused).
- Tag pushed to GitHub.
- Draft release created.
- Assets uploaded successfully.
- Release notes generated or supplied.
- Draft URL shared with the user.
- Release remains unpublished until explicit confirmation.

---

# Things the Agent Must Never Do

- Publish immediately.
- Skip user confirmation.
- Upload missing files.
- Guess version numbers.
- Delete releases.
- Delete tags.
- Force-push tags.
- Overwrite release assets without confirmation.
- Modify release visibility without user approval.

---

# Example Commands

Create draft:

```bash
gh release create v1.2.0 \
  src-tauri/target/release/bundle/dmg/MyApp_1.2.0_aarch64.dmg \
  --draft \
  --generate-notes
```

Upload another asset:

```bash
gh release upload v1.2.0 MyApp_1.2.0_aarch64.dmg
```

Overwrite an existing asset:

```bash
gh release upload v1.2.0 MyApp_1.2.0_aarch64.dmg --clobber
```

Publish after user approval:

```bash
gh release edit v1.2.0 --draft=false
```