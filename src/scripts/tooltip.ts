import {get} from "svelte/store";
import {t} from "svelte-i18n";
import {forEach} from "./utils";

const translate = get(t);

export const tooltip = (element: HTMLElement | SVGSVGElement) => {
  if (!element.dataset.tooltip) {
    return;
  }

  const isTouchAvailable = "ontouchstart" in window;
  const div = document.createElement("div");
  let limit: number[];

  const gesture = element.dataset.gesture;
  const hotkey = element.dataset.hotkey;

  function mouseEnter() {
    removeTooltip();

    let text = element.dataset.tooltip;

    if (isTouchAvailable && gesture) text = `${text}. ${translate("tooltip.gesture")}: ${gesture}`;
    if (!isTouchAvailable && hotkey) text = `${text}. ${translate("tooltip.hotkey")}: ${hotkey}`;
    div.textContent = text;
    div.className = "tooltip";
    document.body.appendChild(div);

    const bbox = div.getBoundingClientRect();
    limit = [window.innerWidth - bbox.width, window.innerHeight - bbox.height];
  }

  function mouseMove(event: MouseEvent) {
    div.style.left = `${Math.min(event.pageX + 10, limit[0])}px`;
    div.style.top = `${Math.min(event.pageY + 10, limit[1])}px`;
  }

  function removeTooltip() {
    forEach(".tooltip", el => el.remove());
  }

  element.on("mouseenter", mouseEnter);
  element.on("mousemove", mouseMove);
  element.on("mouseleave", removeTooltip);

  return {
    destroy() {
      removeTooltip();
    }
  };
};
