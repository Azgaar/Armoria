// return random value from the array
export function ra(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// return random value from weighted array
export function rw(object) {
  const array = [];
  for (const key in object) {
    for (let i = 0; i < object[key]; i++) {
      array.push(key);
    }
  };
  return array[Math.floor(Math.random() * array.length)];
}

// probability shorthand
export function P(probability) {
  return Math.random() < probability;
}

// get camelCase string
export function camelize(str) {
  return str
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/_/g, " ") // replace _ by spaces
    .replace(/\W+(.)/g, (m, c) => c.toUpperCase()); // remove non-basic chars and camelize
}