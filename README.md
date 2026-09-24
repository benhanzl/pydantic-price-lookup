# GenAI price lookup

A small local web app for checking whether [`@pydantic/genai-prices`](https://github.com/pydantic/genai-prices) recognizes a provider and model string, and what it prices it at.

- Enter a model string, and optionally a provider. The strings are passed to the library exactly as typed. The app does no matching, trimming or case-folding of its own; everything shown is what genai-prices resolved.
- A match shows the resolved provider and model IDs, the match rule that matched, current prices (including tiered and time/date-conditional prices), and the provider's pricing notes and links.
- No match says whether the provider wasn't recognized, or the provider was recognized but none of its models matched.
- The footer shows the installed library version. Prices come only from the data bundled with that version (no runtime updates), so the version tells you exactly which data you're seeing.

## Run

```sh
npm install
npm run dev      # http://localhost:5173
```

## Test and build

```sh
npm test         # Vitest (lookup logic runs against the real bundled data)
npm run build    # type-check and production build
npm run lint
```

## Updating price data

The library is pinned to an exact version in `package.json`. To pick up new prices:

```sh
npm install --save-exact @pydantic/genai-prices@latest
```

The version shown in the UI is read from `node_modules/@pydantic/genai-prices/package.json` at build/dev-server start (see `vite.config.ts`), so restart `npm run dev` after upgrading.

## Layout

- `src/lookup.ts`: the only module that calls genai-prices (`calcPrice`, then `findProvider` to explain a miss)
- `src/format.ts`: display helpers (price key labels, USD, tiers, match rules, constraints)
- `src/components/`: form, result panel, price table
