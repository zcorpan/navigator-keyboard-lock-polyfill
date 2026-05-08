/*
 * navigator.keyboard.lock polyfill
 * Copyright (c) 2026 Simon Pieters
 * Licensed under the MIT License.
 */
 (() => {
  if ("keyboard" in navigator && "lock" in navigator.keyboard) {
    return;
  }
  let locked = false;

  const origRequestFullscreen = Element.prototype.requestFullscreen;

  Element.prototype.requestFullscreen = function (options = {}) {
    if (!("keyboardLock" in options)) {
      options.keyboardLock = locked ? "browser" : "none";
    }
    return origRequestFullscreen.call(this, options);
  };

  if (!("keyboard" in navigator)) {
    navigator.keyboard = {};
  }
  navigator.keyboard.lock = () => {
    const lockStateChanged = locked === false;
    locked = true;
    if (lockStateChanged && document.fullscreenElement && navigator.userActivation.isActive) {
      document.fullscreenElement.requestFullscreen();
    }
  }
  navigator.keyboard.unlock = () => {
    const lockStateChanged = locked === true;
    locked = false;
    if (lockStateChanged && document.fullscreenElement && navigator.userActivation.isActive) {
      document.fullscreenElement.requestFullscreen();
    }
  }

  const origPermissionsQuery = Permissions.prototype.query;

  Permissions.prototype.query = permissionDesc => {
    if (permissionDesc.name === "keyboard-lock") {
      return Promise.resolve({ state: "granted" });
    }
    return origPermissionsQuery.call(this, permissionDesc);
  };
})();
