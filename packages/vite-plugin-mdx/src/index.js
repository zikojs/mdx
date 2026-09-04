import { transpileMD } from "@zikojs/mdx";

export default function ViteMDX({
  plugins,
  syntaxHighlightAdapter = null,
  marker = ''
} = {}) {
  const extensions = [".mdx", ".md"];

  const isMarkdownFile = (id) =>
    extensions.some((ext) =>
      marker
        ? id.endsWith(`${marker}${ext}`)
        : id.endsWith(ext)
    );

  return {
    name: "@zikojs/vite-plugin-mdx",

    async transform(src, id) {
      if (!isMarkdownFile(id)) return;

      const code = await transpileMD(src, {
        plugins,
        syntaxHighlightAdapter
      });

      return {
        code,
        map: null
      };
    },

    handleHotUpdate({ file, server }) {
      if (!isMarkdownFile(file)) return;

      server.ws.send({
        type: "full-reload"
      });

      // server.ws.send({
      //   type: "custom",
      //   event: "custom-update",
      //   data: {
      //     file,
      //     timestamp: Date.now(),
      //   },
      // });

      return [file];
    }
  };
}