export const transformeAttrs = attrs => {
    const HasAttributs = Object.keys(attrs).length > 0
    return HasAttributs 
        ? [
            `const {${Object.keys(attrs).join(",")}} = ${JSON.stringify(attrs,"",2)}`,
            `export {${Object.keys(attrs).join(", ")}}`
        ].join("\n")
        : ''

}