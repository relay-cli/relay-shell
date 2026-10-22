# Relay Shell artwork

The repository banner and social preview follow the direction of the other Relay repositories: the official Relay mark and product name on the left, and the real interface on the right.

## Banner

`banner.png` uses a 3:1 composition (2172 × 724). The left side contains the Relay mark, the product name, and a direct description. The right side depicts the actual demonstration application: a title row, a focused host list, a detail pane, an events pane, the status bar with its label and segments, and the key hints row.

## Social preview

`.github/social-preview.png` recomposes the same interface for a 2:1 thumbnail (1774 × 887). The description is removed and the product name is centered under the mark so it stays readable in repository cards.

## Sources

Both images are drawn from HTML in `source/` with the shared Relay palette and a monospace interface font, then captured with a headless browser:

```sh
chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=2172,724 --screenshot=banner.png docs/assets/source/banner.html
chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1774,887 --screenshot=social-preview.png docs/assets/source/social-preview.html
```

The mark is redrawn as vector shapes from the official avatar in the Relay organization profile. Future artwork should keep depicting the real panes, status bar, and key hints rather than decorative terminal code, agents, robots, or providers.
