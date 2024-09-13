# Lenis Contributing Guide

Yooo! We're really excited that you're interested in contributing to Lenis! Before submitting your contribution, please read through the following guide.

## Repo Setup

To develop locally, fork the Lenis repository and clone it in your local machine. The Lenis repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

To start developing Lenis, run the following commands in the root of the repository:

1. Run `pnpm i` in Lenis's root folder.

2. Run `pnpm dev` in Lenis's root folder.

3. Open http://localhost:4321 in your browser, which has a playground for Lenis.

The dev server will automatically rebuild Lenis whenever you change its code no matter what package you are working on.
At the same time the playground will automatically reload when you change the code of any package.


## Pull Request Guidelines

- Checkout a topic branch from a base branch (e.g. `main`), and merge back against that branch.

- If adding a new feature:

  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first, and have it approved before working on it.

- If fixing a bug:

  - Provide a detailed description of the bug in the PR. Codepen demo preferred.

- Make sure to enable prettier in your editor to format the code.
