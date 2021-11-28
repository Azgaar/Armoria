import {ra, rw} from "scripts/utils";
import {writable} from "svelte/store";
import {shields} from "./shields";
import {
  DEFAULT_SIZE,
  DEFAULT_DIAPER,
  DEFAULT_GRADIENTS,
  DEFAULT_COLORS,
  DEFAULT_TINCTURES,
  DEFAULT_BORDER,
  DEFAULT_BORDER_WIDTH,
  DEFAULT_BACKGROUND,
  DEFAULT_SCALE,
  DEFAULT_GRID,
  DEFAULT_SHOW_GRID
} from "config/defaults";

const options = defineInitialOptions();
export const size = writable(options.size);
export const grad = writable(options.grad);
export const diaper = writable(options.diaper);
export const shield = writable(options.shield);
export const colors = writable(options.colors);
export const tinctures = writable(options.tinctures);
export const background = writable(options.background);
export const scale = writable(options.scale);
export const border = writable(options.border);
export const borderWidth = writable(options.borderWidth);

export const grid = writable(options.grid);
export const showGrid = writable(options.showGrid);

export const history = writable([]);
export const matrices = writable([]);
export const matrix = writable(0);
export const state = writable({edit: 0, about: 0, license: 0, tinctures: 0, raster: 0, vector: 0, i: 0});
export const message = writable(null);

const createChangesTracker = () => {
  const {subscribe, set, update} = writable(["", -1]);
  let history = [];
  let position = -1;

  return {
    subscribe,
    refresh: () => set([history[position], position]), // trigger coa refresh
    length: () => history.length,
    reset: () => {
      history = [];
      position = -1;
      set(["", -1]);
    },
    add(value) {
      if (value === history[position]) return; // no change
      if (position < history.length - 1) history = history.slice(0, position + 1); // cut future history
      history.push(value);
      position += 1;
      set([history[position], position]);
    },
    undo: () =>
      update(() => {
        if (position > 0) position -= 1;
        return [history[position], position];
      }),
    redo: () =>
      update(() => {
        if (position < history.length - 1) position += 1;
        return [history[position], position];
      })
  };
};
export const changes = createChangesTracker();

function defineInitialOptions() {
  const stored = (key: string) => {
    const value = localStorage.getItem(key);
    if (value === "null") return null;
    return value;
  };

  const storedObj = (key: string) => {
    return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
  };

  const getShieldFromURL = () => {
    const coaParam = new URL(window.location.href).searchParams.get("coa");
    if (!coaParam) return null;
    const coa = JSON.parse(coaParam);
    return coa?.shield;
  };

  const size = +stored("size") || DEFAULT_SIZE;
  const diaper = stored("diaper") || DEFAULT_DIAPER;
  const grad = stored("grad") || ra(DEFAULT_GRADIENTS);
  const shield = getShieldFromURL() || stored("shield") || rw(shields[rw(shields.types)]);
  const colors = storedObj("colors") || JSON.parse(JSON.stringify(DEFAULT_COLORS));
  const tinctures = storedObj("tinctures") || JSON.parse(JSON.stringify(DEFAULT_TINCTURES));
  const border = stored("border") || DEFAULT_BORDER;
  const borderWidth = +stored("borderWidth") || DEFAULT_BORDER_WIDTH;
  const background = stored("background") || DEFAULT_BACKGROUND;
  const scale = +stored("scale") || DEFAULT_SCALE;

  const grid = +stored("grid") || DEFAULT_GRID;
  const showGrid = storedObj("showGrid") || DEFAULT_SHOW_GRID;

  return {
    size,
    diaper,
    grad,
    shield,
    colors,
    tinctures,
    border,
    borderWidth,
    background,
    scale,
    grid,
    showGrid
  };
}
