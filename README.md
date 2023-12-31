# Getting Started with Create Blocklet

This project was bootstrapped with [Create Blocklet](https://github.com/blocklet/create-blocklet).

This project is a monorepo project, which means that there are multiple blocklet applications.

## File Structure

- .prettierrc - Prettier configuration
- LICENSE - License file
- Makefile - Makefile
- package.json - Npm package file
- eslintrc.js
- lerna.json
- README.md - A guide for this blocklet
- version - Version file
- .gitignore
- .npmrc
- scripts/
  - batch-modify-deps-version.mjs
  - bump-version.mjs
- blocklets/ - Blocklet applications
- websites/ - Static website

## Development

1. Make sure you have [@blocklet/cli](https://www.npmjs.com/package/@blocklet/cli) installed

   Blocklet needs blocklet server as a dependency. So you need to install it first.  
   `npm install -g @blocklet/cli`  
   See details in [https://docs.arcblock.io/abtnode/en/introduction/abtnode-setup#use-the-binary-distribution](https://docs.arcblock.io/abtnode/en/introduction/abtnode-setup#use-the-binary-distribution)

2. Init blocklet server & start blocklet server

   Before starting an blocklet server, you need to init blocklet server.  
   `blocklet server init --mode=debug`  
   `blocklet server start`  
   See details in [https://docs.arcblock.io/abtnode/en/introduction/abtnode-setup#configure-abt-node](https://docs.arcblock.io/abtnode/en/introduction/abtnode-setup#configure-abt-node)

3. init project

```bash
 make init
```

4. Go to the main blocklet directory `cd blocklets/[main blocklet] or cd websites/[main blocklet]`
5. Start development server: `npm run dev`
6. Go to the other websites directory `cd blocklets/[other blocklet] or cd websites/[main blocklet]`
7. Start development server: `npm run dev:child`

## update version

```bash
npm run bump-version
```

## Reference

Our docs site is generate by Create Blocklet itself.

We use Blocklet Page to write our docs

check more details on

- [Create Blocklet Docs](https://www.createblocklet.dev/docs/en/intro)
