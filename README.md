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
- `library`: The configuration of the custom library streams (`#`) for your
  app - see below for options
- `dynamics`: The location of a JavaScript file which defines the custom dynamic
  streams (`@`) for your app
- `components`: The location of a JavaScript file which defines the custom
  components for your app
- `favicon`: The location of the favicon for your app
- `port`: The port to use for the development server (defaults to 8080)
- `fonts`: A list of font definitions for Google Web Fonts

### Library

The `library` key accepts a list, with both indexed and keys values:

- `indexed`: The location of a JavaScript file which exports multiple named
  custom streams
- `keyed`: Either the location of a JavaScript file which exports a single
  stream, or another list with a type on the `nil` key, and any other required
  options for that type

#### Websockets

The `websocket` type takes a single parameter `url`.

## Example configuration

```
[
  app: src,
  library: ["js/library", data: [: websocket, url: "ws://example.com"]],
  favicon: "favicon.ico",
  fonts: ["Montserrat:400,700"],
]
```

This configuration would work with the following folder structure:

```
my-app
├── app
│   ├── start.ma
│   └── utils.ma
├── js
│   └── library.js
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
