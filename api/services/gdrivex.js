const { dbPaths } = require("../constants/FIREBASE_DB_PATHS")
const { Messages } = require("../constants/Messages")
const { getData, updateDB } = require("./fireabse")
const { GDriveService } = require("./gdrive")

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
            name: 'TestFileName.png',
            mimeType: 'image/png'
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
                const eachDrive = response[key];
                const availableSizeEachDrive = eachDrive.storageQuota.limit - eachDrive.storageQuota.usage;
                const driveToPush = {
                    email: eachDrive.user.emailAddress,
                    availableSpace: availableSizeEachDrive,
                    ...eachDrive.storageQuota
                }
                if (drives.length === 0) {
                    drives.push(driveToPush)
                } else {
                    // let index = 0;
                    drives.every((existingDrive, index) => {
                        const availableSizeExistingDrive = existingDrive.limit - existingDrive.usage;
                        if (availableSizeEachDrive > availableSizeExistingDrive) {
                            arr.splice(index - 1, 0, driveToPush);
                            return false;
                        } else if (index === drives.length - 1) {
                            drives.push(driveToPush)
                        }
                        // index++;
                    });
                }
            });
            onDriveArray(drives);
        }, onError)
    },

    /**
     * Checks if schema exists for a file, returns the existing
     * Or create a new schema and return the newly created one
     * @param {*} onSchema 
     * @param {*} onError 
     */
    getOrGenerateSchema: (file, onSchema, onError) => {
        const fileNameKey = file.name.split('.').join('-*-');
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
                    file,
                    clustors: []
                };
                this.GDriveXService.listDrivesAsArray((drives) => {
                    const fileSize = file.size;
                    let remainingSize = fileSize;
                    drives.every((drive, index) => {
                        schema.clustors.push({
                            index,
                            drive:drive.email,
                            fileID: null,       // to be updated by upload task
                            linkToFile: null,   // to be updated by upload task
                            fileSize: remainingSize > drive.availableSpace ? drive.availableSpace : remainingSize
                        })
                        remainingSize = remainingSize - drive.availableSpace;
                        return !(remainingSize <= 0);
                    });

                    // save the schema to db
                    updateDB(dbPaths.files(), fileNameKey, schema)

                    // return the schema
                    onSchema(schema)
                }, (error) => {
                    onError(error)
                })
            } else {
                onError(error)
            }
        })
    }
}