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

// probability shorthand
function P(probability) {
  return Math.random() < probability;
}

// return string with 1st char capitalized
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// round string to d decimals
function round(s, d) {
  return s.replace(/[\d\.-][\d\.e-]*/g, function(n) {return Math.round(n * 10**d) / 10**d;})
}

function parseTransform(string) {
  if (!string) {return [0,0,0,0,0,1];}
  const a = string.replace(/[a-z()]/g, "").replace(/[ ]/g, ",").split(",");
  return [a[0] || 0, a[1] || 0, a[2] || 0, a[3] || 0, a[4] || 0, a[5] || 1];
}

function getDefaultColors() {
  return {argent: "#fafafa", or: "#ffe066", gules: "#d7374a", sable: "#333333", azure: "#377cd7", vert: "#26c061", purpure: "#522d5b"};
}

// dev item, remove in prod
function clean(id, decimals = 1) {
  const el = document.getElementById(id);
  el.querySelectorAll("path").forEach(n => {
    n.setAttribute("d", round(n.getAttribute("d"), decimals));
    n.removeAttribute("id");
    n.removeAttribute("style");
  });
  console.log(el.innerHTML);
}