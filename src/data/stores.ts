import {ra, rw} from "scripts/utils";
import {writable} from "svelte/store";
import {shields} from "./shields";
import {
  DEFAULT_SIZE,
  DEFAULT_DIAPER,
  DEFAULT_GRADIENTS,
  DEFAULT_COLORS,
  DEFAULT_TINCTURES,
  DEFAULT_FONTS,
  DEFAULT_BORDER,
  DEFAULT_BORDER_WIDTH,
  DEFAULT_BACKGROUND,
  DEFAULT_SCALE,
  DEFAULT_ZOOM,
  DEFAULT_GRID,
  DEFAULT_SHOW_GRID
} from "config/defaults";
import type {Tinctures} from "types/tinctures";
import {validateTinctures} from "./validators";

export const isTextReady = writable(false);

const options = defineInitialOptions();
export const size = writable(options.size);
export const grad = writable(options.grad);
export const diaper = writable(options.diaper);
export const shield = writable(options.shield);
export const colors = writable(options.colors);
export const tinctures = writable(options.tinctures);
export const fonts = writable(options.fonts);
export const background = writable(options.background);
export const scale = writable(options.scale);
export const zoom = writable(options.zoom);
export const border = writable(options.border);
export const borderWidth = writable(options.borderWidth);

export const grid = writable(options.grid);
export const showGrid = writable(options.showGrid);

export const history = writable([]);
export const matrices = writable([]);
export const matrix = writable(0);
export const state = writable({
  edit: 0,
  about: 0,
  license: 0,
  tinctures: 0,
  raster: 0,
  vector: 0,
  i: 0,
  c: 0,
  view: 0,
  fonts: 0,
  selectedPath: -1,
  pathChangeMode: -1
});

export const iconedNav = writable(false);

const createMessageStore = () => {
  const {subscribe, set} = writable(null);
  const defaultTimeout = 5000;

  return {
    subscribe,
    clear: () => set(null),
    success: (text: string, timeout: number = defaultTimeout) => {
      set({type: "success", text, timeout});
    },
    info: (text: string, timeout: number = defaultTimeout) => {
      set({type: "info", text, timeout});
    },
    error: (text: string, timeout: number = defaultTimeout) => {
      set({type: "error", text, timeout});
    }
  };
};
export const message = createMessageStore();

const createChangesStore = () => {
  const {subscribe, set, update} = writable(["", -1] as [string, number]);
  let history = [];
  let position = -1;

  return {
    subscribe,
    length: () => history.length,
    reset: () => {
      history = [];
      position = -1;
      set(["", -1]);
    },
    add: (value: unknown) => {
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
export const changes = createChangesStore();

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
  const fonts = (storedObj("fonts") || JSON.parse(JSON.stringify(DEFAULT_FONTS))) as Fonts;
  const border = stored("border") || DEFAULT_BORDER;
  const borderWidth = +stored("borderWidth") || DEFAULT_BORDER_WIDTH;
  const background = stored("background") || DEFAULT_BACKGROUND;
  const scale = +stored("scale") || DEFAULT_SCALE;
  const zoom = +stored("zoom") || DEFAULT_ZOOM;

  const grid = +stored("grid") || DEFAULT_GRID;
  const showGrid = storedObj("showGrid") || DEFAULT_SHOW_GRID;

  const storedTinctures = storedObj("tinctures");
  const areTincturesValid = storedTinctures ? validateTinctures(storedTinctures) : false;
  const tinctures: Tinctures = areTincturesValid ? storedTinctures : JSON.parse(JSON.stringify(DEFAULT_TINCTURES));

  return {
    size,
    diaper,
    grad,
    shield,
    colors,
    tinctures,
    fonts,
    border,
    borderWidth,
    background,
    scale,
    zoom,
    grid,
    showGrid
  };
}
