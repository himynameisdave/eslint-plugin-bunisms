# Contributing

Thanks for helping make this project useful and welcoming. Be kind, assume good
intent, and keep discussion focused on the code and its impact. We value clear,
constructive feedback, credit for others' work, and patience with contributors
at every experience level. Harassment, personal attacks, and dismissive behavior
are not welcome.

Before opening an issue or pull request, search for related work. Explain the
problem, include a small reproducible example when possible, and keep each pull
request focused. Please be open to review and to changing course when new
information emerges. Maintainers may close or redirect contributions to keep the
project coherent.

## Development

Use Bun 1.4.2 and Node 22. Fork the repository, create a branch, then install
dependencies and run the full check:

```sh
bun install --frozen-lockfile
bun run check
```

Rules are in `src/rules`, their tests are in `tests`, and their documentation is
in `docs/rules`. Add focused tests and documentation with rule changes. Before
submitting a pull request, run `bun run check`; use `bun run lint:fix` and
`bun run format` to apply routine fixes.

Thank you for improving the project for everyone.

## Releases

See [PUBLISHING.md](PUBLISHING.md) for the npm setup and release workflow. No post-0.1.0 rules belong in the initial release.
