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
  if (process.env.EDITOR_SELECTION_RESULTS)
    await writeFile(process.env.EDITOR_SELECTION_RESULTS, JSON.stringify(renders, null, 2));
});
async function session(t, uploaded) {
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
  await page.evaluateOnNewDocument(uploaded => {
    if (uploaded && !localStorage.getItem("uploaded")) localStorage.setItem("uploaded", JSON.stringify(uploaded));
    localStorage.setItem("locale", "en");
    localStorage.setItem("shield", "heater");
    localStorage.setItem("grad", "no");
    localStorage.setItem("diaper", "no");
  }, uploaded);
  await page.goto(origin + "/?" + new URLSearchParams({coa: JSON.stringify(fixture)}), {waitUntil: "networkidle0"});
  await page.waitForSelector("#coaEdit textPath");
  await page.waitForSelector("#defs #bearRampant path");
  return page;
}
const panel = id => `#${id} + .panel`;
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
async function select(page, container, option, value = option) {
  await page.$$eval(
    container + " select",
    (nodes, {option, value}) => {
      const n = nodes.find(n => [...n.options].some(o => o.value === option));
      if (!n) throw Error("Missing select " + option);
      n.value = value;
      n.dispatchEvent(new Event("input", {bubbles: true}));
      n.dispatchEvent(new Event("change", {bubbles: true}));
    },
    {option, value}
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
const text = key => key.split(".").reduce((o, k) => o[k], en);
async function section(page, prefix) {
  await page.$$eval(
    "#menu > .section",
    (nodes, prefix) => {
      const node = nodes.find(n => n.textContent.trim().startsWith(prefix));
      if (!node) throw Error("Missing section " + prefix);
      node.dataset.selectionProbe = "active";
      node.click();
    },
    prefix
  );
  const p = '[data-selection-probe="active"] + .panel';
  await page.waitForSelector(p);
  return p;
}
async function item(page, p, label) {
  const selector = p + " svg.menuItem[data-tooltip=" + JSON.stringify(label) + "]";
  await page.waitForSelector(selector);
  await page.$eval(selector, n => n.closest(".item").click());
}
async function tips(page, p) {
  return page.$$eval(p + " svg.menuItem", nodes => nodes.map(n => n.dataset.tooltip));
}
async function stable(page, action) {
  const before = await snapshot(page);
  await action();
  await page.evaluate(async () => {
    const {tick} = await import("/src/lib/testing/browser-runtime.ts");
    await tick();
  });
  const after = await snapshot(page);
  assert.equal(after.text, before.text);
  assert.equal(after.index, before.index);
  assert.equal(after.length, before.length);
}

test("shield category/search selection preserves undo, preview and reload", async t => {
  const page = await session(t),
    p = await section(page, "Shield:");
  await stable(page, () => input(page, p + " input", "round"));
  assert.deepEqual(await tips(page, p), ["Shield: " + text("shield.simple.round")]);
  await step(
    page,
    () => item(page, p, "Shield: " + text("shield.simple.round")),
    coa => assert.equal(coa.shield, "round")
  );
  await stable(page, () => page.select(p + " select", "basic"));
  // Category input resets the search without adding an artwork edit.
  assert.equal(await page.$eval(p + " input", n => n.value), "");
  assert.ok((await tips(page, p)).length > 1);
  await record(page, "shield");
  const expected = (await snapshot(page)).rendered;
  await page.waitForFunction(
    expected => JSON.stringify(JSON.parse(new URL(location.href).searchParams.get("coa"))) === JSON.stringify(expected),
    {},
    expected
  );
  await page.reload({waitUntil: "networkidle0"});
  assert.deepEqual((await snapshot(page)).rendered, expected);
});

test("division and line selections retain nested field properties and one-step history", async t => {
  const page = await session(t),
    p = await section(page, "Division:");
  await step(
    page,
    () => item(page, p, "Division: " + text("divisions.perFess")),
    coa => assert.equal(coa.division.division, "perFess")
  );
  await step(
    page,
    () => item(page, p, "Line: " + text("lines.wavy")),
    coa => assert.equal(coa.division.line, "wavy")
  );
  await step(
    page,
    () => item(page, p, "Colour: " + text("tinctures.azure")),
    coa => assert.deepEqual(coa.division, {division: "perFess", t: "azure", line: "wavy"})
  );
  await record(page, "division");
});

test("ordinary and line previews follow nested tincture edits and undo", async t => {
  const page = await session(t);
  await expand(page, "#ordinary_0");
  const p = panel("ordinary_0");
  await step(
    page,
    () => item(page, p, "Ordinary: " + text("ordinaries.pale")),
    coa => assert.equal(coa.ordinaries[0].ordinary, "pale")
  );
  await step(
    page,
    () => item(page, p, "Line: " + text("lines.engrailed")),
    coa => assert.equal(coa.ordinaries[0].line, "engrailed")
  );
  await step(
    page,
    () => item(page, p, "Colour: " + text("tinctures.gules")),
    coa => assert.equal(coa.ordinaries[0].t, "gules")
  );
  await record(page, "ordinary");
});

test("pattern and semy selectors update fields without losing palette or size", async t => {
  const page = await session(t),
    p = await section(page, "Field");
  await step(
    page,
    () => item(page, p, text("patterns.vair")),
    coa => assert.equal(coa.t1, "vair-or-azure")
  );
  await step(
    page,
    () => select(page, p, "small"),
    coa => assert.equal(coa.t1, "vair-or-azure-small")
  );
  await step(
    page,
    () => item(page, p, "Metal: " + text("tinctures.argent")),
    coa => assert.equal(coa.t1, "vair-argent-azure-small")
  );
  await record(page, "pattern");
  await step(
    page,
    () => select(page, p, "semy"),
    coa => assert.match(coa.t1, /^semy_of_lozenge-argent-azure-small$/)
  );
  const search = p + " input:not([type])";
  await stable(page, () => input(page, search, "roundel"));
  await step(
    page,
    () => item(page, p, text("editor.semyOf") + " " + text("charges.roundel")),
    coa => assert.equal(coa.t1, "semy_of_roundel-argent-azure-small")
  );
  await record(page, "semy");
});

test("charge search/category selection preserves undo and translated labels", async t => {
  const page = await session(t);
  await expand(page, "#charge_0");
  const p = panel("charge_0") + " > .subsection:first-child";
  await stable(page, () => input(page, p + " input", "^eagle$"));
  assert.deepEqual(await tips(page, p), ["Charge: " + text("charges.eagle")]);
  await step(
    page,
    () => item(page, p, "Charge: " + text("charges.eagle")),
    coa => assert.equal(coa.charges[0].charge, "eagle")
  );
  await record(page, "charge");
  await stable(page, () => select(page, p, "beasts"));
  assert.equal(await page.$eval(p + " input", n => n.value), "");
  assert.ok((await tips(page, p)).length > 1);
  await page.evaluate(() => [...document.querySelectorAll("nav li")].find(n => n.textContent.trim() === "Français").click());
  await page.waitForFunction(() => [...document.querySelectorAll("nav li")].some(n => n.textContent.trim() === "Sauvegarder"));
  await stable(page, () => input(page, p + " input", "^aigle$"));
  assert.ok((await tips(page, p)).some(t => /aigle/i.test(t)));
});

test("palette editing and restoring updates previews and persists only user changes", async t => {
  const page = await session(t),
    p = await section(page, "Field");
  assert.equal(await page.evaluate(() => localStorage.getItem("colors")), null);
  const wrapper = p + " .subsection:nth-child(2) .wrapper:first-child";
  const before = await snapshot(page);
  await input(page, wrapper + " input[type=color]", "#123456");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("colors") || "{}").argent === "#123456");
  const after = await snapshot(page);
  assert.equal(after.text, before.text);
  assert.equal(after.length, before.length);
  assert.ok(await page.$(wrapper + " svg.undo"));
  assert.ok(await page.$(wrapper + ' [fill="#123456"]'));
  await page.$eval(wrapper + " svg.undo", n => n.dispatchEvent(new MouseEvent("click", {bubbles: true})));
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("colors")).argent !== "#123456");
  assert.equal(await page.$(wrapper + " svg.undo"), null);
});

test("uploaded vector and raster charges select, survive reload and remove from the catalog", async t => {
  const uploaded = {
    selectionvector: {
      category: "uploaded",
      type: "vector",
      data: {colors: 1},
      content: '<g id="selectionvector"><path fill="var(--tincture)" d="M-30-30h60v60h-60z"/></g>'
    },
    selectionraster: {
      category: "uploaded",
      type: "raster",
      content:
        '<image id="selectionraster" x="-50" y="-50" width="100" height="100" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1cAAAAASUVORK5CYII="/>'
    }
  };
  const page = await session(t, uploaded);
  await expand(page, "#charge_0");
  const p = panel("charge_0") + " > .subsection:first-child";
  await stable(page, () => select(page, p, "uploaded"));
  for (const charge of Object.keys(uploaded))
    await step(
      page,
      () => item(page, p, "Charge: " + charge),
      coa => assert.equal(coa.charges[0].charge, charge)
    );
  const expected = (await snapshot(page)).rendered;
  await page.reload({waitUntil: "networkidle0"});
  assert.deepEqual((await snapshot(page)).rendered, expected);
  await expand(page, "#charge_0");
  await stable(page, () =>
    page.$eval(p + ' svg.menuItem[data-tooltip="Charge: selectionvector"]', n =>
      n
        .closest(".wrapper")
        .querySelector("svg.remove")
        .dispatchEvent(new MouseEvent("click", {bubbles: true}))
    )
  );
  await page.waitForFunction(() => !JSON.parse(localStorage.getItem("uploaded")).selectionvector);
  assert.equal(await page.$("#selectionvector"), null);
  await page.waitForFunction(
    p => ![...document.querySelectorAll(p + " svg.menuItem")].some(n => n.dataset.tooltip === "Charge: selectionvector"),
    {},
    p
  );
  assert.deepEqual(await tips(page, p), ["Charge: selectionraster"]);
  await page.reload({waitUntil: "networkidle0"});
  await expand(page, "#charge_0");
  assert.deepEqual(await tips(page, p), ["Charge: selectionraster"]);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("uploaded")).selectionvector), undefined);
});

test("active search stays applied when preview inputs or translations change", async t => {
  const page = await session(t);
  await expand(page, "#charge_0");
  const p = panel("charge_0") + " > .subsection:first-child";
  await stable(page, () => input(page, p + " input", "^eagle$"));
  const field = await section(page, "Field");
  await step(
    page,
    () => select(page, field, "small"),
    coa => assert.equal(coa.t1, "chequy-or-azure-small")
  );
  assert.equal(await page.$eval(p + " input", n => n.value), "^eagle$");
  assert.deepEqual(await tips(page, p), ["Charge: " + text("charges.eagle")]);
  await page.evaluate(() => [...document.querySelectorAll("nav li")].find(n => n.textContent.trim() === "Français").click());
  await page.waitForFunction(() => [...document.querySelectorAll("nav li")].some(n => n.textContent.trim() === "Sauvegarder"));
  assert.deepEqual(await tips(page, p), []);
  await stable(page, () => input(page, p + " input", "^aigle$"));
  assert.equal((await tips(page, p)).length, 1);
});
