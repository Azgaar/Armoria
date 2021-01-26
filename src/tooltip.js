export function tooltip(element) {
  const touch = 'ontouchstart' in window;
  let div, title;

  const style = `
    position: absolute;
    padding: .5em;
    pointer-events: none;
    z-index: 99;
    color: #fff;
    background-color: #1e1e1e;
    border: 1px solid #333;
    opacity: .9;
  `;

  function mouseEnter() {
    title = element.getAttribute("title");
    element.removeAttribute("title");

    const gesture = element.getAttribute("gesture");
    const hotkey = element.getAttribute("hotkey");

    div = document.createElement("div");
    div.textContent = title;
    if (touch && gesture) div.textContent += ". Gesture: " + gesture;
    if (!touch && hotkey) div.textContent += ". Hotkey: " + hotkey;

    div.style = style;
    document.body.appendChild(div);
  }

  function mouseMove(event) {
    div.style.left = `${event.pageX + 10}px`;
    div.style.top = `${event.pageY + 10}px`;
  }

  function mouseLeave() {
    document.body.removeChild(div);
    element.setAttribute("title", title);
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