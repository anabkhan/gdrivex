const request = require("request")
const { dbPaths } = require("../constants/FIREBASE_DB_PATHS")
const { Messages } = require("../constants/Messages")
const { CommonUtil } = require("./commonutil")
const { getData, updateDB } = require("./fireabse")
const { GDriveService } = require("./gdrive")
const fs = require('fs');
const { UserService } = require("./users")
const {google} = require('googleapis');
var mime = require('mime-types')

module.exports.GDriveXService = {

    /**
     * Check the file size
     * Get the drive list
     * Create a table which maps file-part to drive
     * Upload the file parts based on table
     * Save the table in the DB
     */

    /**
     * Upload the files disributed on listed user drives
     * @param {*} fileStream 
     * @param {*} onOutput 
     * @param {*} onError 
     */

    uploadFile: (fileStream, onOutput, onError) => {
        GDriveService.uploadFile('akanabkhan', fileStream, {
            name: 'Delicate.mp3',
            mimeType: 'audio/mp3'
        }, onOutput, onError)
    },

    /**
     * List drives linked to user account
     * @param {*} onDrives 
     * @param {*} onError 
     */
    listDrive: (onDrive, onError) => {
        getData(dbPaths.drives(), onDrive, onError)
    },

    /**
     * List drives linked to user account as array in descending order of available space
     * @param {*} onDriveArray 
     * @param {*} onError 
     */
    listDrivesAsArray: (onDriveArray, onError) => {
        getData(dbPaths.drives(), (response) => {
            const keys = Object.keys(response);

            const drives = [];
            keys.forEach(key => {

                // refresh the storage
                getDriveObject(key, (drive) => {
                    drive.about.get({ fields: "user,storageQuota" }).then(data => {
                        const driveAbout = data.data;
                        driveAbout.storageQuota.usageInGB = CommonUtil.getReadableFileSizeString(driveAbout.storageQuota.usage);
                        driveAbout.storageQuota.totalInGB = CommonUtil.getReadableFileSizeString(driveAbout.storageQuota.limit);
                        // driveAbout.user.token = token;
                        updateDB('users' + '/akanabkhan' + '/drives/' + driveAbout.user.emailAddress.split('@')[0], 'storageQuota', driveAbout.storageQuota)
                        
                        const eachDrive = driveAbout;
                        const availableSizeEachDrive = eachDrive.storageQuota.limit - eachDrive.storageQuota.usage;
                        const driveToPush = {
                            email: eachDrive.user.emailAddress,
                            availableSpace: availableSizeEachDrive,
                            ...eachDrive.storageQuota
                        }
                        if (drives.length === 0) {
                            drives.push(driveToPush)
                            if (drives.length === keys.length) {
                                onDriveArray(drives);
                            }
                        } else {
                            // let index = 0;
                            drives.every((existingDrive, index) => {
                                const availableSizeExistingDrive = existingDrive.limit - existingDrive.usage;
                                if (availableSizeEachDrive > availableSizeExistingDrive) {
                                    drives.splice(index - 1, 0, driveToPush);
                                    if (drives.length === keys.length) {
                                        onDriveArray(drives);
                                    }
                                    return false;
                                } else if (index === drives.length - 1) {
                                    drives.push(driveToPush)
                                }
                                if (drives.length === keys.length) {
                                    onDriveArray(drives);
                                }
                                return true;
                                // index++;
                            });
                        }
                    })
                    }, onError)


            });
            // onDriveArray(drives);
        }, onError)
    },

    /**
     * Checks if schema exists for a file, returns the existing
     * Or create a new schema and return the newly created one
     * @param {*} onSchema 
     * @param {*} onError 
     */
    getOrGenerateSchema: (file, onSchema, onError) => {
        const fileNameKey = CommonUtil.generateKeyForFileName(file.name);
        getData(dbPaths.fileSchema(fileNameKey), (schema) => {
            getData(dbPaths.uploadTask(fileNameKey), (uploadTask) => {
                schema = {...schema, uploadTask}
                onSchema(schema)
            }, (error) => {
                // create an upload task for the file
                let uploadTask = {
                    done: false,
                    failed: false,
                    clustors: []
                }
                schema.clustors.forEach(eachClustor => {
                    let clustor = {
                        started: false,
                        completed: false,
                        lastChunk: null,
                        ...eachClustor
                    }
                    uploadTask.clustors.push(clustor);
                });
                updateDB(dbPaths.uploadTasks(), fileNameKey, uploadTask)
                schema = {...schema, uploadTask}
                onSchema(schema)
            })
        }, (error) => {
            if (error.code === Messages.DATA_DOESNT_EXISTS) {
                
                // Schema doesn't exists , lets create one
                let schema = {
                    file: {...file,timestamp:Date.now()},
                    clustors: []
                };
                this.GDriveXService.listDrivesAsArray((drives) => {
                    const fileSize = file.size;
                    let remainingSize = fileSize;
                    drives.every((drive, index) => {
                        // const availableDriveSpace = drive.availableSpace;

                        // To try part upload of file, simulate a scenario of limited space
                        const availableDriveSpace = 52428800;
                        schema.clustors.push({
                            index,
                            drive:drive.email.split('@')[0],
                            fileID: null,       // to be updated by upload task
                            linkToFile: null,   // to be updated by upload task
                            fileSize: remainingSize > availableDriveSpace ? availableDriveSpace : remainingSize
                        })
                        remainingSize = remainingSize - availableDriveSpace;
                        return !(remainingSize <= 0);
                    });

                    // save the schema to db
                    updateDB(dbPaths.files(), fileNameKey, schema)

                    // return the schema
                    // onSchema(schema)
                    return this.GDriveXService.getOrGenerateSchema(file, onSchema, onError)
                }, (error) => {
                    onError(error)
                })
            } else {
                onError(error)
            }
        })
    },

    getResumableSessionURI: (clustor, fileMetaData, onError, onResponse) => {
        getData(dbPaths.uploadTaskClustors(CommonUtil.generateKeyForFileName(fileMetaData.name)) + `/${clustor.index}/resumableUri`,(resumableUri) => {    
            onResponse(resumableUri)
        }, (error) => {
            var mimeType = mime.lookup(fileMetaData.name);
            getAccessToken(clustor.drive, (token) => {
                request(
                    {
                        method: "POST",
                        url:
                          "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
                        headers: {
                          'Authorization': `Bearer ${token.access_token}`,
                          'Content-Type': "application/json"
                        },
                        body: JSON.stringify({
                            name:fileMetaData.name,
                            mimeType: mimeType ? mimeType : null
                        })
                    }, (error, response) => {
                        if (error) {
                            onError(error)
                        } else {
                            response.token = token;
                            // onResponse({resumableUri: response.headers.location})
                            onResponse(response.headers.location)
                        }
                    }
                )
            }, onError)
        })
    },

    getFileResumeStatus: (drive, resumableUri, resume, onResponse, onError) => {

        // if (resume) {
            
        // }

        onResponse({
            statusCode: 400
        })

        // getAccessToken(drive, (token) => {
        //     request(
        //         {
        //             method: "PUT",
        //             url: resumableUri,
        //             headers: {
        //                 'Authorization': `Bearer ${token.access_token}`,
        //                 'Content-Range': '*/*',
        //                 'Content-Length': 0
        //             }
        //         }, (error , response) => {
        //             if (error) {
        //                 onError(error)
        //             } else {
        //                 onResponse(response)
        //             }
        //         }
        //     )
        // }, onError)
    },

    // createFile: (driveUser, fileMetada, ) => {

    // },

    uploadOrResumeFile: (resumableUri, offset, end, size, fileDataStream, drive, onError, onSuccess) => {
        getAccessToken(drive, (token) => {
            request(
                {
                    method: "PUT",
                    url: resumableUri,
                    headers: { 'Authorization': `Bearer ${token.access_token}`, "Content-Range": `bytes ${offset}-${end}/${size}`, "Content-Length": (end-offset)+1 },
                    body: fileDataStream
                }, (error, response, body) => {
                    if (error) {
                        onError(error)
                    } else {
                        onSuccess(body)
                    }
                }
            )
        }, null)
    },

    updateClustorOfUploadTask: (key, clustor) => {
        updateDB(dbPaths.uploadTaskClustors(key), clustor.index, clustor);
    },

    updateClustorOfSchema: (key, clustor) => {
        updateDB(dbPaths.fileSchema(key) + '/clustors', clustor.index, clustor);
    },

    getDriveObject
}

function getAccessToken(drive, onSuccess, onError) {
    getData(`${dbPaths.userDrive(drive)}/user/token`, (token) => {
        if ((token.expiry_date - Date.now()) > 60000) {
            // token is still valid
            onSuccess(token)
        } else {
            // token has expired, get new token
            CommonUtil.getCredentials((credentials) => {
                /*oAuth2Client = GDriveService.authorize(credentials);
                oAuth2Client.setCredentials(token);

                oAuth2Client.refreshAccessToken((err, credentials, res) => {
                    if (err) {
                        onError(err)
                    } else {
                        token.access_token = credentials.access_token
                        token.expiry_date = credentials.expiry_date
                        updateUserToken(drive, token)
                        onSuccess(token)
                    }
                })*/
                request(
                    {
                        method: "POST",
                        url:
                          "https://oauth2.googleapis.com/token",
                        headers: {
                          'Content-Type': "application/x-www-form-urlencoded"
                        },
                        form: {
                            client_id: credentials.installed.client_id,
                            client_secret: credentials.installed.client_secret,
                            refresh_token: token.refresh_token,
                            grant_type: 'refresh_token'
                        }
                    }, (error, response, body) => {
                        if (error) {
                            onError(error)
                        } else {
                            body = JSON.parse(body)
                            if (body && body.access_token) {
                                token.access_token = body.access_token
                                token.expiry_date = body.expires_in
                                updateUserToken(drive, token)
                                onSuccess(token)
                            } else {
                                onError("Reconnect drive " + drive)
                            }
                        }
                    }
                );
            })

                /*
                request(
                    {
                        method: "POST",
                        url:
                          "https://www.googleapis.com/oauth2/v4/token",
                        headers: {
                          'Content-Type': "application/x-www-form-urlencoded"
                        },
                        body: JSON.stringify({
                            client_id: credentials.client_id,
                            client_secret: credentials.client_secret,
                            refresh_token: token.refresh_token,
                            grant_type: 'refresh_token'
                        })
                    }, (error, response, body) => {
                        if (error) {
                            onError(error)
                        } else {
                            token.access_token = body.access_token
                            token.expiry_date = expires_in
                            updateUserToken(drive, token)
                            onSuccess(token)
                        }
                    }
                );
                */
        }
    }, onError)  
}

function updateUserToken(driveUser, token) {
    updateDB(`${dbPaths.userDrive(driveUser)}/user`, 'token', token)
}


function getDriveObject(driveUser, onDrive, onError) {
    if (!driveUser) {
        driveUser = UserService.getLoggedInUser().username;
    }
    getAccessToken(driveUser, (token) => {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.
            oAuth2Client = authorize(JSON.parse(content));
            oAuth2Client.setCredentials(token);

            const drive = google.drive({version: 'v3', auth:oAuth2Client});
            onDrive(drive)
        });
    }, onError)
}

function authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    return oAuth2Client;
}