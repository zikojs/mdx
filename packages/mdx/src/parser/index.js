import { unified } from 'unified'
import { reporter } from 'vfile-reporter'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkFrontmatter from 'remark-frontmatter'
import remarkToc from 'remark-toc'
import remarkGFM from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import { VFile } from 'vfile'
import { matter } from 'vfile-matter'

const mdxNodeTypes = [
  'mdxjsEsm',
  'mdxJsxTextElement',
  'mdxJsxFlowElement',
  'mdxTextExpression',
  'mdxFlowExpression',
  'yaml',
]

const isPluginOptions = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  [
    'plugins',
    'remarkPlugins',
    'rehypePlugins',
    'remarkRehypeOptions',
  ].some((key) => Object.hasOwn(value, key))

const usePlugins = (processor, plugins = []) => {
  for (const plugin of plugins) {
    if (Array.isArray(plugin)) processor.use(...plugin)
    else processor.use(plugin)
  }
}

export async function parseMD(markdown, ...pluginArgs) {
  const options =
    pluginArgs.length === 1 && isPluginOptions(pluginArgs[0])
      ? pluginArgs[0]
      : { remarkPlugins: pluginArgs }

  const remarkPlugins = [
    ...(options.plugins || []),
    ...(options.remarkPlugins || []),
  ]

  const rehypePlugins = options.rehypePlugins || []

  const file = new VFile(markdown)
  matter(file, { strip: true })

  const processor = unified()
    .use(remarkParse)
    .use(remarkGFM)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkToc)
    .use(remarkMdx)

  usePlugins(processor, remarkPlugins)

  processor.use(remarkRehype, {
    ...options.remarkRehypeOptions,
    passThrough: [
      ...new Set([
        ...mdxNodeTypes,
        ...(options.remarkRehypeOptions?.passThrough || []),
      ]),
    ],
  })

  usePlugins(processor, rehypePlugins)

  const tree = processor.parse(file)
  const ast = await processor.run(tree, file)

  if (file.messages.length > 0) {
    console.error(reporter(file))
  }

  return {
    file,
    frontmatter: file.data.matter,
    ast,
  }
}