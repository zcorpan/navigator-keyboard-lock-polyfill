# navigator.keyboard.lock Polyfill

A tiny polyfill for Chromium’s `navigator.keyboard.lock()` API.

* Chromium API: [https://wicg.github.io/keyboard-lock/](https://wicg.github.io/keyboard-lock/)
* Standard API: [https://fullscreen.spec.whatwg.org/#keyboard-lock](https://fullscreen.spec.whatwg.org/#keyboard-lock)

## What it does

Maps `navigator.keyboard.lock()` / `unlock()` to the standardized Fullscreen keyboard lock (`requestFullscreen({ keyboardLock })`).

## Limitations

This script only affects the current document. The keyboard lock state is not passed down to child documents that call `requestFullscreen()`.

The script tries to support any order of calling `requestFullscreen()` and `navigator.keyboard.lock()`. It thus fakes a `fullscreenchange` event, and actually goes fullscreen later (which will fire another `fullscreenchange` event).

The recommended order is `navigator.keyboard.lock()` first, then `requestFullscreen()`.

## Browser support

Works in browsers that support the standard API:

* Safari 26.4+
* Firefox 151+

## Usage

```html
<script src="index.js"></script>
```

## npm

```sh
npm install navigator-keyboard-lock-polyfill
```
```js
import "navigator-keyboard-lock-polyfill";
```

## License

MIT
