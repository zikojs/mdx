import { parseDocument } from "htmlparser2";

export function htmlToZikoJS(html) {
  const document = parseDocument(html);

  let script = "";

  const nodes = document.children
    .filter(node => node.type !== "comment")
    .filter(node => {
      if (node.type === "script") {
        script = node.children
          .filter(child => child.type === "text")
          .map(child => child.data)
          .join("");

        return false;
      }

      return true;
    });

  const template = nodes
    .map(nodeToZikoJS)
    .filter(Boolean)
    .join(",\n");

  return {
    script: script.trim(),
    template
  };
}

function nodeToZikoJS(node) {
  switch (node.type) {
    case "text": {
      const value = node.data;

      if (!value.trim()) return null;

      return parseText(value);
    }

    case "tag":
    case "style": {
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

      return `tags.${tag}(${args.join(", ")})`;
    }

    case "comment":
      return null;

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

  if (parts.length === 1) {
    return parts[0];
  }

  return parts.join(", ");
}



const v = htmlToZikoJS(`
<script>
  const a = "world";
</script>
<div class="card">
  <h1>Hello {a}</h1>
  <p>World</p>
</div>    
`)

console.log(v)