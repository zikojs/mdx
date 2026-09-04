interface HighlightJsAdapter {
  /**
   * Highlights a code string using Highlight.js.
   *
   * @param code - Source code to highlight.
   * @param language - Optional language identifier.
   * @returns Highlighted HTML.
   */
  highlight(code: string, language?: string): string;
}

declare const highlightJsAdapter: HighlightJsAdapter;

export default highlightJsAdapter;