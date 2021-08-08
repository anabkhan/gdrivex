const request = require('request');
const { Messages } = require('../constants/Messages');
const { CommonUtil } = require('./commonutil');
const { GDriveXService } = require('./gdrivex');
const { Stream } = require('stream');
const { GDriveService } = require('./gdrive');

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
                        schema.uploadTask.clustors.every((clustor, index) => {
                            size = size + clustor.fileSize;
                            handleFileUploadForClustor(url, clustor, offset, size, info)
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
            if (disposition && disposition.includes('filename=')) {
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

/*function handleFileUploadForClustor(url, clustor, offset, size, file) {

    const chunkSize = 1000000;
    var numberofChunks = Math.ceil(size / chunkSize);

    var chunkStart = offset;
    var chunkEnd = Math.min(offset + chunkSize, size);

    var readStream = new Stream.Readable({
        read() {}
    });

    const data = new Stream.PassThrough();

    // readStream.on('data', (data) => {
    //     console.log('data recieved')
    // })

    const writableStream = new Stream.Writable()

    writableStream._write = (chunk, encoding, next) => {
        // console.log(chunk.toString())
        data.push(chunk)
        next()
    }

    readStream.pipe(data)

    GDriveXService.uploadFile(data, (output) => {
        console.log(output)
    }, (error) => {
        console.log(error)
    })

    for (let index = 0; index < numberofChunks; index++) {
        request({
            headers: {
                'Content-Length': chunkEnd,
                Range: `bytes=${chunkStart}-${chunkEnd}`
            },
            uri: url,
            method: 'GET'
        }, function (err, res, body) {
            if (index >= numberofChunks) {
                writableStream.end()
            }
            // console.log('res', res)
            // console.log('body', body)
            // console.log('err', err)
        })
        // .on('data', (buffer) => {
        //     data.push(buffer)
        // })
        .pipe(readStream)

        chunkStart = chunkEnd+1;
        chunkEnd = Math.min(chunkSize + chunkEnd, size);
    }
}*/


function handleFileUploadForClustor(url, clustor, offset, size, file) {

    const fileNameKey = CommonUtil.generateKeyForFileName(file.name);

    // const chunkSize = 1000000;
    // var numberofChunks = Math.ceil(size / chunkSize);

    // var chunkStart = offset;
    // var chunkEnd = Math.min(offset + chunkSize, size);

    GDriveXService.getResumableSessionURI(clustor, {
        name: file.name,
        mimeType: file.mimeType ? file.mimeType : 'application/octet-stream',
        size:size
    }, (error) => {
        // What to do with this error?
        // Update the updaoad task clustor status as failed?
        console.error(error)
    }, (resumableUri) => {
        // Update uploadTask clustor with resumable URI
        clustor.resumableUri = resumableUri;
        GDriveXService.updateClustorOfUploadTask(fileNameKey, clustor);
        GDriveXService.getFileResumeStatus(resumableUri, (response) => {
            // console.log(response)
            let nextOffset = 0;
            switch (response.statusCode) {
                case 200:
                    // File is uploaded already
                    // Mark the clustor of the upload task as done
                    clustor.done = true;
                    GDriveXService.updateClustorOfUploadTask(fileNameKey, clustor)
                    break;

                case 308:
                    // File has to be resumed
                    const range = response.headers.range;
                    if (range) {
                        const positions = range.replace(/bytes=/, "").split("-");
                        nextOffset = positions[1] ? parseInt(positions[1], 10) + 1 : 0;
                    }
                    break;
                default:
                    break;
            }

            // GDriveXService.uploadOrResumeFile(resumableUri, nextOffset, size, null, clustor.drive, (error)=> {
            //     console.error(error)
            // }, (response) => {
            //     // File successfully uploaded
            //     console.log(response)
            // })

            request({
                headers: {
                    'Content-Length': size,
                    Range: `bytes=${offset + nextOffset}-${size-1}`
                },
                uri: url,
                method: 'GET',
                encoding: null
            }, (error, response, body) => {
                if (error && response.statusCode != 200) {
                    reject(error);
                    return;
                }
                //   resolve(body);
                const fileDataStream = new Stream.PassThrough();
                fileDataStream.end(body)
                GDriveXService.uploadOrResumeFile(resumableUri, nextOffset, size, body, clustor.drive, (error)=> {
                    console.error(error)
                }, (response) => {
                    // File successfully uploaded
                    console.log(response)
                })

            })
            //.pipe(fileDataStream)

        } , null);
    })

    // request({
    //     headers: {
    //         'Content-Length': size,
    //         Range: `bytes=${offset}-${size-1}`
    //     },
    //     uri: url,
    //     method: 'GET'
    // }).pipe(fileDataStream)

    // chunkStart = chunkEnd+1;
    // chunkEnd = Math.min(chunkSize + chunkEnd, size);
}
