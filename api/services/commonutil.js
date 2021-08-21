const fs = require('fs');
module.exports.CommonUtil = {
    getReadableFileSizeString: (fileSizeInBytes) => {
        let i = -1;
        const byteUnits = ['kB', 'MB', 'GB', 'TB']
        do {
            fileSizeInBytes= fileSizeInBytes / 1024;
            i++;
        } while (fileSizeInBytes > 1024);
        
        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    },

    createSuccessMessage: (data, message) => {
        return {
            status:'Success',
            message,
            data
        }
    },

    createFailureMessage: (message) => {
        return {
            status:'Fail',
            message
        }
    },

    generateKeyForFileName: (fileName) => {
        return fileName.split('.').join('-*-').split('[').join('').split(']').join('')
    },

    getCredentials: (onSuccess) => {
        fs.readFile('credentials.json', (err, content) => {
            onSuccess(JSON.parse(content))
        });
    }
}