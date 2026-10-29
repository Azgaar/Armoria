import assert from "node:assert/strict";
import {test} from "node:test";
import {getFilesFromDropEvent} from "../src/lib/scripts/files.ts";

test("drop extraction tolerates missing transfers and prefers the file list", () => {
  assert.deepEqual(getFilesFromDropEvent({dataTransfer: null}), []);
  const file = new File(["image"], "crest.png", {type: "image/png"});
  assert.deepEqual(getFilesFromDropEvent({dataTransfer: {files: [file], items: []}}), [file]);
});

test("item fallback preserves method receivers and drops text and null files", () => {
  const file = new File(["<svg/>"], "crest.svg", {type: "image/svg+xml"});
  const item = {
    kind: "file",
    getAsFile() {
      assert.equal(this, item);
      return file;
    }
  };
  const transfer = {
    files: [],
    items: [
      {
        kind: "string",
        getAsFile() {
          throw new Error("Text is not a file");
        }
      },
      {
        kind: "file",
        getAsFile() {
          return null;
        }
      },
      item
    ]
  };
  assert.deepEqual(getFilesFromDropEvent({dataTransfer: transfer}), [file]);
});
