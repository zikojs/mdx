import { parseMD } from "../parser/index.js";
import { processMDAST } from "../preprocessor/index.js";
import { stringifyProps, transformeAttrs } from "../utils/index.js";

const transpileMD = async (
  Markdown,
  {
    plugins = [],
    remarkPlugins = [],
    rehypePlugins = [],
    remarkRehypeOptions,
    syntaxHighlightAdapter = null,
  } = {}
) => {
    const {ast, frontmatter} = await parseMD(Markdown.trimStart(), {
      plugins,
      remarkPlugins,
      rehypePlugins,
      remarkRehypeOptions,
      // useRehypeHighlight: !syntaxHighlightAdapter,
      useRehypeHighlight: false,

    });
    const {esm, statements, Tags}= processMDAST(ast, {syntaxHighlightAdapter});

    const { 'MDX.Props': props, ...attrs } = frontmatter;

    const body = [
        `import { tags } from 'ziko/dom/tags'`,
        ...esm,
        transformeAttrs(attrs),
        `export default (${stringifyProps(props)})=>{`,
        `const {${[...Tags].join(', ')}} = tags`,
        'const __items__ = []',
        ...statements,
        'return __items__',
        '}',
      ].filter(Boolean)
    return body.join("\n");
}
export{
    transpileMD
}
