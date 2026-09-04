import {tags} from 'ziko/dom'
import UI from './ziko/test.ziko.mdx'
import { ScrollArea } from 'zextra/containers'

// import hljs from "highlight.js"
import 'highlight.js/styles/github.css';
// hljs.highlightAll()

globalThis.items = UI({name : "from MDZjs"})

globalThis.App = ScrollArea({}, ...items).style({
    border : '1px darkblue solid',
    padding : '16px',
    height : '100vh'
})



App.mount(document.body)
