<script>
  import {state, matrix, changes, history, message} from "$lib/data/stores";
  import {download} from "$lib/scripts/download";
  import {checkForIconedNav} from "$lib/scripts/navbar";

  let touch = {startX: 0, startY: 0};

  // prevent unwanted refresh
  if (location.host === "armoria.vercel.app" && !navigator.userAgent.includes("Electron")) {
    window.onbeforeunload = () => "Are you sure you want to navigate away?";
  }

  function close() {
    if ($state.edit) {
      // save current edit to gallery history
      $history[$state.c] = JSON.parse($changes[0]);
    }

    state.set({
      ...$state,
      about: 0,
      raster: 0,
      vector: 0,
      tinctures: 0,
      edit: 0,
      selectedPath: -1
    });
    message.clear();
  }

  const keybinding = {
    Backspace: () => $matrix > 0 && matrix.set($matrix - 1), // Rollback
    Enter: () => matrix.set(($matrix += 1)), // Reroll
    KeyZ: changes.undo,
    KeyX: changes.redo,
    KeyS: ctrl => ctrl && download(null, "svg"),
    KeyP: ctrl => ctrl && download(null, "png"),
    KeyJ: ctrl => ctrl && download(null, "jpeg"),
    F1: () => state.set({...$state, about: !$state.about}),
    Escape: close // Close all windows
  };

  // keyboard shortcuts
  function handleKeydown(event) {
    const action = /^[a-z]$/i.test(event.key) ?
      keybinding["Key" + event.key.toUpperCase()] : // for latin keyboards (including non-QWERTY)
      keybinding[event.code]; // for non-latin keyboards
    if (!action) return;

    const active = document.activeElement.tagName;
    if (active === "INPUT" || active === "SELECT" || active === "TEXTAREA") return;

    event.preventDefault();
    action(event.ctrlKey);
  }

  function handleTouchStart(event) {
    const {screenX, screenY} = event.changedTouches[0];
    touch.startX = screenX;
    touch.startY = screenY;
  }

  function handleTouchEnd(event) {
    const menu = document.getElementById("menu");
    const navbar = document.getElementById("navbar");
    if (menu?.contains(event.target)) return; // cancel touch event if start area is menu
    if (navbar?.contains(event.target)) return; // cancel touch event if start area is nav bar

    const {screenX, screenY} = event.changedTouches[0];
    const {startX, startY} = touch;

    const diffX = screenX - startX;
    const diffY = screenY - startY;
    const ratioX = Math.abs(diffX / diffY);
    const ratioY = Math.abs(diffY / diffX);
    const absDiff = Math.abs(ratioX > ratioY ? diffX : diffY);

    if (absDiff < 100) return; // ignore small movements

    if (ratioX > ratioY) diffX >= 0 ? swipeRight() : swipeLeft();
    else diffY >= 0 ? swipeDown() : swipeUp();
  }

  function swipeRight() {
    if ($state.edit) changes.redo();
    else $matrix += 1;
  }

  function swipeDown() {
    $matrix += 1;
  }

  function swipeLeft() {
    if ($state.edit) changes.undo();
    else if ($matrix > 0) $matrix -= 1;
  }

  function swipeUp() {
    if ($matrix > 0) $matrix -= 1;
  }
</script>

<svelte:window on:keydown={handleKeydown} on:touchstart={handleTouchStart} on:touchend={handleTouchEnd} on:resize={checkForIconedNav} />
