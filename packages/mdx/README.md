# MDZjs

[![mdzjs banner](https://raw.githubusercontent.com/zikojs/.github/main/assets/banners/mdzjs.svg)](https://github.com/zikojs)

A Markdown preprocessor for Zikojs.
It combines the simplicity of Markdown syntax with the power and flexibility of ***Javascript***

## Install 
```bash
 npm i mdzjs
```
 
## Config 
```js
import {defineConfig} from "vite"
import MDZ from "mdzjs/vite"
export default defineConfig({
    plugins : [
        MDZ()
    ]
})
```

## Usage

*Article.mdz :*

```jsx
---
 title : MDZ 
 name : world
 MDZ.Props : 
   background : tomato
   data : []
---
import data from "./data.js";
import InteractiveComponent from "./InteractiveComponent.js";

# Hello {name}

<InteractiveComponent data={data} background={tomato}/>

```

```js
// main.js
import Article,{title} from "./Article.mdz"
```

## Features
- **Simple Integration :** Write Markdown as usual, and inject Zikojs elements wherever needed.
- **Extensible :** Create custom interactive components using Zikojs and use them in any Markdown file.
- **Reusable :** MDZ exports a default functional component, allowing you to call it multiple times with different data, enabling dynamic and versatile use.
- **Frontmatter Support :**  Use `YAML` syntax in to include metadata like titles, descriptions, or configurations in your Markdown files, and define props to pass data dynamically to Zikojs components.

- **Markdown :** Use standard Markdown syntax for writing content. 
- **JSX Syntax :** Write components in JSX within Markdown, enabling easy integration of Zikojs elements with JavaScript and HTML..
- **Props :** Pass data to components through props, enabling dynamic rendering and customization of content within your Markdown files.
- **ESM :** Supports ECMAScript Modules (ESM), allowing you to import and export modules
- **Expressions :** MDZjs lets you use JS expressions inside curly braces, like Hello {name}. 
These expressions can be full JS programs, as long as they evaluate to something renderable. For example, you can use an IIFE like this:
```js
Hello {(()=>{
    const names = ["world", "everyone"];
    const {length} = names
    return names[Math.floor(Math.random()*length)]
})()}
```
- **Internal scripts :**  Include JS logic that runs alongside MDZjs components but isn't rendered in the output. 
They can initialize variables or perform side effects...

```html
<script>
    console.log("Hello from MDZjs")
    let addons = [
        "ziko-gl",
        "ziko-lottie",
        "ziko-chart"
    ]
// The addons variable can be accessed and used in MDZjs expressions 
</script>
```
- **Interleaving :** You can use inline markdown elements inside HTML or Zikojs Components

```html
<Header background={background}>
 ***Hello {name}***
</Header>
```
# ⭐️ Show your support

If you appreciate the project, kindly demonstrate your support by giving it a star!<br>

[![Star](https://img.shields.io/github/stars/zakarialaoui10/mdzjs?style=social)](https://github.com/zakarialaoui10/mdzjs)
<!--## Financial support-->
# License 
This projet is licensed under the terms of MIT License 
<img src="https://img.shields.io/github/license/zakarialaoui10/mdzjs?color=rgb%2820%2C21%2C169%29" width="100" align="right" />

<!-- 
 To do 
   : fix fm
   : add possibility of adding plugins 
   : add zod
   : auto typing 
   : react Interleaving 
-->