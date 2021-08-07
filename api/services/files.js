const request = require('request');
const { Messages } = require('../constants/Messages');
const { CommonUtil } = require('./commonutil');
const { GDriveXService } = require('./gdrivex');
const { Stream } = require('stream');

module.exports.FileService = {
    downloadFromURL: (url, fileName,  onError) => {
        getFileInfoFromURL(url, (info) => {
            if (fileName) {
                info.name = fileName;
            }
            GDriveXService.getOrGenerateSchema(info, (schema) => {
                if (schema.uploadTask.done) {
                    // Task is done, ask to rename and upload file
                    onError(CommonUtil.createFailureMessage(Messages.FILE_DONE_EXISTS))
                } else {
                    // Task is not completed
                    if (schema.uploadTask.failed) {
                        // File Download was failed or aborted, ask to resume or overwrite
                        onError(CommonUtil.createFailureMessage(Messages.FILE_FAILED_EXISTS))
                    } else {
                        let offset = 0, size = 0;
                        schema.uploadTask.clustors.forEach(clustor => {
                            size = size + clustor.fileSize;
                            handleFileUploadForClustor(url, clustor, offset, size)
                            offset = offset + clustor.fileSize + 1;
                        });
                    }
                }
            }, onError);
        }, onError)
    },

    downloadFromTorrent: (magnet) => {

    }
}

function getFileInfoFromURL(url, onData, onError) {
    const r = request(url);
        r.on('response', response => {
            const size = response.headers['content-length'];
            const disposition = response.headers['Content-Disposition'];
            r.abort();
            let name;
            if (disposition.includes('filename=')) {
                fileName = disposition.split('filename=')[1].split('"')[0];
            } else {
                const indexOfQ = url.indexOf("?");
                if (indexOfQ && indexOfQ > 0) {
                    url.substr(url.lastIndexOf("/")+1, indexOfQ);
                } else {
                    url.substr(url.lastIndexOf("/")+1, indexOfQ);
                }
            }
            onData({
                size,name
            })
        });
        r.on('error', error=>onError(error))
}

function handleFileUploadForClustor(url, clustor, offset, size) {
    const chunkSize = 1000000;
    var numberofChunks = Math.ceil(size / chunkSize);

    var chunkStart = offset;
    var chunkEnd = Math.min(offset + chunkSize, size);


    var readStream = new Stream.Readable({
        read() {
            request({
                headers: {
                    'Content-Length': chunkEnd,
                    Range: `bytes=${chunkStart}-${chunkEnd}`
                },
                uri: url,
                method: 'GET'
            }, function (err, res, body) {
                console.log('res', res)
                console.log('body', body)
                console.log('err', err)
            });
        }
    })
}