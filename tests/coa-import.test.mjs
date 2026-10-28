import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, page, origin;
const errors = [];
const legacy = {
  name: "Legacy crest",
  t1: "or",
  charges: [{charge: "eagle", t: "gules", sinister: 1}],
  inscriptions: [{text: "Old & new <crest>", font: "Arial"}]
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
    page = await browser.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on("request", request =>
      request.url().startsWith(origin) || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort()
    );
  },
  {timeout: 60000}
);
after(async () => {
  await browser?.close();
  await server?.close();
});

async function open(coa) {
  const query = coa === undefined ? "" : "?" + new URLSearchParams({coa: typeof coa === "string" ? coa : JSON.stringify(coa)});
  await page.goto(origin + "/" + query, {waitUntil: "networkidle0"});
}
async function snapshot() {
  return page.evaluate(async () => {
    const s = await import("/src/lib/data/stores.ts");
    const {get} = await import("/node_modules/svelte/src/runtime/store/index.js");
    return {
      history: get(s.history),
      matrices: get(s.matrices),
      matrix: get(s.matrix),
      state: get(s.state),
      changes: get(s.changes),
      length: s.changes.length()
    };
  });
}
async function showImport() {
  await page.evaluate(async () => {
    const {state} = await import("/src/lib/data/stores.ts");
    state.update(value => ({...value, import: 1}));
  });
  await page.waitForSelector('#jsonUpload input[type="file"]');
}
async function upload(text, type = "application/json", drop = false) {
  await page.evaluate(
    async ({text, type, drop}) => {
      const {message} = await import("/src/lib/data/stores.ts");
      message.clear();
      const transfer = new DataTransfer();
      transfer.items.add(new File([text], "crest.json", {type}));
      if (drop)
        document.querySelector("#jsonUpload").dispatchEvent(new DragEvent("drop", {bubbles: true, dataTransfer: transfer}));
      else {
        const input = document.querySelector('#jsonUpload input[type="file"]');
        input.files = transfer.files;
        input.dispatchEvent(new Event("input", {bubbles: true}));
      }
    },
    {text, type, drop}
  );
  await page.waitForFunction(async () => {
    const {message} = await import("/src/lib/data/stores.ts");
    let current;
    message.subscribe(value => (current = value))();
    return !!current;
  });
}
async function undoRedo(action) {
  await page.evaluate(async action => {
    const {changes} = await import("/src/lib/data/stores.ts");
    const {tick} = await import("/node_modules/svelte/src/runtime/index.js");
    changes[action]();
    await tick();
  }, action);
}

test(
  "malformed URL data falls back to a usable gallery with an actionable error",
  async () => {
    for (const coa of ["{}", "null", "1", '"text"', "[]", "{", "", '{"t1":"or","charges":{}}']) {
      await open(coa);
      const current = await snapshot();
      assert.equal(current.state.edit, 0, coa);
      assert.equal(current.state.view, 0, coa);
      assert.ok(current.history.length > 0);
      assert.ok(current.history.every(item => typeof item.t1 === "string"));
      assert.equal(await page.$("#coaEdit"), null);
      await page.waitForSelector(".error");
      assert.match(await page.$eval(".error", element => element.textContent), /Cannot load this coat of arms/);
    }
    assert.deepEqual(errors, []);
  },
  {timeout: 60000}
);

test("legacy URL defaults render in the editor and viewer", async () => {
  await open(legacy);
  await page.waitForSelector("#coaEdit textPath");
  const current = await snapshot();
  const coa = JSON.parse(current.changes[0]);
  assert.equal(coa.charges[0].p, "e");
  assert.equal(coa.inscriptions[0].size, 20);
  assert.equal(coa.inscriptions[0].path, "M-50 0 L50 0");
  await page.goto(origin + "/?" + new URLSearchParams({coa: JSON.stringify(legacy), view: "1"}), {waitUntil: "networkidle0"});
  assert.equal((await snapshot()).state.view, 1);
  await page.waitForSelector("textPath");
  assert.deepEqual(errors, []);
});

test(
  "invalid editor imports preserve the artwork and the redo branch",
  async () => {
    await open({t1: "or", name: "Original"});
    await showImport();
    await upload(JSON.stringify([{t1: "azure", name: "Second"}]));
    await undoRedo("undo");
    await showImport();
    const before = await snapshot();
    for (const text of [
      "{",
      "{}",
      "null",
      "[]",
      "true",
      '[{"t1":"or"},{}]',
      '[{"t1":"or","charges":{}}]',
      '[{"t1":"or","charges":[{"charge":"missing","t":"azure"}]}]',
      JSON.stringify(Array(65).fill({t1: "or"})),
      " ".repeat(2 * 1024 * 1024 + 1)
    ]) {
      await upload(text);
      assert.deepEqual(await snapshot(), before, text.slice(0, 100));
      await page.waitForSelector(".error");
      assert.match(await page.$eval(".error", element => element.textContent), /Your artwork has not changed/);
    }
    await undoRedo("redo");
    assert.equal(JSON.parse((await snapshot()).changes[0]).name, "Second");
    assert.deepEqual(errors, []);
  },
  {timeout: 60000}
);

test("invalid gallery imports are atomic, including a malformed later entry", async () => {
  await open();
  await showImport();
  const before = await snapshot();
  for (const text of ["{}", "[]", '[{"t1":"or"},{"t1":"azure","division":null}]']) {
    await upload(text, "", true);
    assert.deepEqual(await snapshot(), before);
  }
  await upload(JSON.stringify([legacy, {t1: "azure", name: "Gallery crest"}]), "", true);
  const after = await snapshot();
  assert.equal(after.matrix, before.matrix + 1);
  assert.equal(after.state.import, 0);
  const indices = after.matrices[after.matrix];
  assert.equal(after.history[indices[0]].charges[0].p, "e");
  assert.equal(after.history[indices[1]].name, "Gallery crest");
  assert.deepEqual(errors, []);
});

test("a current JSON export can be imported, undone, and redone", async () => {
  await open(legacy);
  const text = await page.evaluate(async () => {
    const blobs = [];
    const originalURL = URL.createObjectURL;
    const originalClick = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = blob => {
      blobs.push(blob);
      return originalURL(blob);
    };
    HTMLAnchorElement.prototype.click = function () {};
    try {
      [...document.querySelectorAll("li")].find(item => item.textContent.trim() === "Export JSON").click();
      return await blobs[0].text();
    } finally {
      URL.createObjectURL = originalURL;
      HTMLAnchorElement.prototype.click = originalClick;
    }
  });
  assert.equal(JSON.parse(text)[0].name, legacy.name);
  await open({t1: "azure", name: "Before import"});
  await showImport();
  await upload(text, "");
  assert.equal(JSON.parse((await snapshot()).changes[0]).name, legacy.name);
  await undoRedo("undo");
  assert.equal(JSON.parse((await snapshot()).changes[0]).name, "Before import");
  await undoRedo("redo");
  assert.equal(JSON.parse((await snapshot()).changes[0]).name, legacy.name);
  assert.deepEqual(errors, []);
});

test("ordinary editor changes still create undo steps after an import", async () => {
  await open({t1: "or", name: "Before"});
  await showImport();
  await upload(JSON.stringify([legacy]));
  const before = await snapshot();
  await page.evaluate(() =>
    [...document.querySelectorAll(".section")].find(item => item.textContent.trim() === "General").click()
  );
  await page.waitForSelector('input[type="text"]');
  await page.evaluate(() => {
    const input = [...document.querySelectorAll('input[type="text"]')].find(item => item.value === "Legacy crest");
    input.value = "Edited after import";
    input.dispatchEvent(new Event("input", {bubbles: true}));
  });
  const edited = await snapshot();
  assert.equal(JSON.parse(edited.changes[0]).name, "Edited after import");
  assert.equal(edited.length, before.length + 1);
  await undoRedo("undo");
  assert.equal(JSON.parse((await snapshot()).changes[0]).name, legacy.name);
  await undoRedo("undo");
  assert.equal(JSON.parse((await snapshot()).changes[0]).name, "Before");
  await undoRedo("redo");
  await undoRedo("redo");
  assert.equal(JSON.parse((await snapshot()).changes[0]).name, "Edited after import");
  assert.deepEqual(errors, []);
});

test("locally registered charges, fonts, and tinctures remain importable", async () => {
  await page.evaluate(() => {
    localStorage.setItem(
      "uploaded",
      JSON.stringify({
        localcharge: {
          category: "uploaded",
          type: "vector",
          data: {colors: 1},
          content: '<g id="localcharge"><path d="M0 0h100v100z"/></g>'
        }
      })
    );
    localStorage.setItem("fonts", JSON.stringify({"Local Font": {}}));
    localStorage.setItem("colors", JSON.stringify({localcolor: "#112233", or: "#ffe066", argent: "#fafafa", azure: "#377cd7"}));
  });
  const coa = {
    t1: "localcolor",
    charges: [{charge: "localcharge", t: "or", p: "e"}],
    inscriptions: [{text: "Local", font: "Local Font"}]
  };
  await open(coa);
  await page.waitForSelector("#coaEdit textPath");
  await page.waitForSelector("#localcharge path");
  await showImport();
  await upload(JSON.stringify([{...coa, name: "Local import"}]));
  assert.equal(JSON.parse((await snapshot()).changes[0]).name, "Local import");
  assert.equal((await snapshot()).state.import, 0);
  assert.deepEqual(errors, []);
});
