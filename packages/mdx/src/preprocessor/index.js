import { 
  componentType,
  processAttribute,
  hyperscript
} from "../utils/index.js"
import hljs from "highlight.js"
export const processMDAST = (markdownAST) => {
    let hasCode = false;
    let Tags = new Set()
    const transformNode = (node) => {
      switch(node.type){
        case 'mdxjsEsm' : {
          return {
            type : "script",
            value : node.value
          }
        }
        case 'text' : {
          const text = node.value;
          const escaped = text.replace(/"/g, '\\"');
          return `"${escaped}"`;
        }
        case 'mdxTextExpression' : {
          const {value} = node
          return value
        }
        case 'mdxFlowExpression' : {
          const {value} = node;
          if(!node.parent || node.parent.type === 'root') 
            return hyperscript("p", "{}", value);
          return value
        }
        case 'heading' : {
          const childNodes = node.children.map(transformNode).join(', ');
          const tag = `h${node.depth}`
          Tags.add(tag);
          return hyperscript(tag,"{}", childNodes);
        }
        case 'paragraph' : {
          const childNodes = node.children.map(transformNode).join(', ');
          Tags.add('p');
          return hyperscript("p","{}", childNodes)
        }
        case 'strong': {
          const childNodes = node.children.map(transformNode).join(', ');
          Tags.add('strong');
          return hyperscript("strong","{}", childNodes);
        }
        case 'emphasis': {
          const childNodes = node.children.map(transformNode).join(', ');
          Tags.add('em');
          return hyperscript("em","{}", childNodes);
        }
        case 'link': {
          const childNodes = node.children.map(transformNode).join(', ');
          Tags.add('a');
          return hyperscript("a", `{ href: "${node.url}" }`, childNodes);
        }
        case 'image': {
          hyperscript("img", `{ src: "${node.url}", alt: "${node.alt || ''}`);
          Tags.add('img');
          return `tags.img({ src: "${node.url}", alt: "${node.alt || ''}" })`;
        }
  
        case 'list': {
          const listTag = node.ordered ? 'ol' : 'ul';
          Tags.add(listTag);
          const childNodes = node.children.map(transformNode).join(', ');
          return hyperscript(listTag, "{}", childNodes);
        }
  
        case 'listItem': {
          const childNodes = node.children.map(transformNode).join(', ');
          Tags.add('li');
          return hyperscript("li", "{}", childNodes);
        }
        case 'inlineCode' : {
          Tags.add('code');
          return hyperscript("code", "{}", `"${node.value}"`)
        }
        case 'code': {
          hasCode = true;
          const highlightedCode = hljs.highlightAuto(node.value, [node.lang || '']).value;
          const formatedCode = highlightedCode.replace(/(\r\n|\n|\r)/g, "<br>");   
          return `HTMLWrapper('<pre><code>${formatedCode}</code></pre>')`
        }
        case 'blockquote': {
          const childNodes = node.children.map(transformNode).join(', ');
          Tags.add('blockquote');
          return hyperscript("blockquote", "{}", childNodes);
        }
        case 'thematicBreak': {
          Tags.add('hr');
          return `hr({})`;
        }
        case 'table': {
          const headerRows = node.children[0].children.map(transformNode).join(', ');
          const bodyRows = node.children.slice(1).map(transformNode).join(', ');
          const thead = hyperscript("thead", "{}", hyperscript("tr", "{}", headerRows));
          const tbody = hyperscript("tbody", "{}", bodyRows);
          Tags.add('table').add('thead').add('tbody').add('tr')
          return hyperscript("table", "{}", [thead, tbody].join(","))
        }
        case 'tableRow': {
          const cells = node.children.map(transformNode).join(', ');
          Tags.add('tr');
          return `${hyperscript("tr", "{}", cells)}`
        }
        case 'tableCell': {
          const childNodes = node.children.map(transformNode).join(', ');
          Tags.add('td');
          return `${hyperscript("td", "{}", childNodes)}`
        }
        case 'mdxJsxTextElement': {
          const {name, attributes, children} = node;
          const childNodes = children.map(transformNode).join(', ');
          const hasChildren = childNodes.length > 0;
          return `tags.${name}(${processAttribute(attributes)}${hasChildren ?`, ${childNodes}`:""})`;
        };
        case 'mdxJsxFlowElement':{
          const {name, attributes, children} = node;
          const childNodes = children.map(transformNode).join(', ');
          const hasChildren = childNodes.length > 0;
          switch(componentType(name)){
            case "jsx" : {
              return `${name}(${processAttribute(attributes)}${hasChildren ?`, ${childNodes}`:""})`;
            }
            case "html" : {
              Tags.add(name);
              return `tags.${name}(${processAttribute(attributes)}${hasChildren ?`, ${childNodes}`:""})`;
            }
            case "script" : {
              const statements = [];
              for(let i=0; i<node.children.length; i++) statements.push(node.children[i].children[0].value)
              return {
                type : "script",
                isScript : true,
                value : statements.join("\n")
              }
            }
          }
        }
      }
      return 'null';
    };
    let esm = [];
    const statements = []
    markdownAST.children.forEach((node) => {
      switch(node.type){
        case 'mdxjsEsm' : esm.push(node.value); break;
        default : {
          const Transformed = transformNode(node);
          if(Transformed.isScript) statements.push(Transformed.value);
          else statements.push(`__items__.push(${Transformed})`)
        }
      }
    });
    return {
      Tags,
      esm,
      statements,
      hasCode
    }
  };