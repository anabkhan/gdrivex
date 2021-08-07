import { GET_SCHEMA } from "../constants/REST_URLS"
import { post } from "./RestService"

export const uploadFile = (file) => {
    getSchema(file).then(schema => {
        console.log('schema', schema);
    }).catch(error => {
        console.error(error);
    })
}

/**
 * Get the schema which will have info like
 * parts to divide file in
 * and drives to upload
 */
function getSchema(file) {
    return post(GET_SCHEMA, {
        name: file.name,
        size: file.size
    })
}