# Thank You Action

A GitHub Actions learning project that welcomes new pull requests. Runs on Node.js 24.
An optional Tenor key adds a GIF; API failures fall back to a text comment.

```yaml
on:
  pull_request:
    types: [opened]
permissions:
  contents: read
  pull-requests: write
jobs:
  welcome:
    # Fork PR tokens are read-only; this example handles same-repository PRs.
    if: github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: ./
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TENOR_TOKEN: ${{ secrets.TENOR_TOKEN }}
```

Develop with `npm ci`, `npm test`, and `npm run build`. Commit `dist/` with source
changes because GitHub executes the bundle. Tests mock GitHub and Tenor and never
post comments. This project does not publish an npm package.
