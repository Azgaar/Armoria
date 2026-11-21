export const query: typeof document.querySelector = document.querySelector.bind(document);
export const queryAll: typeof document.querySelectorAll = document.querySelectorAll.bind(document);

Node.prototype.on = window.on = function (name: string, fn: EventListenerOrEventListenerObject) {
  this.addEventListener(name, fn);
};

Node.prototype.off = window.off = function (name: string, fn: EventListenerOrEventListenerObject) {
  this.removeEventListener(name, fn);
};

declare global {
  interface Node {
    on: typeof document.addEventListener;
    off: typeof document.removeEventListener;
  }
  interface Window {
    on: typeof document.addEventListener;
    off: typeof document.removeEventListener;
  }
}
