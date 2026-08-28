// import { hyphen2pascalcase } from "ziko/data/string/index.js";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';

import terser from "@rollup/plugin-terser";

const Addon_name = "mdz";
const Author = "";

const banner = `
/*
  Project: ${Addon_name}
  Author: ${Author}
  Date : ${new Date()}
*/
`;
const isProduction = process.env.NODE_ENV === "production";

const output = [
  {
    file: `dist/${Addon_name}.mjs`,
    format: "es",
    banner,
    exports: "named",
  },
  {
    file: `dist/${Addon_name}.js`,
    format: "umd",
    // name: hyphen2pascalcase(Addon_name),
    name : 'MDZ',
    banner,
    exports: "named",
  },
];
isProduction &&
  output.push(
    {
      file: `dist/${Addon_name}.min.mjs`,
      format: "es",
      banner,
      exports: "named",
    },
    {
      file: `dist/${Addon_name}.min.js`,
      format: "umd",
      // name: hyphen2pascalcase(Addon_name),
      name : 'Mdz',
      banner,
      exports: "named",
      plugins: [
        terser({
          output: {
            comments: (node, { type, value }) =>
              type === "comment2" && value.includes("Author"),
          },
        }),
      ],
    },
  );

export default {
  input: "src/index.js",
  output,
  external: ["ziko"],
  plugins: [
    resolve(),
    commonjs(),
  ],
};
