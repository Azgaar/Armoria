<script>
  import {state, matrix, changes, message} from "data/stores";
  import {download} from "scripts/download";
  const touch = {startX: 0, startY: 0};

  // prevent unwanted refresh
  if (location.host === "azgaar.github.io" && !navigator.userAgent.includes("Electron")) {
    window.onbeforeunload = () => "Are you sure you want to navigate away?";
  }

  // keyboard shortcuts
  function handleKeydown(event) {
    const code = event.code;
    const ctrl = event.ctrlKey;
    const reserved = ["Backspace", "Enter", "KeyZ", "KeyX", "KeyS", "KeyP", "KeyJ", "F1", "Escape"];
    if (!ctrl && !reserved.includes(code)) return;

    const active = document.activeElement.tagName;
    if (active === "INPUT" || active === "SELECT" || active === "TEXTAREA") return;

    event.preventDefault();
    if (code === "Backspace" && $matrix > 0) $matrix -= 1;
    // Rollback
    else if (code === "Enter") $matrix += 1;
    // Reroll
    else if (code === "KeyZ") changes.undo();
    // Undo
    else if (code === "KeyX") changes.redo();
    // Redo
    else if (ctrl && code === "KeyS") download(null, "svg");
    // Download SVG
    else if (ctrl && code === "KeyP") download(null, "png");
    // Download PNG
    else if (ctrl && code === "KeyJ") download(null, "jpeg");
    // Download JPEG
    else if (code === "F1") $state.about = !$state.about; // About
    if (code === "Escape") close(); // Close all windows

    function close() {
      $state.about = 0;
      $state.raster = 0;
      $state.vector = 0;
      $state.tinctures = 0;
      $state.edit = 0;
      $message = null;
    }
  }

  function handleTouchStart(e) {
    touch.startX = e.changedTouches[0].screenX;
    touch.startY = e.changedTouches[0].screenY;
  }

  function handleTouchEnd(e) {
    const menu = document.getElementById("menu");
    const navbar = document.getElementById("navbar");
    if (menu?.contains(e.target)) return; // cancel touch event if start area is menu
    if (navbar?.contains(e.target)) return; // cancel touch event if start area is nav bar

    const diffX = e.changedTouches[0].screenX - touch.startX;
    const diffY = e.changedTouches[0].screenY - touch.startY;
    const ratioX = Math.abs(diffX / diffY);
    const ratioY = Math.abs(diffY / diffX);
    const absDiff = Math.abs(ratioX > ratioY ? diffX : diffY);

    if (absDiff < 50) return; // ignore small movements

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

<svelte:window on:keydown={handleKeydown} on:touchstart={handleTouchStart} on:touchend={handleTouchEnd} />
