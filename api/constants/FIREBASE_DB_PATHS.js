const { UserService } = require("../services/users")

module.exports.dbPaths = {
    users: () => {return 'users'},
    drives: () =>  {return `${USERS}/${UserService.getLoggedInUser().username}/drives`},
    userDrive: (driveUser) => {return drives() + '/' + driveUser}
}