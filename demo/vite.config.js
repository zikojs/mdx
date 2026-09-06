import { defineConfig } from "vite";
import MDX from "@zikojs/vite-plugin-mdx"
import syntaxHighlightAdapter from '@zikojs/mdx-highlightjs-adapter'

export default defineConfig({
    plugins : [
        MDX({
            syntaxHighlightAdapter,
            marker: '.ziko',
            include : ['**/articles/*']
        })
    ]
})

// server.ws.send({
//   type: "custom",
//   event: "custom-update",
//   data: {
//     file,
//     timestamp: Date.now(),
//   },
// });