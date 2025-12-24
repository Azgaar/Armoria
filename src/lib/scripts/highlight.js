export const highlight = (target, type, index) => () => {
  if (target === "shield") {
    const g = document.getElementById("coaEdit").querySelector(`g.${type}[i="${index}"]`);
    g?.setAttribute("filter", "url(#highlight)");
  } else if (target === "menu") {
    const section = document.getElementById(`${type}_${index}`);
    section?.classList.add("highlighted");
  }
};

export const lowlight = (target, type, index) => () => {
  if (target === "shield") {
    const g = document.getElementById("coaEdit").querySelector(`g.${type}[i="${index}"]`);
    g?.removeAttribute("filter");
  } else if (target === "menu") {
    const section = document.getElementById(`${type}_${index}`);
    section?.classList.remove("highlighted");
  }
};
