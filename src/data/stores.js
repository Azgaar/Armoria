import {writable} from "svelte/store";
import {defaultTinctures, defaultColors} from "./dataModel";
import {shields} from "./shields";
import {ra, rw} from "@/scripts/utils";

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
export const state = writable({edit: 0, about: 0, i: 0});
export const message = writable(null);

const createChangesTracker = () => {
  const {subscribe, set, update} = writable([undefined, -1]);
  let history = [];
  let position = -1;

  return {
    subscribe,
    refresh: () => set([history[position], position]), // trigger coa refresh
    length: () => history.length,
    reset: () => {
      (history = []), (position = -1);
      set([undefined, -1]);
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
  const stored = key => {
    const value = localStorage.getItem(key);
    if (value === "null") return null;
    return value;
  };

  const storedObj = key => (localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null);

  const getShieldFromURL = () => {
    const coaParam = new URL(window.location).searchParams.get("coa");
    if (!coaParam) return null;
    const coa = JSON.parse(coaParam);
    return coa?.shield;
  };

  const size = +stored("size") || 200;
  const diaper = stored("diaper") || "no";
  const grad = stored("grad") || ra(["luster", "spotlight", "backlight"]);
  const shield = getShieldFromURL() || stored("shield") || rw(shields[rw(shields.types)]);
  const colors = storedObj("colors") || JSON.parse(JSON.stringify(defaultColors));
  const tinctures = storedObj("tinctures") || JSON.parse(JSON.stringify(defaultTinctures));
  const border = stored("border") || "#333333";
  const borderWidth = +stored("borderWidth") || 1;
  const background = stored("background") || "#333333";
  const scale = +stored("scale") || 2;

  const grid = +stored("grid") || 1;
  const showGrid = storedObj("showGrid") || 0;

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
