import {templates, lines} from "../data/templates";

export const getTemplate = (id, line) => {
  const linedId = id+"Lined";
  if (!line || line === "straight" || !templates[linedId]) return templates[id];
  const linePath = lines[line];
  return templates[linedId](linePath);
}