export const componentType = tag => {
    if(tag === "script") return "script";
    if(tag.toLowerCase() !== tag || tag.includes(".")) return "jsx";
    return "html"
}