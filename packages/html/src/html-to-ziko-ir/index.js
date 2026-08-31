import { parseDocument } from "htmlparser2";

export function HtmlToZikoJsIR(html) {
  const document = parseDocument(html);
  const tags = new Set();
  const data = [];

  document.children
    .filter(node => node.type !== "comment")
    .forEach(node => {
      switch (node.type) {
        case "script":
          data.push({
            type: "script",
            content: getTextContent(node)
          });
          break;

        case "style":
          data.push({
            type: "style",
            content: getTextContent(node)
          });
          break;

        default: {
          const content = nodeToZikoString(node, tags);
          if (!content) return;

          data.push({
            type: "template",
            content
          });
        }
      }
    });

  return { tags, data };
}

function getTextContent(node) {
  return node.children
    .filter(child => child.type === "text")
    .map(child => child.data)
    .join("")
    .trim();
}

function nodeToZikoString(node, tags) {
  switch (node.type) {
    case "text": {
      const value = node.data;
      if (!value.trim()) return null;
      return parseText(value);
    }

    case "tag": {
      const tag = node.name;
      tags.add(tag);

      const props = Object.entries(node.attribs ?? {})
        .map(([key, value]) => {
          if (value === "") {
            return `${JSON.stringify(key)}: true`;
          }

          return `${JSON.stringify(key)}: ${parseAttributeValue(value)}`;
        })
        .join(", ");

      const children = node.children
        .map(child => nodeToZikoString(child, tags))
        .filter(Boolean);

      const args = [];

      if (props) {
        args.push(`{ ${props} }`);
      }

      args.push(...children);

      return `${tag}(${args.join(", ")})`;
    }

    default:
      return null;
  }
}

function parseAttributeValue(value) {
  const regex = /\{([a-zA-Z_$][\w$]*(?:\.[\w$]+)*)\}/g;

  if (!regex.test(value)) {
    return JSON.stringify(value);
  }

  regex.lastIndex = 0;

  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(value))) {
    result += value.slice(lastIndex, match.index);
    result += `\${${match[1]}}`;
    lastIndex = regex.lastIndex;
  }

  result += value.slice(lastIndex);

  return `\`${result}\``;
}

function parseText(value) {
  const parts = [];
  const regex = /\{([a-zA-Z_$][\w$]*(?:\.[\w$]+)*)\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(value))) {
    const text = value.slice(lastIndex, match.index);

    if (text.trim()) {
      parts.push(JSON.stringify(text));
    }

    parts.push(match[1]);
    lastIndex = regex.lastIndex;
  }

  const remaining = value.slice(lastIndex);

  if (remaining.trim()) {
    parts.push(JSON.stringify(remaining));
  }

  return parts.length === 1 ? parts[0] : parts.join(", ");
}