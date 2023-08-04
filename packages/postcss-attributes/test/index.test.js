import test from "ava";
import postcss from "postcss";
import plugin from "../index.js";
import { fileURLToPath } from "url";
import { resolve } from "path";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

console.log(__dirname);

import { readFile } from "node:fs/promises";

test("plugin should process css deprecated comment", async (t) => {
  const result = await postcss(plugin).process(
    await readFile(
      resolve(__dirname, "fixtures", "custom-properties.css"),
      "utf8",
    ),
    { from: "src/custom-properties.css", to: "dest/custom-properties.css" },
  );
  t.snapshot(result.messages);
});

test("plugin should process css deprecated comment with renamed property", async (t) => {
  const result = await postcss(plugin).process(
    await readFile(
      resolve(__dirname, "fixtures", "renamed-custom-properties.css"),
      "utf8",
    ),
    {
      from: "src/renamed-custom-properties.css",
      to: "dest/renamed-custom-properties.css",
    },
  );
  t.snapshot(result.messages);
});

test("plugin should process css deprecated comment with message property", async (t) => {
  const result = await postcss(plugin).process(
    await readFile(
      resolve(__dirname, "fixtures", "message-custom-property.css"),
      "utf8",
    ),
    {
      from: "src/message-custom-property.css",
      to: "dest/message-custom-property.css",
    },
  );
  t.snapshot(result.messages);
});
