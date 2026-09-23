# The Degen Emporium — home page

A static home page for The Degen Emporium, a PulseChain news and merch site.

Open `index.html` in a browser, or serve the folder:

```sh
npx serve sites/degen-emporium
```

## Files

- `index.html`: page markup (header, price ticker, hero, news, store, start-here guide, newsletter, footer)
- `styles.css`: colors taken from the banner and the PulseChain logo; responsive layout
- `main.js`: live price ticker (DexScreener API), mobile menu, news filters, add-to-cart counter, newsletter form check
- `assets/`: banner and PulseChain logo

## Before launch

- The news stories and products are **sample content**. Replace them with real articles and inventory.
- The cart and newsletter work only in the browser. Connect them to a store backend (e.g. Shopify) and an email provider.
- Social links and footer pages point to `#` for now.
