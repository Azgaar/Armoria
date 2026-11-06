import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {readFile, writeFile} from "node:fs/promises";
import {createServer} from "vite";
import puppeteer from "puppeteer";

const en = JSON.parse(await readFile(new URL("../static/locales/en/lang.json", import.meta.url)));
let server, browser, origin;
const renders = {};
const fixture = {
  name: "Editor control fixture",
  t1: "chequy-or-azure",
  shield: "heater",
  division: {division: "perPale", t: "gules", line: "straight"},
  ordinaries: [
    {ordinary: "fess", t: "argent"},
    {ordinary: "bordure", t: "gules", t2: "or", compony: 12}
  ],
  charges: [
    {charge: "bearRampant", t: "sable", t2: "gules", t3: "argent", p: "e", size: 1},
    {charge: "eagle", t: "azure", p: "a", size: 0.5}
  ],
  inscriptions: [
    {text: "First & <crest>", font: "Arial", size: 12, path: "M-70 60 L70 60"},
    {text: "Second", font: "Arial", size: 10, path: "M-70 80 L70 80"}
  ]
};
before(
  async () => {
    server = await createServer({logLevel: "silent", server: {host: "127.0.0.1", port: 0}});
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: process.env.PUPPETEER_NO_SANDBOX ? ["--no-sandbox"] : []
    });
  },
  {timeout: 60000}
);
after(async () => {
  await browser?.close();
  await server?.close();
  if (process.env.EDITOR_GEOMETRY_RESULTS) await writeFile(process.env.EDITOR_GEOMETRY_RESULTS, JSON.stringify(renders, null, 2));
});
async function session(t, coa = fixture) {
  const context = await browser.createBrowserContext();
  t.after(() => context.close());
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.setViewport({width: 1440, height: 1000});
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("dialog", async d => (d.type() === "beforeunload" ? d.accept() : d.dismiss()));
  page.on("console", msg => {
    if (/ownership_invalid|binding_property_non_reactive|state_unsafe_mutation|effect_update_depth_exceeded/.test(msg.text()))
      errors.push(msg.text());
  });
  t.after(() => assert.deepEqual(errors, []));
  await page.setRequestInterception(true);
  page.on("request", r => (r.url().startsWith(origin + "/") || /^(data|blob):/.test(r.url()) ? r.continue() : r.abort()));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("locale", "en");
    localStorage.setItem("shield", "heater");
    localStorage.setItem("grad", "no");
    localStorage.setItem("diaper", "no");
    if (!localStorage.getItem("grid")) localStorage.setItem("grid", "5");
    if (!localStorage.getItem("showGrid")) localStorage.setItem("showGrid", "false");
  });
  await page.goto(origin + "/?" + new URLSearchParams({coa: JSON.stringify(coa)}), {waitUntil: "networkidle0"});
  await page.waitForSelector("#coaEdit textPath");
  await page.waitForSelector("#defs #bearRampant path");
  return page;
}
const panel = id => `#${id} + .panel`;
const tip = key => `[data-tooltip=${JSON.stringify(key.split(".").reduce((o, k) => o[k], en))}]`;
async function expand(page, selector) {
  await page.$eval(selector, n => n.click());
  await page.waitForSelector(selector + ".expanded + .panel");
}
async function input(page, selector, value, event = "input") {
  await page.$eval(
    selector,
    (n, {value, event}) => {
      n.value = value;
      n.dispatchEvent(new Event(event, {bubbles: true}));
    },
    {value, event}
  );
}
async function snapshot(page) {
  return page.evaluate(async () => {
    const {get, tick} = await import("/src/lib/testing/browser-runtime.ts");
    const {changes} = await import("/src/lib/data/stores.ts");
    await tick();
    const [text, index] = get(changes);
    return {
      text,
      coa: JSON.parse(text),
      index,
      length: changes.length(),
      rendered: JSON.parse(document.querySelector("#coaEdit").dataset.coa)
    };
  });
}
async function history(page, key) {
  await page.$eval(`nav li[data-hotkey="${key}"]`, n => n.click());
  return snapshot(page);
}
async function step(page, action, verify) {
  const before = await snapshot(page);
  await action();
  await page.waitForFunction(
    async text => {
      const {get} = await import("/src/lib/testing/browser-runtime.ts");
      const {changes} = await import("/src/lib/data/stores.ts");
      return get(changes)[0] !== text;
    },
    {},
    before.text
  );
  const after = await snapshot(page);
  assert.equal(after.index, before.index + 1);
  assert.equal(after.length, before.index + 2);
  verify(after.coa);
  const undone = await history(page, "Z");
  assert.deepEqual(undone.coa, before.coa);
  assert.equal(undone.length, after.length);
  const redone = await history(page, "X");
  assert.deepEqual(redone.coa, after.coa);
  assert.deepEqual(redone.rendered, after.rendered);
  assert.equal(redone.length, after.length);
  return after;
}
async function record(page, name) {
  const svg = await page.evaluate(async () => (await import("/src/lib/scripts/download.js")).getSvgForMap());
  const png = await page.evaluate(async svg => {
    const url = URL.createObjectURL(new Blob([svg], {type: "image/svg+xml"}));
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const c = document.createElement("canvas");
      c.width = image.width;
      c.height = image.height;
      c.getContext("2d").drawImage(image, 0, 0);
      return c.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  }, svg);
  renders[name] = {coa: (await snapshot(page)).rendered, svg, png};
}
async function stable(page, action) {
  const before = await snapshot(page);
  await action();
  const after = await snapshot(page);
  assert.equal(after.text, before.text);
  assert.equal(after.index, before.index);
  assert.equal(after.length, before.length);
}
async function state(page) {
  return page.evaluate(async () => {
    const {get} = await import("/src/lib/testing/browser-runtime.ts");
    const {state} = await import("/src/lib/data/stores.ts");
    return get(state);
  });
}
for (const [id, key] of [
  ["ordinary", "ordinaries"],
  ["charge", "charges"]
]) {
  test(`${id} size, stretch, rotation and shifts retain history and grid settings`, async t => {
    const page = await session(t);
    await expand(page, `#${id}_0`);
    const p = panel(`${id}_0`);
    for (const [label, value, property, expected] of [
      ["size", "125", "size", 1.25],
      ["stretch", "30", "stretch", 0.3],
      ["rotation", "25", "angle", 25]
    ]) {
      await step(
        page,
        async () => {
          await input(page, `${p} ${tip("tooltip." + label)} input`, value);
          if (label === "rotation") await input(page, `${p} ${tip("tooltip.rotation")} input`, value, "change");
        },
        coa => assert.equal(coa[key][0][property], expected)
      );
    }
    for (const [index, property, value] of [
      [1, "x", "15"],
      [2, "y", "-10"]
    ])
      await step(
        page,
        () => input(page, `${p} ${tip("tooltip.shift")} input:nth-of-type(${index})`, value),
        coa => assert.equal(coa[key][0][property], Number(value))
      );
    await stable(page, () => input(page, `${p} ${tip("tooltip.step")} input`, "10"));
    await stable(page, () => page.$eval(`${p} ${tip("tooltip.showGrid")} .switch-label`, n => n.click()));
    await page.waitForSelector("#coaEdit #grid");
    assert.equal(await page.$eval("#gridPattern", n => n.getAttribute("width")), "10");
    assert.equal(await page.$eval("#grid", n => n.getAttribute("transform")), "rotate(25)");
    assert.equal(await page.evaluate(() => localStorage.getItem("grid")), "10");
    await record(page, id + "-shift");
    await page.reload({waitUntil: "networkidle0"});
    await page.waitForSelector("#coaEdit #grid");
    assert.equal(await page.$eval("#gridPattern", n => n.getAttribute("width")), "10");
  });
}

test("position preset, free text and orientation update one history step", async t => {
  const page = await session(t);
  await expand(page, "#charge_0");
  const p = panel("charge_0");
  const pos = `${p} ${tip("tooltip.positions")}`;
  await page.focus(pos + " select");
  await page.waitForSelector("#positions");
  await step(
    page,
    () => page.select(pos + " select", "abc"),
    coa => {
      assert.equal(coa.charges[0].p, "abc");
      assert.equal(coa.charges[0].size, 0.5);
    }
  );
  await page.focus(pos + " input");
  await step(
    page,
    () => input(page, pos + " input", "df"),
    coa => {
      assert.equal(coa.charges[0].p, "df");
      assert.equal(coa.charges[0].size, 0.5);
    }
  );
  await page.$eval(pos + " input", n => n.blur());
  await page.waitForFunction(() => !document.querySelector("#positions"));
  for (const key of ["sinister", "reversed"])
    await step(
      page,
      () => page.$eval(`${p} ${tip("tooltip." + key)} .switch-label`, n => n.click()),
      coa => assert.equal(coa.charges[0][key], 1)
    );
  await record(page, "positions");
});

test("position overlay follows the current input and cleans up when its panel closes", async t => {
  const page = await session(t);
  await expand(page, "#charge_0");
  const p = panel("charge_0");
  const pos = `${p} ${tip("tooltip.positions")} input`;
  await page.focus(pos);
  await input(page, pos, "abc");
  await page.waitForFunction(() => document.querySelectorAll("#positions circle.active").length === 3);
  assert.deepEqual(await page.$$eval("#positions circle.active", nodes => nodes.map(n => n.parentElement.id).sort()), [
    "a",
    "b",
    "c"
  ]);
  await page.$eval("#charge_0", n => n.click());
  await page.waitForFunction(() => !document.querySelector("#charge_0 + .panel"));
  await page.waitForFunction(() => !document.querySelector("#positions"));
  assert.equal((await state(page)).positions, 0);
});

test("line and curve path controls preserve point modes and one-step undo", async t => {
  const page = await session(t);
  await expand(page, "#inscription_0");
  const p = panel("inscription_0");
  const path = `${p} ${tip("tooltip.inscriptions.path")}`;
  const shift = `${p} > .subsection:last-child ${tip("tooltip.shift")}`;
  await step(
    page,
    () => page.select(path + " select", "curve"),
    coa => assert.equal(coa.inscriptions[0].path, "M-70 60 Q0 60 70 60")
  );
  await stable(page, () => page.select(shift + " select", "2"));
  await step(
    page,
    () => input(page, shift + " input:nth-of-type(1)", "10", "change"),
    coa => assert.equal(coa.inscriptions[0].path, "M-70 60 Q10 60 70 60")
  );
  await step(
    page,
    () => input(page, shift + " input:nth-of-type(2)", "-20", "change"),
    coa => assert.equal(coa.inscriptions[0].path, "M-70 60 Q10 -20 70 60")
  );
  await record(page, "curve");
  await step(
    page,
    () => page.select(path + " select", "line"),
    coa => assert.equal(coa.inscriptions[0].path, "M-70 60 L70 60")
  );
  assert.equal(await page.$eval(shift + " select", n => n.value), "-1");
  await step(
    page,
    () => input(page, shift + " input:nth-of-type(1)", "-50", "change"),
    coa => assert.equal(coa.inscriptions[0].path, "M-50 60 L90 60")
  );
  await stable(page, () => page.select(shift + " select", "1"));
  await step(
    page,
    () => input(page, shift + " input:nth-of-type(2)", "40", "change"),
    coa => assert.equal(coa.inscriptions[0].path, "M-50 60 L90 40")
  );
});

test("custom path editing commits on blur and restores line/curve defaults", async t => {
  const page = await session(t);
  await expand(page, "#inscription_0");
  const p = panel("inscription_0");
  const path = `${p} ${tip("tooltip.inscriptions.path")}`;
  await stable(page, () => page.select(path + " select", "custom"));
  const custom = "M-60 20 C-20 -40 20 -40 60 20";
  await step(
    page,
    () => input(page, path + " input", custom, "blur"),
    coa => assert.equal(coa.inscriptions[0].path, custom)
  );
  await record(page, "custom-path");
  await step(
    page,
    () => page.select(path + " select", "curve"),
    coa => assert.equal(coa.inscriptions[0].path, "M-50 0 Q0 -20 50 0")
  );
  await history(page, "Z");
  await step(
    page,
    () => page.select(path + " select", "line"),
    coa => assert.equal(coa.inscriptions[0].path, "M-50 0 L50 0")
  );
});

test("shadow values preserve text, render and undo while enabled", async t => {
  const coa = structuredClone(fixture);
  coa.inscriptions[0].shadow = {x: 1, y: 1, blur: 0, color: "#333333"};
  const page = await session(t, coa);
  await expand(page, "#inscription_0");
  const p = panel("inscription_0");
  for (const [selector, key, value, expected] of [
    [`${p} > .subsection:nth-child(2) ${tip("tooltip.shift")} input:nth-of-type(1)`, "x", "3", 3],
    [`${p} > .subsection:nth-child(2) ${tip("tooltip.shift")} input:nth-of-type(2)`, "y", "-2", -2],
    [`${p} ${tip("tooltip.inscriptions.shadowBlur")} input`, "blur", "2", 2],
    [`${p} ${tip("tooltip.inscriptions.shadowColor")} input`, "color", "#123456", "#123456"]
  ])
    await step(
      page,
      () => input(page, selector, value),
      coa => assert.equal(coa.inscriptions[0].shadow[key], expected)
    );
  await record(page, "shadow");
});

test("shadow toggle follows undo/redo instead of overwriting restored history", async t => {
  const page = await session(t);
  await expand(page, "#inscription_0");
  const p = panel("inscription_0");
  const toggle = `${p} ${tip("tooltip.inscriptions.shadow")} .switch-label`;
  await step(
    page,
    () => page.$eval(toggle, n => n.click()),
    coa => assert.deepEqual(coa.inscriptions[0].shadow, {x: 1, y: 1, blur: 0, color: "#333333"})
  );
  await step(
    page,
    () => page.$eval(toggle, n => n.click()),
    coa => assert.equal(coa.inscriptions[0].shadow, undefined)
  );
});

async function drag(page, selector, dx, dy, modifiers = {}) {
  const box = await page.$eval("#coaEdit", n => {
    const b = n.getBoundingClientRect();
    return {x: b.x + b.width / 2, y: b.y + b.height / 2, unit: n.clientWidth / 200};
  });
  await page.$eval(
    selector,
    (n, {box, modifiers}) =>
      n.dispatchEvent(new MouseEvent("mousedown", {bubbles: true, clientX: box.x, clientY: box.y, ...modifiers})),
    {box, modifiers}
  );
  await page.evaluate(
    ({box, dx, dy}) => {
      document.dispatchEvent(
        new MouseEvent("mousemove", {bubbles: true, clientX: box.x + dx * box.unit, clientY: box.y + dy * box.unit})
      );
      document.dispatchEvent(
        new MouseEvent("mouseup", {bubbles: true, clientX: box.x + dx * box.unit, clientY: box.y + dy * box.unit})
      );
    },
    {box, dx, dy}
  );
  assert.equal(await page.evaluate(() => document.body.style.cursor), "auto");
}
for (const [id, key] of [
  ["ordinary", "ordinaries"],
  ["charge", "charges"]
]) {
  test(`${id} canvas drag, resize and rotation synchronize geometry controls`, async t => {
    const page = await session(t);
    await expand(page, `#${id}_0`);
    const p = panel(`${id}_0`),
      selector = `#coaEdit .${id}[i="0"]`;
    await step(
      page,
      () => drag(page, selector, 15, -10),
      coa => {
        assert.equal(coa[key][0].x, 15);
        assert.equal(coa[key][0].y, -10);
      }
    );
    assert.equal(await page.$eval(`${p} ${tip("tooltip.shift")} input:nth-of-type(1)`, n => n.value), "15");
    await step(
      page,
      () => drag(page, selector, 0, -20, {shiftKey: true}),
      coa => assert.ok(coa[key][0].size > 1)
    );
    await step(
      page,
      () => drag(page, selector, 30, 10, {ctrlKey: true}),
      coa => assert.ok(Number.isFinite(coa[key][0].angle) && coa[key][0].angle !== 0)
    );
    const before = await snapshot(page);
    await page.evaluate(() => document.dispatchEvent(new MouseEvent("mousemove", {clientX: 800, clientY: 700})));
    assert.equal((await snapshot(page)).text, before.text);
    await record(page, id + "-drag");
  });
}

test("inscription and endpoint dragging retain selected path, snapped points and history", async t => {
  const page = await session(t);
  await expand(page, "#inscription_0");
  await step(
    page,
    () => drag(page, '#coaEdit .inscription[i="0"]', 10, -10),
    coa => assert.equal(coa.inscriptions[0].path, "M-60 50 L80 50")
  );
  await page.waitForSelector('#coaEdit .inscription[i="0"] .points circle');
  assert.equal((await state(page)).selectedPath, 0);
  await step(
    page,
    () => drag(page, '#coaEdit .inscription[i="0"] .points circle:first-child', 5, -5),
    coa => assert.equal(coa.inscriptions[0].path, "M-55 45 L80 50")
  );
  assert.equal((await state(page)).pathChangeMode, 0);
  await record(page, "path-drag");
  await page.$eval(".bottom button", n => n.click());
  await page.waitForFunction(() => !document.querySelector("#coaEdit .points"));
  assert.equal((await state(page)).selectedPath, -1);
});
