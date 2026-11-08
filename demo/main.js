import {tags} from 'ziko/dom'
import UI from './articles/test.ziko.mdx'

// import hljs from "highlight.js"
import 'highlight.js/styles/github.css';
// hljs.highlightAll()

globalThis.items = UI({name : "from MDZjs"})

const App = tags.section(...items)

App.mount(document.body)

