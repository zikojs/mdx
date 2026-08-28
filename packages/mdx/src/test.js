import { parseMD } from "./parser/index.js";
import { processMDAST } from "./processor/index.js";
import { transpileMD } from "./transpiler/index.js";
const inp = `
---
a : 1
b : 2
MDZ.Props : 
 - a : 1
 - c : 2
---

import A from 'B';

{A}

# Hello 
`
const out = await parseMD(inp.trimStart())
// const p = processMDAST(out.ast)
// const t = await transpileMD(inp)

console.log(out)
// console.log(p)
// console.log(t)