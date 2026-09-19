import { visit } from 'unist-util-visit'

const LANG = 'mind-elixir'

/** Parse `key=value key2="value 2"` from the fence meta string. */
function parseMeta(meta = '') {
  const opts = {}
  const re = /(\w[\w-]*)=(?:"([^"]*)"|'([^']*)'|(\S+))/g
  let m
  while ((m = re.exec(meta))) {
    const raw = m[2] ?? m[3] ?? m[4]
    opts[m[1]] = raw === 'true' ? true : raw === 'false' ? false : /^\d+$/.test(raw) ? Number(raw) : raw
  }
  return opts
}

/** Indented outline -> Mind Elixir data. Indent unit is auto-detected. */
function outlineToData(text) {
  const lines = text.replace(/\t/g, '  ').split('\n').filter((l) => l.trim())
  if (!lines.length) throw new Error('Empty mind-elixir block')

  let n = 0
  const mk = (topic) => ({ id: `n${n++}`, topic, children: [] })
  const clean = (l) => l.trim().replace(/^[-*+]\s+/, '') // allow markdown-style bullets

  const indents = lines.map((l) => l.match(/^ */)[0].length)
  const base = indents[0]
  const unit = Math.min(...indents.filter((i) => i > base).map((i) => i - base), Infinity)
  const depthOf = (i) => (unit === Infinity ? 0 : Math.round((i - base) / unit))

  const root = mk(clean(lines[0]))
  const stack = [{ depth: 0, node: root }]

  for (let i = 1; i < lines.length; i++) {
    const depth = Math.max(1, depthOf(indents[i]))
    const node = mk(clean(lines[i]))
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop()
    const parent = stack.length ? stack[stack.length - 1].node : root
    parent.children.push(node)
    stack.push({ depth, node })
  }
  root.id = 'root'
  return { nodeData: root, linkData: {} }
}

function toData(source) {
  const trimmed = source.trim()
  if (trimmed.startsWith('{')) return JSON.parse(trimmed)
  return outlineToData(source)
}

export default function remarkMindElixir() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== LANG || !parent || index == null) return

      const { height = 420, ...options } = parseMeta(node.meta)
      let payload
      try {
        payload = { data: toData(node.value), options }
        console.log(payload.data.nodeData.children)
      } catch (err) {
        // Fail visibly instead of breaking the whole build
        parent.children[index] = {
          type: 'mindElixirError',
          data: {
            hName: 'pre',
            hProperties: { className: ['mind-elixir-error'] },
            hChildren: [{ type: 'text', value: `mind-elixir: ${err.message}` }],
          },
        }
        return
      }

      // Unknown mdast node + data.hName => remark-rehype emits an element
      parent.children[index] = {
        type: 'mindElixir',
        data: {
          hName: 'div',
          hProperties: {
            className: ['mind-elixir-block'],
            style: `height:${height}px`,
            'data-mind-elixir': JSON.stringify(payload),
          },
        },
      }
    })
  }
}