import Prism from "prismjs";

const prismAdapter = {
  highlight(code, language) {
    const grammar = Prism.languages[language];

    if (!grammar) {
      return Prism.util.encode(code);
    }

    return Prism.highlight(
      code,
      grammar,
      language
    );
  }
};

export default prismAdapter