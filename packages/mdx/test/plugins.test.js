import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "acorn";
import { transpileMD } from "../src/transpiler/index.js";

test("runs remark and rehype plugins in their respective tree stages", async () => {
  const code = await transpileMD("# Original", {
    remarkPlugins: [
      () => (tree) => {
        tree.children[0].children[0].value = "Changed by remark";
      },
    ],
    rehypePlugins: [
      () => (tree) => {
        assert.equal(tree.children[0].type, "element");
        tree.children[0].properties.dataTest = "changed by rehype";
      },
    ],
  });

  assert.match(code, /Changed by remark/);
  assert.match(code, /dataTest/);
  assert.match(code, /changed by rehype/);
});

test("preserves MDX expressions through remark-rehype", async () => {
  const code = await transpileMD("# Hello {name}");

  assert.match(code, /h1/);
  assert.match(code, /name/);
});

test("keeps the syntax highlighting adapter working with HAST", async () => {
  const code = await transpileMD("```js\nconst value = 1;\n```", {
    syntaxHighlightAdapter: {
      highlight: () => '<span class="token">highlighted</span>',
    },
  });

  assert.match(code, /class: "token"/);
  assert.match(code, /highlighted/);
});

test("escapes whitespace text nodes so generated JavaScript stays valid", async () => {
  const code = await transpileMD("<span> djdj </span>\n        \n\n# Hello world");

  assert.doesNotThrow(() =>
    parse(code, { ecmaVersion: "latest", sourceType: "module" })
  );
});
