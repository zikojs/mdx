const stringifyProps = (props) =>{
    return props
            ?`{${Object.entries(props).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join(", ")}}={}`
            :""
}

export {stringifyProps}