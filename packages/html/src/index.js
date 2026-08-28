import { parseDocument } from "htmlparser2";

export function htmlToZikoJS(html) {
  const document = parseDocument(html, {
    lowerCaseTags: false,
    xmlMode: true,
  });

  return document.children
    .filter(node => node.type !== "comment")
    .map(node => {
      switch (node.type) {
        case "script":
          return {
            type: "script",
            content: getTextContent(node)
          };

        case "style":
          return {
            type: "style",
            content: getTextContent(node)
          };

        default: {
          const content = nodeToZikoJS(node);

          if (!content) return null;

          return {
            type: "template",
            content
          };
        }
      }
    })
    .filter(Boolean);
}

function getTextContent(node) {
  return node.children
    .filter(child => child.type === "text")
    .map(child => child.data)
    .join("")
    .trim();
}

function nodeToZikoJS(node) {
  switch (node.type) {
    case "text": {
      const value = node.data;

      if (!value.trim()) return null;

      return parseText(value);
    }

    case "tag": {
      const tag = node.name;

      const props = Object.entries(node.attribs ?? {})
        .map(([key, value]) => {
          if (value === "") {
            return `${JSON.stringify(key)}: true`;
          }

          return `${JSON.stringify(key)}: ${JSON.stringify(value)}`;
        })
        .join(", ");

      const children = node.children
        .map(nodeToZikoJS)
        .filter(Boolean);

      const args = [];

      if (props) {
        args.push(`{ ${props} }`);
      }

      args.push(...children);

      const tagName = /^[A-Z]/.test(tag)
        ? tag
        : `tags.${tag}`;

      return `${tagName}(${args.join(", ")})`;
    }

    default:
      return null;
  }
}

function parseText(value) {
  const parts = [];
  const regex = /\{([^{}]+)\}/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(value))) {
    const text = value.slice(lastIndex, match.index);

    if (text) {
      parts.push(JSON.stringify(text));
    }

    parts.push(match[1].trim());

    lastIndex = regex.lastIndex;
  }

  const remaining = value.slice(lastIndex);

  if (remaining) {
    parts.push(JSON.stringify(remaining));
  }

  return parts.length === 1
    ? parts[0]
    : parts.join(", ");
}

const v = htmlToZikoJS(`
<style>
</style>
<script>
  const a = "world";
</script>
<Wrapper>
<Button />
<div class="card">
  <h1>Hello {a}</h1>
  <p>World</p>
</div> 
<script>
  const b = "world";
</script> 
<§  
`)

console.log(v)