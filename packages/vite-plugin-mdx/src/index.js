import { transpileMD } from "@zikojs/mdx";

export default function ViteMDX({ extensions = [".mdx"], plugins } = {}) {
  return {
    name: "@zikojs/mdx-loader",
    async transform(src, id) {
      if (id.endsWith(".mdz") || extensions.some((ext) => id.endsWith(ext))) {
        const code = await transpileMD(src, {plugins});
        return {
          code,
          map: null,
        };
      }
    },

    handleHotUpdate({ file, server }) {
      if (file.endsWith(".mdx")) {
        console.log({file})
        server.ws.send({
          type : 'full-reload'
        })
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
    },
  };
}
