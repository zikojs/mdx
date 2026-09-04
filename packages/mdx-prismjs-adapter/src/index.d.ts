interface PrismAdapter {
  /**
   * Highlights a code string using PrismJS.
   *
   * @param code - Source code to highlight.
   * @param language - Optional language identifier.
   * @returns Highlighted HTML.
   */
  highlight(code: string, language?: string): string;
}

declare const prismAdapter: PrismAdapter;

export default prismAdapter;