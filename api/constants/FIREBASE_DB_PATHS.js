const { UserService } = require("../services/users")

module.exports.dbPaths = {
    users,
    drives,
    userDrive,
    fileSchema,
    files
}

function drives() {
    return `${users()}/${UserService.getLoggedInUser().username}/drives`
}

function users() {
    return 'users'
}

function userDrive(driveUser) {
    return drives() + '/' + driveUser
}

function files() {
    return `${users()}/${UserService.getLoggedInUser().username}/files`
}

function fileSchema(fileName) {
    return files() + "/" + fileName;
}
