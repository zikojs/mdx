import { 
  componentType,
  processAttribute,
  hyperscript,
  transformHTMLNode
} from "../utils/index.js"

import { parseDocument } from "htmlparser2";


export const processMDAST = (
  markdownAST,
  { syntaxHighlightAdapter = null, useCreateElement = false } = {}
) => {
  const Tags = new Set();
  let UsesCreateElement = false;

  const transformNode = (node) => {
    switch (node.type) {
      case "mdxjsEsm":
        return { type: "script", value: node.value };

      case "text": {
        const text = node.value;
        const escaped = text.replace(/"/g, '\\"');
        return `"${escaped}"`;
      }

      case "mdxTextExpression":
        return node.value;

      case "mdxFlowExpression": {
        if (!node.parent || node.parent.type === "root") {
          Tags.add("p");
          return hyperscript("p", "{}", node.value);
        }
        return node.value;
      }

      case "heading": {
        const childNodes = node.children.map(transformNode).join(", ");
        const tag = `h${node.depth}`;
        Tags.add(tag);
        return hyperscript(tag, "{}", childNodes);
      }

      case "paragraph":
      case "strong":
      case "emphasis":
      case "blockquote":
      case "listItem":
      case "tableRow":
      case "tableCell": {
        const tagMap = {
          paragraph: "p",
          strong: "strong",
          emphasis: "em",
          blockquote: "blockquote",
          listItem: "li",
          tableRow: "tr",
          tableCell: "td"
        };
        const tag = tagMap[node.type];
        const childNodes = node.children.map(transformNode).join(", ");
        Tags.add(tag);
        return hyperscript(tag, "{}", childNodes);
      }

      case "link": {
        const childNodes = node.children.map(transformNode).join(", ");
        Tags.add("a");
        return hyperscript("a", `{ href: "${node.url}" }`, childNodes);
      }

      case "image":
        Tags.add("img");
        return `img({ src: "${node.url}", alt: "${node.alt || ""}" })`;

      case "list": {
        const listTag = node.ordered ? "ol" : "ul";
        Tags.add(listTag);
        const childNodes = node.children.map(transformNode).join(", ");
        return hyperscript(listTag, "{}", childNodes);
      }

      case "inlineCode":
        Tags.add("code");
        return hyperscript("code", "{}", `"${node.value}"`);

      case "code": {
        Tags.add("pre");
        Tags.add("code");
        Tags.add("span");

        const highlightedCode = syntaxHighlightAdapter
          ? syntaxHighlightAdapter.highlight(node.value, node.lang)
          : node.value;

        const htmlAST = parseDocument(highlightedCode);
        const children = htmlAST.children
          .map(transformHTMLNode)
          .filter(Boolean)
          .join(", ");

        return hyperscript(
          "pre",
          "{}",
          hyperscript(
            "code",
            `{ class: "language-${node.lang || ""}" }`,
            children
          )
        );
      }

      case "thematicBreak":
        Tags.add("hr");
        return "hr({})";

      case "table": {
        const headerRows = node.children[0].children.map(transformNode).join(", ");
        const bodyRows = node.children.slice(1).map(transformNode).join(", ");

        const thead = hyperscript("thead", "{}", hyperscript("tr", "{}", headerRows));
        const tbody = hyperscript("tbody", "{}", bodyRows);

        Tags.add("table").add("thead").add("tbody").add("tr");

        return hyperscript("table", "{}", [thead, tbody].join(","));
      }

      case "mdxJsxTextElement":
      case "mdxJsxFlowElement": {
        const { name, attributes, children } = node;
        const childNodes = children.map(transformNode).join(", ");
        const props = processAttribute(attributes);
        const hasChildren = childNodes.length > 0;

        switch (componentType(name)) {
          case "jsx":
            if (useCreateElement) {
              UsesCreateElement = true;
              return `createElement(${name}, ${props}${hasChildren ? `, ${childNodes}` : ""})`;
            }
            return `${name}(${props}${hasChildren ? `, ${childNodes}` : ""})`;

          case "html":
            Tags.add(name);
            return `${name}(${props}${hasChildren ? `, ${childNodes}` : ""})`;

          case "script": {
            const statements = [];
            for (let i = 0; i < children.length; i++) {
              if (children[i]?.children?.[0]?.value) {
                statements.push(children[i].children[0].value);
              }
            }
            return {
              type: "script",
              isScript: true,
              value: statements.join("\n")
            };
          }
        }
        return "null";
      }
    }

    return "null";
  };

  const esm = [];
  const statements = [];

  markdownAST.children.forEach((node) => {
    switch (node.type) {
      case "mdxjsEsm":
        esm.push(node.value);
        break;

      default: {
        const transformed = transformNode(node);

        if (transformed && transformed.isScript) {
          statements.push(transformed.value);
        } else {
          statements.push(`__items__.push(${transformed})`);
        }
      }
    }
  });

  return { Tags, esm, statements, UsesCreateElement };
};