import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "vite";
import puppeteer from "puppeteer";

let server, browser, origin;
const initial = {t1: "or", shield: "heater", name: "Original", charges: [{charge: "eagle", t: "gules", p: "e"}]};
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
});

async function session(t, from = "FMG", chargeAvailable = true) {
  const context = await browser.createBrowserContext();
  t.after(() => context.close());
  const errors = [];
  t.after(() => assert.deepEqual(errors, []));
  async function configure(page) {
    page.on("pageerror", error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on("request", request => {
      if (!chargeAvailable && request.url().endsWith("/charges/eagle.svg")) return request.abort();
      if (request.url() === origin + "/map-harness")
        return request.respond({status: 200, contentType: "text/html", body: "<title>Local map opener</title>"});
      return request.url().startsWith(origin + "/") || /^(data|blob):/.test(request.url()) ? request.continue() : request.abort();
    });
  }
  const opener = await context.newPage();
  await configure(opener);
  await opener.goto(origin + "/map-harness");
  await opener.evaluate(() => {
    window.fmgMessages = [];
    window.addEventListener("message", event => window.fmgMessages.push({origin: event.origin, data: event.data}));
  });
  const opened = new Promise(resolve => opener.once("popup", resolve));
  await opener.evaluate(() => window.open("about:blank"));
  const editor = await opened;
  await configure(editor);
  await editor.goto(
    origin + "/?" + new URLSearchParams({from, session: "race-test", returnOrigin: origin, coa: JSON.stringify(initial)}),
    {waitUntil: "networkidle0"}
  );
  await editor.waitForSelector("#coaEdit .field");
  if (chargeAvailable) await editor.waitForSelector("#defs #eagle path");
  // Pause only the export's blob read, after the actual SVG snapshot has been produced.
  await editor.evaluate(() => {
    window.exportGates = [];
    const original = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const response = await original(...args);
      if (!String(args[0]).startsWith("blob:")) return response;
      return new Promise((resolve, reject) =>
        window.exportGates.push({
          release: () => resolve(response),
          fail: () => reject(new Error("local export failure"))
        })
      );
    };
  });
  return {opener, editor};
}
async function edit(editor, name, t1) {
  await editor.evaluate(
    async ({name, t1}) => {
      const {changes} = await import("/src/lib/data/stores.ts");
      const coa = JSON.parse(document.querySelector("#coaEdit").dataset.coa);
      changes.add(JSON.stringify({...coa, name, t1}));
      await (await import("/node_modules/svelte/src/runtime/index.js")).tick();
    },
    {name, t1}
  );
}
async function history(editor, direction) {
  await editor.evaluate(async direction => {
    const {changes} = await import("/src/lib/data/stores.ts");
    changes[direction]();
    await (await import("/node_modules/svelte/src/runtime/index.js")).tick();
  }, direction);
}
async function pending(editor, count) {
  await editor.waitForFunction(count => window.exportGates.length === count, {polling: 50, timeout: 10000}, count);
}
async function release(editor, index, fail = false) {
  await editor.evaluate(({index, fail}) => window.exportGates[index][fail ? "fail" : "release"](), {index, fail});
  // Drain export/postMessage tasks without relying on background-tab animation frames.
  await editor.evaluate(() => new Promise(resolve => setTimeout(resolve, 50)));
}
async function messages(opener) {
  return opener.evaluate(() => window.fmgMessages.filter(({data}) => data.type === "armoria:coa"));
}
async function expectMessage(opener, name, count = 1) {
  await opener.waitForFunction(
    ({name, count}) =>
      window.fmgMessages.filter(({data}) => data.type === "armoria:coa").length === count &&
      window.fmgMessages.at(-1).data.coa.name === name,
    {polling: 50, timeout: 10000},
    {name, count}
  );
  const received = await messages(opener);
  const message = received.at(-1);
  assert.equal(message.origin, origin);
  assert.equal(message.data.version, 1);
  assert.equal(message.data.session, "race-test");
  if (message.data.svg) {
    const metadata = await opener.evaluate(svg => {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("Invalid fallback SVG");
      return JSON.parse(doc.querySelector("metadata.armoria-coa").textContent);
    }, message.data.svg);
    assert.deepEqual(metadata, message.data.coa);
  }
  return received;
}

test("rapid edits and undo discard exports that finish out of order", {timeout: 30000}, async t => {
  const {opener, editor} = await session(t);
  await edit(editor, "First", "gules");
  await pending(editor, 1);
  assert.deepEqual(await messages(opener), []);
  await edit(editor, "Second", "azure");
  await pending(editor, 2);
  await history(editor, "undo");
  await pending(editor, 3);
  await release(editor, 2);
  await expectMessage(opener, "First");
  await release(editor, 1, true);
  await release(editor, 0);
  const received = await messages(opener);
  assert.equal(received.length, 1, "obsolete exports must never overwrite the latest artwork");
  assert.equal(received[0].data.coa.t1, "gules");
  await history(editor, "redo");
  await pending(editor, 4);
  await release(editor, 3);
  await expectMessage(opener, "Second", 2);
});

test("undo to the original and leaving the editor cancel pending sends", {timeout: 30000}, async t => {
  const {opener, editor} = await session(t);
  await edit(editor, "Temporary", "gules");
  await pending(editor, 1);
  await history(editor, "undo");
  await release(editor, 0);
  assert.deepEqual(await messages(opener), []);
  await edit(editor, "Leaving", "azure");
  await pending(editor, 2);
  await editor.evaluate(async () => {
    const {state} = await import("/src/lib/data/stores.ts");
    state.update(value => ({...value, edit: 0}));
    await (await import("/node_modules/svelte/src/runtime/index.js")).tick();
  });
  await release(editor, 1);
  assert.deepEqual(await messages(opener), []);
});

test("an export failure still sends the latest COA and later edits recover", {timeout: 30000}, async t => {
  const {opener, editor} = await session(t);
  await edit(editor, "Fallback unavailable", "gules");
  await pending(editor, 1);
  await release(editor, 0, true);
  const received = await expectMessage(opener, "Fallback unavailable");
  assert.equal(received[0].data.svg, "");
  assert.equal(received[0].data.coa.t1, "gules");
  await edit(editor, "Recovered", "azure");
  await pending(editor, 2);
  await release(editor, 1);
  const recovered = await expectMessage(opener, "Recovered", 2);
  assert.ok(recovered[1].data.svg);
});

test("closing the map during export does not post or raise a browser error", {timeout: 30000}, async t => {
  const {opener, editor} = await session(t);
  await edit(editor, "Closed opener", "gules");
  await pending(editor, 1);
  await editor.evaluate(() => {
    window.postsAfterClose = 0;
    window.opener.postMessage = () => {
      window.postsAfterClose++;
    };
  });
  await opener.close();
  await release(editor, 0);
  assert.equal(await editor.evaluate(() => window.postsAfterClose), 0);
});

test("direct openings never export or send edits even with session parameters", {timeout: 30000}, async t => {
  const {opener, editor} = await session(t, "direct");
  await edit(editor, "Local edit", "gules");
  await editor.evaluate(() => new Promise(resolve => setTimeout(resolve, 650)));
  assert.equal(await editor.evaluate(() => window.exportGates.length), 0);
  assert.deepEqual(await messages(opener), []);
});

test("unavailable charge artwork does not prevent sending the edited blazon", {timeout: 30000}, async t => {
  const {opener, editor} = await session(t, "FMG", false);
  assert.equal(await editor.$("#defs #eagle path"), null);
  await edit(editor, "Missing charge asset", "azure");
  await pending(editor, 1);
  await release(editor, 0);
  const received = await expectMessage(opener, "Missing charge asset");
  assert.equal(received[0].data.coa.charges[0].charge, "eagle");
  assert.equal(received[0].data.coa.t1, "azure");
  assert.ok(received[0].data.svg, "the available field still exports for fallback rendering");
});
