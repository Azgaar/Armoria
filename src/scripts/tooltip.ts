import {forEach} from "./utils";

const removalDelay = 20000;

export const tooltip = (element: HTMLElement | SVGSVGElement) => {
  const isTouchAvailable = "ontouchstart" in window;
  const tooltip = element.dataset.tooltip;
  const gesture = element.dataset.gesture || element.getAttribute("gesture");
  const hotkey = element.dataset.hotkey || element.getAttribute("hotkey");

  if (!tooltip) {
    return;
  }

  const div = document.createElement("div");
  let limit: number[];

  function mouseEnter() {
    forEach(".tooltip", el => el.remove());

    let text = tooltip;
    if (isTouchAvailable && gesture) text += ". Gesture: " + gesture;
    if (!isTouchAvailable && hotkey) text += ". Hotkey: " + hotkey;
    div.textContent = text;
    div.className = "tooltip";
    document.body.appendChild(div);

    const bbox = div.getBoundingClientRect();
    limit = [window.innerWidth - bbox.width, window.innerHeight - bbox.height];
    setTimeout(mouseLeave, removalDelay);
  }

  function mouseMove(event: MouseEvent) {
    div.style.left = `${Math.min(event.pageX + 10, limit[0])}px`;
    div.style.top = `${Math.min(event.pageY + 10, limit[1])}px`;
  }

  function mouseLeave() {
    if (div) div.remove();
  }

  element.on("mouseenter", mouseEnter);
  element.on("mouseleave", mouseLeave);
  element.on("mousemove", mouseMove);

  return {
    destroy() {
      element.off("mouseenter", mouseEnter);
      element.off("mouseleave", mouseLeave);
      element.off("mousemove", mouseMove);
    }
  };
};
