
import { visit } from 'unist-util-visit'
import { parse } from 'yaml'

export default function remarkMindElixir(options = {}) {
  const {
    root = 'Mind Map',
    className = 'mind-elixir',
  } = options

  return tree => {
    visit(tree, 'code', (node, index, parent) => {
      if (
        node.lang !== 'mind-elixir' ||
        !parent ||
        typeof index !== 'number'
      ) {
        return
      }

      const parsedYaml = parse(node.value)

      const data = yamlToMindElixir(parsedYaml, root)

      const json = JSON.stringify(data)
        .replace(/&/g, '\\u0026')
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')

      /*
       * Replace the fenced code block with a raw HTML node.
       *
       * Do NOT return SKIP here.
       * The node has already been replaced and there is nothing
       * useful for remark to traverse inside it.
       */
      parent.children[index] = {
        type: 'html',
        value: `
<div class="${className}" data-mind-elixir>
  <script type="application/json">${json}</script>
</div>
        `.trim(),
      }

      return
    })
  }
}

function createIdFactory() {
  let count = 0

  return (prefix = 'node') => {
    return `${prefix}-${++count}`
  }
}

function scalarToTopic(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  return String(value)
}

function createNode(topic, children, createId) {
  const node = {
    topic: String(topic),
    id: createId(),
  }

  if (children?.length) {
    node.children = children
  }

  return node
}

function valueToNode(key, value, createId) {
  /*
   * Scalar
   *
   * name: ZikoJS
   *
   * becomes:
   *
   * name: ZikoJS
   */
  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return createNode(
      `${key}: ${scalarToTopic(value)}`,
      undefined,
      createId
    )
  }

  /*
   * Object
   *
   * Core:
   *   DOM:
   *   Reactivity:
   */
  if (!Array.isArray(value)) {
    const children = Object.entries(value).map(
      ([childKey, childValue]) =>
        valueToNode(childKey, childValue, createId)
    )

    return createNode(
      key,
      children,
      createId
    )
  }

  /*
   * Array
   *
   * Packages:
   *   - ziko
   *   - zextra
   *   - numz
   */
  const children = value.map(item => {
    if (
      item !== null &&
      typeof item === 'object' &&
      !Array.isArray(item)
    ) {
      return objectItemToNode(item, createId)
    }

    return createNode(
      scalarToTopic(item),
      undefined,
      createId
    )
  })

  return createNode(
    key,
    children,
    createId
  )
}

function objectItemToNode(object, createId) {
  const entries = Object.entries(object)

  /*
   * - name: ziko
   *
   * becomes:
   *
   * name: ziko
   */
  if (entries.length === 1) {
    const [key, value] = entries[0]

    if (
      value === null ||
      typeof value !== 'object'
    ) {
      return createNode(
        `${key}: ${scalarToTopic(value)}`,
        undefined,
        createId
      )
    }
  }

  /*
   * Complex list item:
   *
   * - name: ziko
   *   type: core
   *
   * becomes:
   *
   * item
   * ├── name: ziko
   * └── type: core
   */
  const children = entries.map(
    ([key, value]) =>
      valueToNode(key, value, createId)
  )

  return createNode(
    'item',
    children,
    createId
  )
}

function yamlToMindElixir(
  parsedYaml,
  rootTopic = 'Mind Map'
) {
  const createId = createIdFactory()

  if (
    parsedYaml === null ||
    typeof parsedYaml !== 'object'
  ) {
    throw new TypeError(
      'mind-elixir YAML must contain an object or array'
    )
  }

  const children = Array.isArray(parsedYaml)
    ? parsedYaml.map(item => {
        if (
          item !== null &&
          typeof item === 'object'
        ) {
          return objectItemToNode(
            item,
            createId
          )
        }

        return createNode(
          scalarToTopic(item),
          undefined,
          createId
        )
      })
    : Object.entries(parsedYaml).map(
        ([key, value]) =>
          valueToNode(
            key,
            value,
            createId
          )
      )

  return {
    nodeData: {
      topic: rootTopic,
      id: createId('root'),
      root: true,
      children,
    },
  }
}

