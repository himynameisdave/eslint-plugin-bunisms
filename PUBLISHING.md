# Publishing to npm

Run releases from **Actions → Release → Run workflow** on `main`, then choose a patch, minor, or major bump according to the [versioning guide](VERSIONING.md). The workflow runs all checks, bumps the version in `package.json`, rebuilds the package with that version, pushes the version commit and a bare numeric version tag (for example `0.2.0`), publishes to npm with trusted publishing (OIDC), and creates a GitHub release. No `v` prefix is used for tags or GitHub release names.

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

The workflow runs `bun run check` before changing versions. It then updates `package.json`, commits that change, creates the matching numeric tag, and rebuilds `dist/` so the plugin metadata contains the bumped version. `npm publish` runs only after the checks pass. The commit and tag are pushed before publishing, so a rejected push leaves npm untouched and the workflow can be rerun once the push is fixed. The GitHub release is created last.

## If a run fails after pushing

If the push succeeded but npm publish or the GitHub release failed, do not rerun the workflow: it would bump the version again. Recover manually from the pushed tag:

- npm publish failed: check out the tag, run `bun install --frozen-lockfile` and `bun run build`, then `npm publish --access public` with your npm account.
- GitHub release failed: run `gh release create <version> --verify-tag --generate-notes`.

## Manual fallback

If GitHub Actions is unavailable, run `bun run check`, update the version in `package.json`, run `bun run build`, then publish with your npm account and push a bare version tag. For example, `git tag 0.2.0 && git push origin main 0.2.0`. Create a GitHub release named `0.2.0` afterward.
