# data

`entries.json` is **synthetic sample data**. None of it describes real changes to this repo, every title starts with `Sample:`, and the PR links point at `https://github.com/example/example`, not at real pull requests.

It exists so the public page has something to render before the GitHub integration exists. Replace it with real entries when the GitHub integration lands.

The file must pass `parseEntries` in `src/entries.ts`. `loadEntries` in `src/load.ts` reads and validates it.
