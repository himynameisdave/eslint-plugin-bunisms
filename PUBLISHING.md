# Publishing to npm

Run releases from **Actions → Release → Run workflow** on `main`, then choose a patch, minor, or major bump. The workflow runs all checks, bumps both version references, publishes to npm with trusted publishing (OIDC), pushes a bare numeric version tag (for example `0.2.0`), and creates a GitHub release. No `v` prefix is used for tags or GitHub release names.

## One-time setup: first npm publish

The package must exist on npm before npm lets you configure its trusted publisher. From a reviewed checkout, confirm the package name and contents, then publish the initial `0.1.0` release manually:

```sh
npm whoami
npm pack --dry-run
npm publish --access public
```

Then open [the package settings](https://www.npmjs.com/package/eslint-plugin-bunisms/access) → **Trusted Publisher** and add:

- Provider: **GitHub Actions**
- Organization or user: `himynameisdave`
- Repository: `eslint-plugin-bunisms`
- Workflow filename: `release.yml`
- Environment: leave blank

npm CLI 11.5.1 or later is required for trusted publishing. The workflow upgrades npm before publishing. npm automatically adds provenance when trusted publishing succeeds.

## One-time setup: `RELEASE_TOKEN`

The workflow pushes the version commit and tag to `main`. If branch protection prevents the built-in Actions token from pushing, create a fine-grained personal access token owned by `himynameisdave`, scoped to this repository with **Contents: read and write**, and add it as the repository Actions secret `RELEASE_TOKEN`. This is the same token-based push arrangement used by oxlint-config. If `main` permits Actions pushes, the built-in token may be used by removing `token: ${{ secrets.RELEASE_TOKEN }}` from the checkout step.

## Each release

1. Merge the changes to release into `main`.
2. In GitHub, open **Actions → Release → Run workflow**, keep the branch set to `main`, and choose `patch`, `minor`, or `major`.
3. Review the run and the generated GitHub release. The workflow tags the commit with the bare version, such as `0.2.0`.

The workflow runs `bun run check` before changing versions. It then updates `package.json` and the plugin metadata in `src/index.ts`, commits those changes, and creates the matching numeric tag. `npm publish` runs only after the checks pass. The push and GitHub release happen after publishing.

## If a run fails after publishing

npm releases cannot be overwritten. If npm publish succeeded but a later push or GitHub release step failed, do not rerun the workflow: it would bump the version again. Recover manually by committing the published version into `package.json` and `src/index.ts`, tagging that commit with the exact bare version, pushing the commit and tag, then creating the GitHub release for that tag.

## Manual fallback

If GitHub Actions is unavailable, run `bun run check`, update both version references, then publish with your npm account and push a bare version tag. For example, `git tag 0.2.0 && git push origin main 0.2.0`. Create a GitHub release named `0.2.0` afterward.
