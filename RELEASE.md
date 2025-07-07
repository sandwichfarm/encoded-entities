# Release Process

This project uses [changesets](https://github.com/changesets/changesets) for version management and GitHub Actions for automated publishing.

## Prerequisites

1. You need to set up the `NPM_TOKEN` secret in your GitHub repository settings:
   - Go to Settings > Secrets and variables > Actions
   - Add a new repository secret named `NPM_TOKEN` with your npm publish token

## Creating a Release

### 1. Add a changeset

When you make changes that should be released:

```bash
npm run changeset
```

This will prompt you to:
- Select which packages changed (just this one)
- Select the type of change (patch/minor/major)
- Write a summary of the changes

### 2. Version the package

When you're ready to create a new release:

```bash
npm run version
```

This will:
- Update the version in package.json based on changesets
- Update the CHANGELOG.md
- Remove the changeset files

### 3. Commit and tag

```bash
git add .
git commit -m "Version packages"
git tag v$(node -p "require('./package.json').version")
```

### 4. Push to trigger release

```bash
git push
git push --tags
```

This will trigger the GitHub Action that:
- Publishes to npm (if not already published)
- Creates a GitHub release with the built package

## Defensive Publishing

The workflow is designed to be idempotent:
- It checks if the npm package version is already published before attempting to publish
- It checks if the GitHub release already exists before creating it
- If either already exists, it skips that step without failing

## Manual Release (if needed)

If the automated process fails, you can manually release:

```bash
npm run build
npm test
npm publish --access public
```