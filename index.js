/*
 * navigator.keyboard.lock polyfill
 * Copyright (c) 2026 Simon Pieters
 * SPDX-License-Identifier: MIT
 */
(() => {
  if ("keyboard" in navigator && "lock" in navigator.keyboard) {
    return;
  }

  let locked = false;
  let pendingFullscreen = null;
  let fakeFullscreenElement = null;

  const origRequestFullscreen = Element.prototype.requestFullscreen;

  const fullscreenElementDesc =
    Object.getOwnPropertyDescriptor(Document.prototype, "fullscreenElement") ||
    Object.getOwnPropertyDescriptor(document, "fullscreenElement");

  if (fullscreenElementDesc?.get) {
    Object.defineProperty(Document.prototype, "fullscreenElement", {
      configurable: true,
      enumerable: fullscreenElementDesc.enumerable,
      get() {
        return fakeFullscreenElement ?? fullscreenElementDesc.get.call(this);
      },
    });
  }

  function animationFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
  }

  function dispatchFakeFullscreenChange(element) {
    element.dispatchEvent(
      new Event("fullscreenchange", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  function clearPendingFullscreen() {
    if (pendingFullscreen?.abortController) {
      pendingFullscreen.abortController.abort();
    }
    pendingFullscreen = null;
    fakeFullscreenElement = null;
  }

  Element.prototype.requestFullscreen = function (options = {}) {
    if ("keyboardLock" in options) {
      return origRequestFullscreen.call(this, options);
    }

    if (locked) {
      return origRequestFullscreen.call(this, {
        ...options,
        keyboardLock: "browser",
      });
    }

    const element = this;
    const abortController = new AbortController();

    clearPendingFullscreen();

    pendingFullscreen = {
      element,
      options,
      abortController,
    };

    fakeFullscreenElement = element;

    (async () => {
      await animationFrame();

      if (abortController.signal.aborted || pendingFullscreen?.element !== element) {
        return;
      }

      dispatchFakeFullscreenChange(element);

      await animationFrame();

      if (abortController.signal.aborted || pendingFullscreen?.element !== element) {
        return;
      }

      clearPendingFullscreen();

      origRequestFullscreen.call(element, {
        ...options,
        keyboardLock: "none",
      });
    })();

    return Promise.resolve();
  };

  navigator.keyboard ??= {};

  navigator.keyboard.lock = () => {
    locked = true;

    if (pendingFullscreen) {
      const { element, options } = pendingFullscreen;

      clearPendingFullscreen();

      return origRequestFullscreen
        .call(element, {
          ...options,
          keyboardLock: "browser",
        })
        .then(() => undefined);
    }

    if (document.fullscreenElement && navigator.userActivation.isActive) {
      return origRequestFullscreen
        .call(document.fullscreenElement, {
          keyboardLock: "browser",
        })
        .then(() => undefined);
    }

    return Promise.resolve();
  };

  navigator.keyboard.unlock = () => {
    const lockStateChanged = locked === true;
    locked = false;

    if (
      lockStateChanged &&
      document.fullscreenElement &&
      navigator.userActivation.isActive
    ) {
      origRequestFullscreen.call(document.fullscreenElement, {
        keyboardLock: "none",
      });
    }
  };

  if ("Permissions" in self && Permissions.prototype.query) {
    const origPermissionsQuery = Permissions.prototype.query;

    Permissions.prototype.query = function (permissionDesc) {
      if (permissionDesc.name === "keyboard-lock") {
        return Promise.resolve({ state: "granted" });
      }

      return origPermissionsQuery.call(this, permissionDesc);
    };
  }
})();
