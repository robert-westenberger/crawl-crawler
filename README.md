# Hello World

## Development

Use Node 24.9.0 (see `.nvmrc`) and pnpm 10.33.2.

Copy `.envTemplate` to `.env_development`.

```sh
pnpm install
pnpm dev:chromium
pnpm dev:firefox
```

A browser opens with the extension loaded. Click the toolbar icon to see "Hello world".

## Package

```sh
pnpm build
pnpm package
```

`pnpm build` writes unpacked extensions to `packages/extension/dist/chromium` and `packages/extension/dist/firefox`.

`pnpm package` writes `packages/extension/artifacts/hello-world-chromium.zip` and `packages/extension/artifacts/hello-world-firefox.zip`.
