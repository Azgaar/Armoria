import {writable} from "svelte/store";
import {readSavedSettings} from "./settings";

export const isTextReady = writable(false);

const options = readSavedSettings();
export const size = writable(options.size);
export const grad = writable(options.grad);
export const diaper = writable(options.diaper);
export const shield = writable(options.shield);
export const colors = writable(options.colors);
export const tinctures = writable(options.tinctures);
export const fonts = writable(options.fonts);
export const background = writable(options.background);
export const fontColor = writable(options.fontColor);
export const scale = writable(options.scale);
export const border = writable(options.border);
export const borderWidth = writable(options.borderWidth);
export const grid = writable(options.grid);
export const showGrid = writable(options.showGrid);
export const uploaded = writable(options.uploaded);

export const history = writable([]);
export const matrices = writable([]);
export const matrix = writable(0);
export const state = writable({
  edit: 0,
  about: 0,
  license: 0,
  tinctures: 0,
  import: 0,
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
  let history: string[] = [];
  let position = -1;

  return {
    subscribe,
    length: () => history.length,
    reset: () => {
      history = [];
      position = -1;
      set(["", -1]);
    },
    add: (value: string) => {
      if (value === history[position]) return; // no change
      if (position < history.length - 1) history = history.slice(0, position + 1); // cut future history
      history.push(value);
      position += 1;
      set([history[position], position]);
    },
    // Restoring an imported/legacy entry can fill editor defaults. Keep that
    // normalization in the same undo step, preserving any redo branch.
    replace: (value: string) => {
      if (position < 0 || value === history[position]) return;
      history[position] = value;
      set([value, position]);
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
