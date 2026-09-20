import { visitParents } from 'unist-util-visit-parents'

/**
 * Remark plugin for rendering custom `img` code blocks.
 *
 * ```img
 * https://example.com/image.png
 * ```
 *
 * @param {Object} options
 * @returns {Function}
 */
const remarkImg = (options = {}) => {
  return function transformer(ast, file) {
    const instances = []

    visitParents(
      ast,
      { type: 'code', lang: 'mind-elixir' },
      (node, ancestors) => {
        node.data = {
          hProperties: {
            id: 'intro',
            className: ['foo'],
            'data-type': 'custom'
          }
        }
        instances.push([...ancestors, node])
      }
    )

    if (!instances.length) {
      return
    }

    for (const ancestors of instances) {
      const node = ancestors.at(-1)
      const parent = ancestors.at(-2)

      const nodeIndex = parent.children.indexOf(node)

      const url = node.value.trim()

      if (!url) {
        if (options.errorFallback) {
          const fallback = options.errorFallback(
            node,
            new Error('Image URL is empty'),
            file
          )

          if (fallback) {
            parent.children[nodeIndex] = fallback
          } else {
            parent.children.splice(nodeIndex, 1)
          }
        } else {
          parent.children.splice(nodeIndex, 1)
        }

        continue
      }

      parent.children[nodeIndex] = {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            url : '',
            alt: node.meta || ''
          },
          {
            type: 'code',
            lang: 'yaml',
            meta: 'jj',
            value: 'console.log({a:1})',
            data: {
              hProperties: {
                // Adds data-id to the resulting HTML <p> tag
                'data-id': 'default-id',
              }
            },
          }
        ]
      }
    }
  }
}

export default remarkImg
