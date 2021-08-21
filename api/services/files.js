const request = require('request');
const { Messages } = require('../constants/Messages');
const { CommonUtil } = require('./commonutil');
const { GDriveXService } = require('./gdrivex');
const { Stream } = require('stream');
const { GDriveService } = require('./gdrive');
const { getData, deleteData } = require('./fireabse');
const { dbPaths } = require('../constants/FIREBASE_DB_PATHS');

let fileUploadStatus = {
    'delicate.mp3': {
        size: 9398144,
        downloaded: 5398144
    }
};

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
                        let index = 0;
                        fileUploadStatus[schema.file.name] = {
                            total: info.size,
                            downloaded: 0
                        };
                        schema.uploadTask.clustors.forEach(clustor => {
                            size = size + clustor.fileSize;
                            handleFileUploadForClustor(url, clustor, offset, size, info)
                            offset = offset + clustor.fileSize;
                            index++;
                        });
                    }
                }
            }, onError);
        }, onError)
    },

    downloadFromTorrent: (magnet) => {

    },

    downloadFile: (fileName, req, res, onError) => {
        getFileSchemaFromName(fileName, (fileSchema) => {

            
            const range = req.headers.range;
            const total = fileSchema.file.size;
            
            var positions = (range? range : 'bytes=0-').replace(/bytes=/, "").split("-");
            var start = parseInt(positions[0], 10);
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;
            
            // res.send('done2')
            
            res.writeHead(range ? 206 : 200, {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                // "Content-Type": "video/" + fileName.split('.').pop(),
                "Content-Disposition": "attachment; filename="+fileName
            });
            
            const readableStream = new Stream.Readable({
                read() {}
            })

            readableStream.pipe(res);
            // res.send('download started')

            startDownloadForClustor(readableStream, req, res, fileSchema, start, chunksize, 0, onError);
        }, onError)
    },

    listFiles: (start, size, onSuccess, onError) => {
        getData(dbPaths.files(), onSuccess, onError)
    },

    deleteFile: (name, onSuccess, onError) => {
        getFileSchemaFromName(name, (schema) => {
            // delete file from clusor drive
            if (schema && schema.clustors) {
                schema.clustors.forEach(clustor => {
                    GDriveXService.getDriveObject(clustor.drive, (drive) => {
                        drive.files.delete({
                            fileId: clustor.fileID,
                          }, (err, res) => {
                              if (err) {
                                //   onError(err)
                                console.log('File clustor deletion failed',err)
                              } else {
                                //   onSuccess(res)
                                console.log('File clustor deleted')
                              }
                          })
                    });
                });
            }

            onSuccess("File deletion started")

            // delete schema from DB
            deleteData(dbPaths.fileSchema(CommonUtil.generateKeyForFileName(name)));
            deleteData(dbPaths.uploadTask(CommonUtil.generateKeyForFileName(name)))
        }, onError);
    },

    getUploadStatus: () => {
        return fileUploadStatus;
    }
}

function getFileSchemaFromName(fileName, onFileSchema, onError) {
    getData(dbPaths.fileSchema(CommonUtil.generateKeyForFileName(fileName)), (schema) => {
        onFileSchema(schema)
    }, onError);
}

function startDownloadForClustor(readableStream, req, res, fileSchema, start, chunksize, clustorIndex, onError) {
    let writableStream = new Stream.Writable()
    writableStream._write = (chunk, encoding, next) => {
        readableStream.push(chunk, encoding)
        next()
    }

    req.on("close", function() {
        console.log('request closed by client');
        readableStream.destroy();
        writableStream.destroy();
    });


    // let clustorindex = 0;
    const progress = startDownloadingFromClustor(fileSchema.clustors, clustorIndex, start, chunksize, writableStream, onError);
    let clustorindex = progress.clustorindex;
    chunksize = progress.chunksize;
    start = start + (chunksize - 1);
    writableStream.on('finish', () => {
        console.log('writing finishedf for clustor ' + clustorindex);
        clustorindex++;
        if (clustorindex < fileSchema.clustors.length && chunksize > 0) {
            // download from next clustor
            startDownloadForClustor(readableStream, req, res, fileSchema, 0, chunksize, clustorindex, onError)
        } else {
            res.end();
        }
    })
}

function startDownloadingFromClustor(clustors, clustorindex, offset, chunksize, writableStream, onError) {
    const clustor = clustors[clustorindex];
    if (clustor.completed) {
        const fileId = clustor.fileID;
        if (offset < (clustor.fileSize - 1)) {
            // let chunkSizeToDownload = chunksize > clustor.fileSize ? clustor.fileSize : chunksize;
            let end = (chunksize - 1) + offset;
            // end = end > (clustor.fileSize - 1) ? (clustor.fileSize - 1) : end;
            if (end > (clustor.fileSize - 1)) {
                chunksize = end - (clustor.fileSize - 1);
                end = (clustor.fileSize - 1);
            } else {
                chunksize = 0;
            }
            GDriveXService.getDriveObject(clustor.drive, (drive) => {
                drive.files.get(
                    { fileId: fileId, alt: 'media', headers: { "Range": `bytes=${offset}-${end}` } },
                    { responseType: 'stream', },
                    (err, result) => {
                        if (err) {
                            onError(err)
                        } else {
                            result.data.pipe(writableStream)
                        }
                    }
                    );
                });
                return {clustorindex,chunksize};
            } else {
            offset = offset - clustor.fileSize;
            return startDownloadingFromClustor(clustors, clustorindex + 1, offset, chunksize, writableStream, onError)
        }
    } else {
        onError("File was not uploaded properly. Resume it from the upload task")
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
                name = disposition.split('filename=')[1].split('"')[0];
            } else {
                let indexOfQ = url.indexOf("?");
                // indexOfQ = indexOfQ && (indexOfQ > 0) ? indexOfQ : url.length - 1;
                if (indexOfQ && indexOfQ > 0) {
                    url = url.split('?')[0]
                }
                name = url.substr(url.lastIndexOf("/")+1, url.length - 1);
            }
            onData({
                size,name
            })
        });
        r.on('error', error=>onError(error))
}

function handleFileUploadForClustor(url, clustor, offset, size, file) {

    console.log('starting uplaod of clustor',clustor)

    const fileNameKey = CommonUtil.generateKeyForFileName(file.name);

    // const chunkSize = 1000000;
    // var numberofChunks = Math.ceil(size / chunkSize);

    // var chunkStart = offset;
    // var chunkEnd = Math.min(offset + chunkSize, size);

    GDriveXService.getResumableSessionURI(clustor, {
        name: file.name,
        mimeType: file.mimeType ? file.mimeType : 'application/octet-stream',
        size:clustor.fileSize
    }, (error) => {
        // What to do with this error?
        // Update the updaoad task clustor status as failed?
        console.error(error)
    }, (resumableUri) => {
        // Update uploadTask clustor with resumable URI
        clustor.resumableUri = resumableUri;
        GDriveXService.updateClustorOfUploadTask(fileNameKey, clustor);
        GDriveXService.getFileResumeStatus(clustor.drive, resumableUri, (response) => {
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

            const fileDataStream = new Stream.PassThrough();
            request({
                headers: {
                    // 'Content-Length': size,
                    Range: `bytes=${offset + nextOffset}-${size-1}`
                },
                uri: url,
                method: 'GET',
                encoding: null
            }).pipe(fileDataStream).on('error', (error) => {
                console.log('Error while downloading file from url',error)
                // clustor.completed = true;
                // GDriveXService.updateClustorOfUploadTask(fileNameKey, clustor)
            })

            fileDataStream.on('data', (data) => {
                // console.log(data)
                // update status
                fileUploadStatus[file.name].downloaded = fileUploadStatus[file.name].downloaded + data.length
            })

            clustor.started = true;
            GDriveXService.updateClustorOfUploadTask(fileNameKey, clustor)

            GDriveXService.uploadOrResumeFile(resumableUri, nextOffset, clustor.fileSize, fileDataStream, clustor.drive, (error)=> {
                console.error(error)
            }, (response) => {
                try {
                    response = JSON.parse(response);
                    if (response && response.id) {
                        // File successfully uploaded
                        // Update the uploadTask
                        console.log('Clustor upload finished',response);
                        clustor.completed = true;
                        GDriveXService.updateClustorOfUploadTask(fileNameKey, clustor)
                        console.log(response)
                        clustor.fileID = response.id;
                        GDriveXService.updateClustorOfSchema(fileNameKey, clustor)
                        if (fileUploadStatus[file.name].downloaded >= fileUploadStatus[file.name].size) {
                            delete fileUploadStatus[file.name];
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            })

        } , null);
    })
    // chunkStart = chunkEnd+1;
    // chunkEnd = Math.min(chunkSize + chunkEnd, size);
}
