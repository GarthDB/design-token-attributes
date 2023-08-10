import test from "ava";
import stylelint from "stylelint";
import stylelintAttributesPlugin from "../index.js";
import { fileURLToPath } from "url";
import { resolve } from "path";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

import { readFile } from "node:fs/promises";

test("plugin lint css with deprecated definitions in same file", async (t) => {
  const config = {
    plugins: [stylelintAttributesPlugin],
    rules: {
      "design-token-attributes/deprecated": [true],
    },
  };
  const {
    results: [{ warnings, parseErrors }],
  } = await stylelint.lint({
    files: resolve(__dirname, "fixtures", "use-deprecated.css"),
    config,
  });
  t.is(parseErrors.length, 0);
  t.snapshot(warnings);
});

test("plugin lint css with deprecated definitions in different file", async (t) => {
  const config = {
    plugins: [stylelintAttributesPlugin],
    rules: {
      "design-token-attributes/deprecated": [
        true,
        { importFrom: [resolve(__dirname, "fixtures", "definitions.css")] },
      ],
    },
  };
  const {
    results: [{ warnings, parseErrors }],
  } = await stylelint.lint({
    files: resolve(__dirname, "fixtures", "production.css"),
    config,
  });
  t.is(parseErrors.length, 0);
  t.snapshot(warnings);
});

test("plugin lint css with private definitions in different file", async (t) => {
  const config = {
    plugins: [stylelintAttributesPlugin],
    rules: {
      "design-token-attributes/private": [
        true,
        { importFrom: [resolve(__dirname, "fixtures", "definitions.css")] },
      ],
    },
  };
  const {
    results: [{ warnings, parseErrors }],
  } = await stylelint.lint({
    files: resolve(__dirname, "fixtures", "production.css"),
    config,
  });
  t.is(parseErrors.length, 0);
  t.snapshot(warnings);
});
