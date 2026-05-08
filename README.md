# navigator.keyboard.lock Polyfill

A tiny polyfill for Chromium’s `navigator.keyboard.lock()` API.

* Chromium API: [https://wicg.github.io/keyboard-lock/](https://wicg.github.io/keyboard-lock/)
* Standard API: [https://fullscreen.spec.whatwg.org/#keyboard-lock](https://fullscreen.spec.whatwg.org/#keyboard-lock)

## What it does

Maps `navigator.keyboard.lock()` / `unlock()` to the standardized Fullscreen keyboard lock (`requestFullscreen({ keyboardLock })`).

## Browser support

Works in browsers that support the standard API:

* Safari 26.4+
* Firefox 151+

## Usage

```html
<script src="navigator-keyboard-lock-polyfill.js"></script>
```

## License

MIT
