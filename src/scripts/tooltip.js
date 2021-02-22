export function tooltip(element) {
  const touch = 'ontouchstart' in window;
  let div, title, limit;

  function mouseEnter() {
    const oldTips = document.getElementsByClassName("tooltip");
    for (const tip of oldTips) {
      tip.remove();
    }

    title = element.getAttribute("title");
    element.removeAttribute("title");

    const gesture = element.getAttribute("gesture");
    const hotkey = element.getAttribute("hotkey");

    div = document.createElement("div");
    div.textContent = title;
    if (touch && gesture) div.textContent += ". Gesture: " + gesture;
    if (!touch && hotkey) div.textContent += ". Hotkey: " + hotkey;
    div.className = "tooltip";
    document.body.appendChild(div);

    const bbox = div.getBoundingClientRect();
    limit = [window.innerWidth - bbox.width, window.innerHeight - bbox.height];
    setTimeout(() => mouseLeave(), 5000); // remove in 5 seconds
  }

  function mouseMove(event) {
    div.style.left = `${Math.min(event.pageX + 10, limit[0])}px`;
    div.style.top = `${Math.min(event.pageY + 10, limit[1])}px`;
  }

  function mouseLeave() {
    element.setAttribute("title", title);
    if (div) div.remove();
  }

  element.addEventListener("mouseenter", mouseEnter);
  element.addEventListener("mouseleave", mouseLeave);
  element.addEventListener("mousemove", mouseMove);

  return {
    destroy() {
      element.removeEventListener("mouseenter", mouseEnter);
      element.removeEventListener("mouseleave", mouseLeave);
      element.removeEventListener("mousemove", mouseMove);
    }
  };
}