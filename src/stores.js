import {writable} from 'svelte/store';
import {ra, rw} from './utils.js';

const options = defineInitialOptions();
export const size = writable(options.size);
export const grad = writable(options.grad);
export const diaper = writable(options.diaper);
export const shield = writable(options.shield);
export const colors = writable(options.colors);
export const background = writable(options.background);
export const scale = writable(options.scale);
export const border = writable(options.border);
export const borderWidth = writable(options.borderWidth);

export const grid = writable(options.grid);
export const showGrid = writable(options.showGrid);

export const history = writable([]);
export const matrices = writable([[]]);
export const matrix = writable(0);
export const state = writable({edit:0, about:0});

const createChangesTracker = () => {
  const {subscribe, set, update} = writable([undefined, -1]);
  let history = [], position = -1;

  return {
    subscribe,

    length: () => history.length,

    reset: () => {
      history = [], position = -1;
      set([undefined, -1])
    },

    add(value) {
      if (value === history[position]) return; // no change
      if (position < history.length - 1) history = history.slice(0, position + 1); // cut future history
      history.push(value);
      position += 1;
      set([history[position], position])
    },

    undo: () => update(p => {
      if (position > 0) position -= 1;
      return [history[position], position];
    }),

    redo: () => update(p => {
      if (position < history.length - 1) position += 1;
      return [history[position], position];
    }),

    toString: () => `value: ${history}; position: ${position}`
  }
}
export const changes = createChangesTracker();

export const loadedCharges = writable([]);
export const patterns = writable([]);

function defineInitialOptions() {
  const stored = key => {
    const value = localStorage.getItem(key);
    if (value === "null") return null;
    return value;
  };
  const storedObj = key => localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;

  const size = +stored("size") || 200;
  const diaper = stored("diaper") || null;
  const grad = stored("grad") || ra(["luster", "spotlight", "backlight"]);
  const shield = stored("shield") || rw({heater:60, oldFrench:20, spanish:30, french:5, swiss:2, wedged:2, italian:1, renaissance:1, baroque:1, polish:1, round:1, square:1, vesicaPiscis:1});
  const colors = storedObj("colors") || {argent: "#fafafa", or: "#ffe066", gules: "#d7374a", sable: "#333333", azure: "#377cd7", vert: "#26c061", purpure: "#522d5b"};
  const border = stored("border") || "#333333";
  const borderWidth = +stored("borderWidth") || 1;
  const background = stored("background") || "#333333";
  const scale = +stored("scale") || 2;

  const grid = +stored("grid") || 1;
  const showGrid = storedObj("showGrid") || 0;

  return {size, diaper, grad, shield, colors, border, borderWidth, background, scale, grid, showGrid};
}