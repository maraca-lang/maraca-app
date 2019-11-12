# Maraca App

Create Maraca apps with no build configuration.

**You’ll need to have Node 10 or later on your local development machine** (but
it’s not required on the server). You can use
[nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or
[nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows)
to switch Node versions between different projects.

## Install

```
yarn add maraca-app
```

or

```
npm install maraca-app --save
```

## Setup

Create a file called `app.ma` in the root directory. This file is the
configuration of your app, written as a Maraca list with the following optional
values:

- `app`: The location of the Maraca files for your app, which must include
  `start.ma` as the entry file (defaults to `app`)
- `streams`: The location of a JavaScript file which defines the custom streams
  for your app
- `components`: The location of a JavaScript file which defines the custom
  components for your app
- `favicon`: The location of the favicon for your app
- `port`: The port to use for the development server (defaults to 8080)

## Example configuration

```
[
  app: src,
  streams: "js/streams",
  favicon: "favicon.ico",
]
```

This configuration would work with the following folder structure:

```
root
├── app
│   ├── start.ma
│   └── utils.ma
├── js
│   └── streams.js
├── favicon.ico
└── app.ma
```

## Development

### `yarn dev` or `npx dev`

This will create a local server that serves your app, which live reloads as you
make changes.

## Production

### `yarn build` or `npx build`

This will output your built app to `/public`.
