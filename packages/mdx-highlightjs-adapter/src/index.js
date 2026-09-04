import hljs from "highlight.js"

const highlightJsAdapter = {
  highlight(code, language) {
    if (language) {
      return hljs.highlight(code, {
        language
      }).value;
    }
    return hljs.highlightAuto(code).value;
  }
};

export default highlightJsAdapter