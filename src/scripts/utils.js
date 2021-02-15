// return random value from the array
export function ra(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// return random value from weighted array
export function rw(object) {
  if (!object.array) {

    const array = [];
    for (const key in object) {
      for (let i = 0; i < object[key]; i++) {
        array.push(key);
      }
    }

    Object.defineProperty(object, "array", {enumerable: false, configurable: true, writable: false, value: array});
  }

  return object.array[Math.floor(Math.random() * object.array.length)];
}

// probability shorthand
export function P(probability) {
  return Math.random() < probability;
}

// transform string to camelCase
export function camelize(str) {
  return str
    .toLowerCase()
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[()]/g, "") // remove parentheses
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, c) => c.toUpperCase())
    .replace(/^[0-9]/, "_"); // first char should not be a number
}