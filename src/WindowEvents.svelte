<script>
  import {state, matrix, changes, message} from './stores.js';
  import {download} from './download.js';
  const touch = {startX:0, startY: 0};

  // keyboard shortcuts
  function handleKeydown(event) {
    const code = event.code;
    const reserved = ["Backspace", "Enter", "KeyZ", "KeyX", "KeyD", "F1", "Escape"];
    if (!reserved.includes(code)) return;

    const active = document.activeElement.tagName;
    if (active === "INPUT" || active === "SELECT" || active === "TEXTAREA") return;

    event.preventDefault();
    if (code === "Backspace" && $matrix > 0) $matrix -= 1; else // Rollback
    if (code === "Enter") $matrix += 1; else // Reroll
    if (code === "KeyZ") changes.undo(); else // Undo
    if (code === "KeyX") changes.redo(); else // Redo
    if (code === "KeyD") download(); else // Download SVG
    if (code === "F1") $state.about = !$state.about; // About
    if (code === "Escape") close() // Close all windows

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

<svelte:window on:keydown={handleKeydown} on:touchstart={handleTouchStart} on:touchend={handleTouchEnd}/>