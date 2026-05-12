# Security Policy

## Reporting a vulnerability

Please **do not** open public GitHub issues for security problems. Email
`hello@darkroom.engineering` or use GitHub's
[private vulnerability reporting](https://github.com/darkroomengineering/lenis/security/advisories/new)
on this repository.

We aim to acknowledge reports within three business days.

## Supply-chain hardening

`lenis` is published to npm via a hardened pipeline designed to make
credential theft and tarball tampering ineffective.

The protections in this repository:

- **No long-lived npm token exists.** Publishing runs only from
  `.github/workflows/release.yml`, which uses npm Trusted Publishing
  (OIDC) to mint a short-lived publish credential at the moment of
  publish. There is no `NPM_TOKEN` in GitHub Actions secrets, in CI, on
  any maintainer's machine, or in a password manager.
- **Build provenance.** Every published tarball ships with an [npm
  provenance attestation](https://docs.npmjs.com/generating-provenance-statements)
  cryptographically tied to this repository, the workflow file, the
  commit, and the runner. Consumers can verify provenance with
  `npm audit signatures` (see below).
- **Tag-protected releases.** The workflow only runs on tag pushes
  matching `v*` and refuses to publish unless the tag matches the
  version in `package.json`.
- **Workflow integrity.** All GitHub Actions are pinned to commit SHAs
  (not floating tags). Dependabot updates SHAs in PRs that go through
  CODEOWNERS review.
- **Local `npm publish` is removed.** `package.json` no longer carries
  `publish:main` / `publish:dev` scripts. There is no sanctioned path
  to publish from a developer machine.
- **CODEOWNERS** requires review on `.github/`, `package.json`, `.npmrc`,
  and this file — anything that could weaken the pipeline.
- **`files` allowlist** in `package.json` limits the published tarball
  to `dist/` only; nothing else from the working tree is shipped.

## One-time setup (must be done outside the repository)

These steps cannot be encoded in repository files. A maintainer with admin
rights on the npm package and the GitHub repository must do them once.
After completion, audit them annually.

### On npmjs.com

1. **Confirm two-factor authentication is enforced for writes** on the
   account or org that owns `lenis` on npm, and on every account with
   publish rights to it.
2. **Configure Trusted Publisher** for `lenis`:
   - Settings → Publishing access → "Enable Trusted Publisher"
   - Publisher: GitHub Actions
   - Repository: `darkroomengineering/lenis`
   - Workflow filename: `.github/workflows/release.yml`
   - Environment name: *(leave blank unless using GitHub Environments)*
3. **After the first OIDC-based publish succeeds** and the latest
   version shows a provenance attestation, set the Publishing access
   policy on `lenis` to **"Require two-factor authentication and
   disallow tokens"** (the recommended option on
   Settings → Publishing access). This forbids any token-based
   publish path. Do not enable this before a successful OIDC publish,
   or there will be no fallback if Trusted Publisher is misconfigured.
4. **Confirm no long-lived publish tokens remain** for the `lenis`
   package.

### On github.com

1. **Branch protection on `main`**:
   - Require a pull request before merging
   - Require review from CODEOWNERS
   - Require signed commits
   - Restrict who can push (no direct push to `main`)
   - Block force pushes and deletions
2. **Tag protection** for `v*`: restrict who can create release tags to
   the same group that can approve releases.
3. **Restrict workflow permissions** (Settings → Actions → General):
   - Workflow permissions: "Read repository contents and packages permissions"
   - Allow GitHub Actions to create and approve pull requests: off
4. **Secret scanning + push protection**: on.

## Release flow (for maintainers)

```bash
bun run version:patch      # or version:minor / version:major
git add package.json
git commit -m "v$(node -p "require('./package.json').version")"
git tag "v$(node -p "require('./package.json').version")"
git push --follow-tags
```

The tag push triggers `.github/workflows/release.yml`, which builds and
publishes. Nothing else publishes; if you ever feel the urge to run
`npm publish` locally, stop and investigate why the workflow isn't
working instead.

## Verifying a published version (for consumers)

After installing `lenis`, verify provenance and signatures:

```bash
npm audit signatures
```

You should see `lenis` listed under "verified registry signatures" with
a "provenance" attestation pointing at `github.com/darkroomengineering/lenis`
and a specific commit SHA. If provenance is missing, the version was not
published through the trusted pipeline — treat as suspect, do not run
`postinstall`, and report it through the channel above.

To inspect provenance for a specific version without installing:

```bash
npm view lenis@<version> --json | jq '.dist'
```

The `attestations` block lists the provenance bundle URL.
