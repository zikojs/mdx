import path from "node:path";
import { createFilter } from "vite";
import { transpileMD } from "@zikojs/mdx";

export default function ViteMDX({
  plugins,
  syntaxHighlightAdapter = null,
  marker = "",
  include = ["**/*"],
  exclude,
} = {}) {
  const extensions = [".mdx", ".md"];
  let includeFilter;
  let root;
  const cleanId = (id) => id.replace(/\\/g, "/").split("?")[0].split("#")[0];
  const isMarkdownFile = (id) => {
    const clean = cleanId(id);
    if (!includeFilter(clean)) return false;
    return extensions.some((ext) =>
      marker
        ? clean.endsWith(`${marker}${ext}`)
        : clean.endsWith(ext)
    );
  };
  return {
    name: "@zikojs/vite-plugin-mdx",
    configResolved(config) {
      root = path.resolve(config.root).replace(/\\/g, "/");
      includeFilter = createFilter(include, exclude, { resolve: root });
    },
    async transform(src, id) {
      if (!isMarkdownFile(id)) return;
      const code = await transpileMD(src, {
        plugins,
        syntaxHighlightAdapter,
      });
      return {
        code,
        map: null,
      };
    },
    handleHotUpdate({ file, server }) {
      if (!isMarkdownFile(file)) return;
      server.ws.send({
        type: "full-reload",
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
    },
  };
}