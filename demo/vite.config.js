import { defineConfig } from "vite";
import MDX from "@zikojs/vite-plugin-mdx"
import syntaxHighlightAdapter from '@zikojs/mdx-highlightjs-adapter'
import MindElixir from '@zikojs/remark-plugin-mind-elixir'
export default defineConfig({
    plugins : [
        MDX({
            syntaxHighlightAdapter,
            marker: '.ziko',
            include : ['**/articles/*'],
            plugins:[
                MindElixir
            ]
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