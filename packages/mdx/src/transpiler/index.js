import { parseMD } from "../parser/index.js";
import { processMDAST } from "../preprocessor/index.js";
import { stringifyProps, transformeAttrs } from "../utils/index.js";

const transpileMD = async (Markdown, {plugins = []} = {})=>{
    const {ast, frontmatter} = await parseMD(Markdown.trimStart(), ...plugins);
    const {esm, statements, hasCode, Tags}= processMDAST(ast);

    const { 'MDZ.Props': props, ...attrs } = frontmatter;

    const imports = hasCode ? 'import {tags, HTMLWrapper} from "ziko/dom"' : 'import {tags} from "ziko/dom"';

    const body = [
        imports,
        ...esm,
        transformeAttrs(attrs),
        `export default (${stringifyProps(props)})=>{`,
        `const {${[...Tags].join(', ')}} = tags`,
        'const __items__ = []',
        ...statements,
        'return __items__',
        '}',
      ]
    // if(hasCode) body.unshift(`import("highlight.js/styles/${CodeStyle}.css")`);
    return body.join("\n");
}
export{
    transpileMD
}
