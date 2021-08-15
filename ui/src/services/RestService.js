import { BASE_URL } from "../constants/REST_URLS"

export const get = (url) => {
    return fetch(BASE_URL + url).then((response) => response.json());
}

export const _delete = (url) => {
    return fetch(BASE_URL + url, {
        method: 'delete'
    })
    .then((response) => response.json());
}

export const post = (url, body) => {
    return fetch(BASE_URL + url, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((response) => response.json());
}