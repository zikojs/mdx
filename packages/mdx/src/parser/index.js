import { unified } from 'unified';
import { reporter } from 'vfile-reporter'
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx'
import remarkFrontmatter from 'remark-frontmatter';
import remarkToc from 'remark-toc'
import remarkGFM from 'remark-gfm';
import { VFile } from 'vfile';
import {matter} from 'vfile-matter';

export async function parseMD(markdown, ...plugins) {
  const file = new VFile(markdown);
  matter(file, { strip: true });

  const processor = unified()
    .use(remarkParse)
    .use(remarkGFM)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkToc)
    .use(remarkMdx)
    // .use(MindElixir);

  plugins.forEach(plugin => {
    if (Array.isArray(plugin)) processor.use(...plugin);
    else processor.use(plugin);
  });

  const tree = processor.parse(file);          // parse only
  const ast = await processor.run(tree, file); // run all transformer plugins

  if (file.messages.length > 0) console.error(reporter(file));

  return {
    file,
    frontmatter: file.data.matter,
    ast,
  };
}