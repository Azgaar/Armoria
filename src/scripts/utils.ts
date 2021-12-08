export const forEach = (selector: string, callback: (element: Element) => void): void => {
  Array.from(document.querySelectorAll(selector)).forEach(element => {
    callback(element);
  });
};

export function ra<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

// return random value from weighted array
export function rw(object: {[key: string]: number}, save = true) {
  if (object.array) {
    return ra(object.array as unknown as string[]);
  }

  const array: string[] = [];

  for (const key in object) {
    for (let i = 0; i < object[key]; i++) {
      array.push(key);
    }
  }

  if (save) {
    Object.defineProperty(object, "array", {
      enumerable: false,
      configurable: true,
      writable: false,
      value: array
    });
  }

  return ra(array);
}

export function P(probability: number) {
  return Math.random() < probability;
}

export function camelize(str: string) {
  return str
    .toLowerCase()
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[()]/g, "") // remove parentheses
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, c) => c.toUpperCase())
    .replace(/^[0-9]/, "_"); // first char should not be a number
}

export function capitalize(string: string) {
  return string
    .replace(/_/g, " ")
    .replace(/(?<!_)(?=[A-Z])/g, " ")
    .replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());
}

export function splitToWords(string: string) {
  return string.split(/(?=[A-Z])/).join(" ");
}

export function link(url: string, text: string) {
  return `<a href="${url}" target="_blank">${text}</a>`;
}

export function openURL(url: string) {
  return window.open(url, "_blank");
}

export const minmax = (value: number, min: number, max: number) => {
  return Math.max(Math.min(Math.round(value), max), min);
};
