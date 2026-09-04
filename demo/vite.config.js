import { defineConfig } from "vite";
// import { MDZ } from "../src/vite/index.js";
// import ViteMDZ  from "../src/bundlers/vite.js"
import MDX from "@zikojs/vite-plugin-mdx"

export default defineConfig({
    plugins : [MDX()]
})