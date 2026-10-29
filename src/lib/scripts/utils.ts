export const forEach = (selector: string, callback: (element: Element) => void): void => {
  Array.from(document.querySelectorAll(selector)).forEach(element => {
    callback(element);
  });
};

export function ra<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

// return random value from weighted array
export function rw<K extends string>(object: Record<K, number>, save = true): K {
  const cached: unknown = Reflect.get(object, "array");
  if (Array.isArray(cached)) return ra(cached) as K;

  const array: K[] = [];

  for (const key in object) {
    for (let i = 0; i < object[key]; i++) {
      array.push(key as K);
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

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function link(url: string, text: string) {
  return `<a href="${url}" target="_blank">${text}</a>`;
}

export function openURL(url: string) {
  return window.open(url, "_blank");
}

export const minmax = (value: number, min: number, max: number) => {
  return Math.max(Math.min(Math.round(value), max), min);
};

export const fetcher = (url: string) => () => {
  return fetch(url).then(result => result.json());
};
