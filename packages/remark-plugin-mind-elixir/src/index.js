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
      { type: 'code', lang: 'img' },
      (node, ancestors) => {
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
            url,
            alt: node.meta || ''
          }
        ]
      }
    }
  }
}

export default remarkImg
