import {readable, writable} from 'svelte/store';

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

export const history = writable([]);
export const matrices = writable([[]]);
export const matrix = writable(0);
export const state = writable({edit:0, about:0});

export const loadedCharges = writable([]);
export const patterns = writable([]);

function defineInitialOptions() {
  // apply stored options
  const storedLocally = localStorage.getItem("Armoria");
  if (storedLocally) return JSON.parse(storedLocally);

  // set default options
  const options = {size: 200, diaper: "nourse"};
  if (!options.grad) options.grad = ra(["luster", "spotlight", "backlight"]);
  if (!options.shield) options.shield = rw({heater:60, oldFrench:20, spanish:30, french:5, swiss:2, wedged:2, italian:1, renaissance:1, baroque:1, polish:1, round:1, square:1, vesicaPiscis:1});
  if (!options.colors) options.colors = {argent: "#fafafa", or: "#ffe066", gules: "#d7374a", sable: "#333333", azure: "#377cd7", vert: "#26c061", purpure: "#522d5b"};
  if (!options.border) options.border = "#333333";
  if (!options.borderWidth) options.borderWidth = 1;
  if (!options.background) options.background = "#333333";
  if (!options.scale) options.scale = 1;
  return options;
}

// return random value from the array
function ra(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// return random value from weighted array {"key1":weight1, "key2":weight2}
function rw(object) {
  const array = [];
  for (const key in object) {
    for (let i=0; i < object[key]; i++) {
      array.push(key);
    }
  };
  return array[Math.floor(Math.random() * array.length)];
}