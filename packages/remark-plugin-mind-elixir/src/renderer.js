
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { visitParents } from 'unist-util-visit-parents'
import YAML from 'yaml'

/**
 * Escape HTML.
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Create an HTML placeholder for Mind Elixir.
 *
 * The actual Mind Elixir instance is created on the client.
 */
function elixirMindRenderer(options = {}) {
  return async function render(sources) {
    return sources.map((source) => {
      try {
        const data = YAML.parse(source)

        const id =
          options.idPrefix
            ? `${options.idPrefix}-${Math.random().toString(36).slice(2)}`
            : `mind-elixir-${Math.random().toString(36).slice(2)}`

        const json = JSON.stringify(data)

        const html = `
<section
  class="mind-elixir"
  id="${escapeHtml(id)}"
  data-mind-elixir
  data-mind-elixir-data="${escapeHtml(json)}"
></section>
`.trim()

        return {
          status: 'fulfilled',
          value: {
            html,
            data
          }
        }
      } catch (error) {
        return {
          status: 'rejected',
          reason: error
        }
      }
    })
  }
}

/**
 * Remark plugin for Mind Elixir diagrams.
 *
 * Markdown:
 *
 * ```mind
 * root:
 *   children:
 *     - Child 1
 *     - Child 2
 * ```
 *
 * @param {Object} options
 * @returns {Function}
 */
const remarkElixirMind = (options = {}) => {
  const render = elixirMindRenderer(options)

  return function transformer(ast, file) {
    const instances = []

    visitParents(
      ast,
      { type: 'code', lang: 'mind' },
      (node, ancestors) => {
        instances.push([...ancestors, node])
      }
    )

    if (!instances.length) {
      return
    }

    return render(
      instances.map((ancestors) => ancestors.at(-1).value)
    ).then((results) => {
      for (const [i, ancestors] of instances.entries()) {
        const result = results[i]

        const node = ancestors.at(-1)
        const parent = ancestors.at(-2)
        const nodeIndex = parent.children.indexOf(node)

        if (result.status === 'fulfilled') {
          const { html } = result.value

          const hChildren = fromHtmlIsomorphic(html, {
            fragment: true
          }).children

          parent.children[nodeIndex] = {
            type: 'paragraph',
            children: [
              {
                type: 'html',
                value: html
              }
            ],
            data: {
              hChildren
            }
          }
        } else if (options.errorFallback) {
          const fallback = options.errorFallback(
            node,
            result.reason,
            file
          )

          if (fallback) {
            parent.children[nodeIndex] = fallback
          } else {
            parent.children.splice(nodeIndex, 1)
          }
        } else {
          const message = file.message(result.reason, {
            ruleId: 'remark-elixir-mind',
            source: 'remark-elixir-mind',
            ancestors
          })

          message.fatal = true
          message.url =
            'https://github.com/SSShooter/mind-elixir-core'

          throw message
        }
      }
    })
  }
}

export default remarkElixirMind