export const processAttribute = (attributes) =>{
    if(attributes.length === 0) return "{}"
    let attr = []
    for(let i=0; i<attributes.length ; i++){
        let {name, value} = attributes[i]
        attr.push({
            name,
            value : typeof value === "string" ? value : value.value,
            isExpression : typeof value !== "string"
        })
    }
    return `{${attr.map(({name, value, isExpression})=>`${name}:${isExpression ? value : `"${value}"`}`).join(", ")}}` 
}