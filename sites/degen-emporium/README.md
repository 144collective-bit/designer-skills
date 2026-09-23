# The Degen Emporium — home page

A static home page for The Degen Emporium, a PulseChain news and merch site.

Open `index.html` in a browser, or serve the folder:

```sh
npx serve sites/degen-emporium
```

## Files

- `index.html`: page markup (header, price ticker, hero, news, store, start-here guide, newsletter, footer)
- `styles.css`: colors taken from the banner and the PulseChain logo; responsive layout
- `main.js`: all interactions: preloader and hero intro, particle-network background, cursor glow, spotlight and 3D-tilt cards, magnetic buttons, scroll progress and parallax, sliding nav and filter indicators, live price ticker (DexScreener API), drop countdown, cart drawer (saved in the browser) with fly-to-cart and toasts, newsletter confetti

Animations are turned off for visitors who set "reduce motion" in their system settings, and the cursor effects only run on devices with a mouse.
- `assets/`: banner and PulseChain logo

## Before launch

- The news stories and products are **sample content**. Replace them with real articles and inventory.
- The cart (saved in the visitor's browser) and newsletter work only in the browser. Connect them to a store backend (e.g. Shopify) and an email provider.
- Social links and footer pages point to `#` for now.
