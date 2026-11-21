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
  if (process.env.EDITOR_CONTROLS_RESULTS) await writeFile(process.env.EDITOR_CONTROLS_RESULTS, JSON.stringify(renders, null, 2));
});
async function session(t) {
  const context = await browser.createBrowserContext();
  t.after(() => context.close());
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.setViewport({width: 1440, height: 1000});
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
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
  });
  await page.goto(origin + "/?" + new URLSearchParams({coa: JSON.stringify(fixture)}), {waitUntil: "networkidle0"});
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
async function select(page, container, option, value = option) {
  await page.$$eval(
    container + " select",
    (nodes, {option, value}) => {
      const n = nodes.find(n => [...n.options].some(o => o.value === option));
      if (!n) throw Error("Missing select " + option);
      n.value = value;
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

test("general bindings and Restore retain one-step history, URL updates and reload", async t => {
  const page = await session(t);
  await expand(page, "#menu > .section:first-child");
  const name = "Salt & sea + 100% <crest> 東京";
  await step(
    page,
    () => input(page, tip("tooltip.coaName") + " input", name),
    coa => assert.equal(coa.name, name)
  );
  await step(
    page,
    () => input(page, tip("tooltip.zoom") + " input", "0.8"),
    coa => assert.equal(coa.zoom, 0.8)
  );
  const restore = '#menu .section use[href="#undo-icon"]';
  assert.equal(await page.$eval(restore, n => n.closest(".section").classList.contains("expanded")), false);
  await step(
    page,
    () => page.$eval(restore, n => n.closest("svg").dispatchEvent(new MouseEvent("click", {bubbles: true}))),
    coa => assert.equal(coa.shield, undefined)
  );
  await history(page, "Z");
  assert.equal(await page.$eval(restore, n => n.closest(".section").classList.contains("expanded")), false);
  await history(page, "X");
  const expected = (await snapshot(page)).rendered;
  await page.waitForFunction(
    expected => JSON.stringify(JSON.parse(new URL(location.href).searchParams.get("coa"))) === JSON.stringify(expected),
    {},
    expected
  );
  await record(page, "general");
  await page.reload({waitUntil: "networkidle0"});
  assert.deepEqual((await snapshot(page)).rendered, expected);
});

test("inscription object bindings and nested switches preserve text and history", async t => {
  const page = await session(t);
  await expand(page, "#inscription_0");
  const p = panel("inscription_0");
  for (const [key, value, property, expected] of [
    ["text", "  Élan & <shield> | 東京  ", "text", "  Élan & <shield> | 東京  "],
    ["size", "18", "size", 18],
    ["spacing", "1.3", "spacing", 1.3],
    ["color", "#123456", "color", "#123456"]
  ])
    await step(
      page,
      () => input(page, `${p} ${tip("tooltip.inscriptions." + key)} input`, value),
      coa => assert.equal(coa.inscriptions[0][property], expected)
    );
  await step(
    page,
    () => input(page, `${p} select${tip("tooltip.inscriptions.font")}`, "Georgia", "change"),
    coa => assert.equal(coa.inscriptions[0].font, "Georgia")
  );
  for (const [label, property] of [
    ["Bold:", "bold"],
    ["Italic:", "italic"]
  ]) {
    await step(
      page,
      () =>
        page.$eval(
          p,
          (container, label) => {
            const wrapper = [...container.querySelectorAll("span")].find(n => n.firstElementChild?.textContent.trim() === label);
            wrapper.querySelector(".switch-label").click();
          },
          label
        ),
      coa => assert.equal(coa.inscriptions[0][property], 1)
    );
  }
  await record(page, "inscription");
});

test("ordinary stroke and stacking controls notify the legacy parent once", async t => {
  const page = await session(t);
  await expand(page, "#ordinary_0");
  const p = panel("ordinary_0");
  const stroke = `${p} ${tip("tooltip.stroke")}`;
  await step(
    page,
    () => page.$eval(stroke + " .switch-label", n => n.click()),
    coa => assert.equal(coa.ordinaries[0].stroke, "#000000")
  );
  await step(
    page,
    () => input(page, stroke + ' input[type="color"]', "#234567"),
    coa => assert.equal(coa.ordinaries[0].stroke, "#234567")
  );
  await step(
    page,
    () => input(page, stroke + ' input[type="number"]', "2.3"),
    coa => assert.equal(coa.ordinaries[0].strokeWidth, 2.3)
  );
  await step(
    page,
    () => page.$eval(`${p} ${tip("tooltip.aboveCharges")} .switch-label`, n => n.click()),
    coa => assert.equal(coa.ordinaries[0].above, true)
  );
  await step(
    page,
    () => select(page, p, "counter", "division"),
    coa => assert.equal(coa.ordinaries[0].divided, "division")
  );
  await record(page, "stroke");
});

test("stripe modes keep their defaults and each switch remains one undo step", async t => {
  const page = await session(t);
  await expand(page, "#ordinary_1");
  const p = panel("ordinary_1");
  await step(
    page,
    () => select(page, p, "gyronny"),
    coa => {
      assert.equal(coa.ordinaries[1].gyronny, 8);
      assert.equal(coa.ordinaries[1].compony, undefined);
    }
  );
  assert.equal(await page.$eval(`${p} ${tip("tooltip.gyronnyNumber")} input`, n => n.value), "8");
  await step(
    page,
    () => input(page, `${p} ${tip("tooltip.gyronnyNumber")} input`, "12"),
    coa => assert.equal(coa.ordinaries[1].gyronny, 12)
  );
  await step(
    page,
    () => select(page, p, "compony"),
    coa => {
      assert.equal(coa.ordinaries[1].compony, 25);
      assert.equal(coa.ordinaries[1].gyronny, undefined);
    }
  );
  assert.equal(await page.$eval(`${p} ${tip("tooltip.componySize")} input`, n => n.value), "25");
  await step(
    page,
    () => input(page, `${p} ${tip("tooltip.componySize")} input`, "17"),
    coa => assert.equal(coa.ordinaries[1].compony, 17)
  );
  await record(page, "stripes");
});

test("charge layering, outside placement and division bindings preserve history", async t => {
  const page = await session(t);
  await expand(page, "#charge_0");
  const p = panel("charge_0");
  await step(
    page,
    () => page.$eval(`${p} ${tip("tooltip.layered")} .switch-label`, n => n.click()),
    coa => assert.equal(coa.charges[0].layered, 1)
  );
  await step(
    page,
    () => select(page, p, "above"),
    coa => assert.equal(coa.charges[0].outside, "above")
  );
  await step(
    page,
    () => select(page, p, "around"),
    coa => {
      assert.equal(coa.charges[0].outside, "around");
      assert.equal(coa.charges[0].layered, undefined);
    }
  );
  await step(
    page,
    () => select(page, p, "above", ""),
    coa => assert.equal(coa.charges[0].outside, undefined)
  );
  await step(
    page,
    () => select(page, p, "counter"),
    coa => assert.equal(coa.charges[0].divided, "counter")
  );
  await record(page, "charge");
});

test("field type and pattern size bindings retain legacy previews and undo", async t => {
  const page = await session(t);
  await page.$$eval("#menu > .section", nodes => nodes.find(n => n.textContent.trim() === "Field").click());
  const p = "#menu > .section.expanded + .panel";
  await page.waitForSelector(p);
  await step(
    page,
    () => select(page, p, "small"),
    coa => assert.equal(coa.t1, "chequy-or-azure-small")
  );
  await step(
    page,
    () => select(page, p, "tincture"),
    coa => assert.equal(coa.t1, "or")
  );
  await step(
    page,
    () => select(page, p, "pattern"),
    coa => assert.match(coa.t1, /^vair-or-/)
  );
  await step(
    page,
    () => select(page, p, "semy"),
    coa => assert.match(coa.t1, /^semy_of_lozenge-or-/)
  );
  // Return to the deterministic original palette before comparing rendered output.
  for (let i = 0; i < 3; i++) await history(page, "Z");
  assert.equal((await snapshot(page)).coa.t1, "chequy-or-azure-small");
  await record(page, "field");
});

for (const [id, key] of [
  ["ordinary", "ordinaries"],
  ["charge", "charges"],
  ["inscription", "inscriptions"]
]) {
  test(`${id} layer controls clone, reorder and remove without opening their section`, async t => {
    const page = await session(t);
    const original = (await snapshot(page)).coa[key];
    const click = (index, icon) =>
      page.$eval(`#${id}_${index} use[href="#${icon}-icon"]`, n =>
        n.closest("svg").dispatchEvent(new MouseEvent("click", {bubbles: true}))
      );
    await step(
      page,
      () => click(0, "down"),
      coa => assert.deepEqual(coa[key], [original[1], original[0]])
    );
    assert.equal(await page.$eval(`#${id}_0`, n => n.classList.contains("expanded")), false);
    await step(
      page,
      () => click(1, "up"),
      coa => assert.deepEqual(coa[key], original)
    );
    await step(
      page,
      () => click(0, "clone"),
      coa => assert.deepEqual(coa[key], [...original, original[0]])
    );
    await step(
      page,
      () => click(2, "remove"),
      coa => assert.deepEqual(coa[key], original)
    );
    assert.equal(await page.$eval(`#${id}_0`, n => n.classList.contains("expanded")), false);
  });
}
