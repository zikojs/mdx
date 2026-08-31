import {HtmlToZikoJsIR} from './html-to-ziko-ir/index.js'


// const v = HtmlToZikoJsIR(`
// <style>
// </style>
// <script>
//   const a = "world";
// </script>
// <div class="card">
//   <h1>Hello {a}</h1>
//   <p>World</p>
// </div> 
// <script>
//   const b = "world";
// </script>   
// `)

const Alpine = `
<script>
 const isOpen = true
</script>
<div x-data="{ open: {isOpen} }">
    <button @click="open = true">Expand</button>
 
    <span x-show="open">
        Content...
    </span>
</div>
`

const z = HtmlToZikoJsIR(Alpine)
// console.log(v)
console.log(z)