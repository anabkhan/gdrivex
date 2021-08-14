const { dbPaths } = require("../constants/FIREBASE_DB_PATHS")
const { getData } = require("./fireabse")
const fs = require('fs');
const {google} = require('googleapis');
const { UserService } = require("./users");
module.exports.GDriveService = {
    uploadFile : (fileId, driveUser, fileStream, metadata, onOutput, onError) => {
        getDriveObject(driveUser, async (drive) => {
            try {
                let response;
                if (fileId) {
                    // Update File
                    response = await drive.files.update({
                        requestBody: metadata,
                        fileId,
                        media: {
                            mimeType: metadata.mimeType,
                            body: fileStream,
                        },
                    });
                } else {
                    // Create File
                    response = await drive.files.create({
                          requestBody: metadata,
                          media: {
                              mimeType: metadata.mimeType,
                              body: fileStream,
                          },
                    });  
                }
                // report the response from the request
                console.log(response.data);
                onOutput(response.data);
              } catch (error) {
                  //report the error message
                  console.log(error.message);
                  onError(error.message);
              }
        })
    },
    getAccessToken: getAccessToken,
    authorize,
    getDriveObjectOfLoggedInUser,
    getDriveObject
}

function getDriveObjectOfLoggedInUser (onDrive) {
    getDriveObject(UserService.getLoggedInUser().username, onDrive)
}

function getDriveObject(driveUser, onDrive) {
    GDriveXService.getAccessToken(driveUser, (token) => {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.
            oAuth2Client = authorize(JSON.parse(content));
            oAuth2Client.setCredentials(token);

            const drive = google.drive({version: 'v3', auth:oAuth2Client});
            onDrive(drive)
        });
    }, (err) => {console.log(err)})
    // getAccessToken(driveUser, (token) => {
    //     fs.readFile('credentials.json', (err, content) => {
    //         if (err) return console.log('Error loading client secret file:', err);
    //         // Authorize a client with credentials, then call the Google Drive API.
    //         oAuth2Client = authorize(JSON.parse(content));
    //         oAuth2Client.setCredentials(token);

    //         const drive = google.drive({version: 'v3', auth:oAuth2Client});
    //         onDrive(drive)
    //     });
    // }, (err) => {
    //     console.log(err)
    // })
}

function getAccessToken(driveUser, onTokenRecieved, onError) {
    getData(dbPaths.userDrive(driveUser) + '/user/token', onTokenRecieved, onError)
}

//let oAuth2Client = null;

function authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    return oAuth2Client;
}