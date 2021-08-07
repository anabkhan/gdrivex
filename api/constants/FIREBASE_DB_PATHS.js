const { UserService } = require("../services/users")

module.exports.dbPaths = {
    users,
    drives,
    userDrive,
    fileSchema,
    files,
    uploadTask,
    uploadTasks
}

function drives() {
    return `${user()}/drives`;
}

function users() {
    return 'users'
}

function user() {
    return `${users()}/${UserService.getLoggedInUser().username}`;
}

function userDrive(driveUser) {
    return drives() + '/' + driveUser
}

function files() {
    return `${user()}/files`
}

function fileSchema(fileName) {
    return files() + "/" + fileName;
}

function uploadTasks() {
    return `${user()}/uploadTasks`
}

function uploadTask(fileNameKey) {
    return uploadTasks() + "/" + fileNameKey;
}