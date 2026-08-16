import { defineConfig } from "vite";
// import { MDZ } from "../src/vite/index.js";
// import ViteMDZ  from "../src/bundlers/vite.js"
import ViteMDZ from "@zikojs/mdx/vite"

export default defineConfig({
    plugins : [ViteMDZ()]
})