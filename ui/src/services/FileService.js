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

export const getReadableFileSizeString = (fileSizeInBytes) => {
    let i = -1;
    const byteUnits = ['kB', 'MB', 'GB', 'TB']
    do {
        fileSizeInBytes= fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);
    
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

function createUploadTask(schema) {
    
}