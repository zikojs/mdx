import { hyperscript } from "./hyperscript.js";

export const transformHTMLNode = (node) => {
  if (node.type === "text") {
    return JSON.stringify(node.data);
  }

  if (node.type === "tag") {
    const attrs = Object.entries(node.attribs || {})
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(", ");

    const props = `{ ${attrs} }`;

    const children = (node.children || [])
      .map(transformHTMLNode)
      .join(", ");

    return hyperscript(
      node.name,
      props,
      children
    );
  }

  return "";
};