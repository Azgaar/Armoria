import {forEach} from "./utils";

export const tooltip = (element: HTMLElement) => {
  const isTouchAvailable = "ontouchstart" in window;
  let div: HTMLDivElement;
  let tooltip: string;
  let limit: number[];

  function mouseEnter() {
    forEach(".tooltip", el => el.remove());

    tooltip = element.dataset.tooltip;
    element.removeAttribute("title");

    const gesture = element.getAttribute("gesture");
    const hotkey = element.getAttribute("hotkey");

    div = document.createElement("div");
    div.textContent = tooltip;
    if (isTouchAvailable && gesture) div.textContent += ". Gesture: " + gesture;
    if (!isTouchAvailable && hotkey) div.textContent += ". Hotkey: " + hotkey;
    div.className = "tooltip";
    document.body.appendChild(div);

    const bbox = div.getBoundingClientRect();
    limit = [window.innerWidth - bbox.width, window.innerHeight - bbox.height];
    setTimeout(mouseLeave, 5000); // remove in 5 seconds
  }

  function mouseMove(event: MouseEvent) {
    div.style.left = `${Math.min(event.pageX + 10, limit[0])}px`;
    div.style.top = `${Math.min(event.pageY + 10, limit[1])}px`;
  }

  function mouseLeave() {
    element.dataset.tooltip = tooltip;
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
