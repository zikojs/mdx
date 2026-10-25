import { tags } from "ziko/dom";
export default ({data,color})=>{
    return tags.p(data).style({
        color : color
    })
}