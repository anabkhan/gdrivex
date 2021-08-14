const express = require('express')
const app = express()
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { send } = require('process');
const { updateDB, getData } = require('./services/fireabse');
const { CommonUtil } = require('./services/commonutil');
const { GDriveXService } = require('./services/gdrivex');
const { Readable, Stream } = require('stream');
const { FileService } = require('./services/files');
app.use(express.json());
app.use(cors())
const port = process.env.PORT || process.env.VCAP_APP_PORT || 3001;

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = 'token.json';


app.listen(port, () => {
  console.log("GDriveX backend started on " + port);
});

app.get('/', async (req, res) => {
  res.send('Hello World')
});

var oAuth2Client = null;

app.get('/addDrive', async (req, res) => {
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    oAuth2Client = authorize(JSON.parse(content));

    res.send({ authUrl: getURLForAccessToken(oAuth2Client) })
  });
});


app.get('/submitAuthCode', async (req, res) => {
  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) {
      res.status(400).send('Failed ' + err)
    };
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    // fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    //   if (err) return console.error(err);
    //   console.log('Token stored to', TOKEN_PATH);
    // });

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    drive.about.get({ fields: "user,storageQuota" }).then(data => {
      console.log(data)
      // Store the token in firebase
      const driveAbout = data.data;
      driveAbout.storageQuota.usageInGB = CommonUtil.getReadableFileSizeString(driveAbout.storageQuota.usage);
      driveAbout.storageQuota.totalInGB = CommonUtil.getReadableFileSizeString(driveAbout.storageQuota.limit);
      driveAbout.user.token = token;
      updateDB('users' + '/akanabkhan' + '/drives', driveAbout.user.emailAddress.split('@')[0], driveAbout)
    })

    res.send({ status: 'Success' })
  });
});

app.get('/listDrives', async (req, res) => {
  getData('users/' + 'akanabkhan' + '/drives/', (drives) => {
    res.send({ status: 'Success', drives })
  }, (error) => {
    console.log(error)
    res.status(400).send({ status: 'Failure', message: error })
  });
});

app.post('/getSchema', async (req, res) => {
  GDriveXService.getOrGenerateSchema(req.body, (schema) => {
    res.send(CommonUtil.createSuccessMessage(schema, "File Schema successfully generated"));
  }), (error) => {
    res.send(CommonUtil.createFailureMessage(error))
  }
});

app.post('/createUploadTask', async (req, res) => {
  FileService.downloadFromURL(req.query.url, req.query.fileName, (error) => {
    res.status(400).send(CommonUtil.createFailureMessage(error))
  })
  res.send()
})

app.get('/downloadFile', async (req, res) => {
  FileService.downloadFile(req.query.name, req, res, (error) => {
    res.status(400).send(CommonUtil.createFailureMessage(error))
  })
})



app.post('/uploadFile', async (req, res) => {
  // var readStream = new Readable({
  //   read() {
  //     console.log("read requested")
  //   }
  // });
  var readStream = new Stream.Readable({
    read() {
      return null;
    }
  })
  // req.on('data', (chunk) => {
  //   readStream.push(chunk)
  // })
  // req.on('end', () => {
  //   readStream.push
  // })
  GDriveXService.uploadFile(req, (response) => {
    res.send(CommonUtil.createSuccessMessage(response, ""))
  }, (error) => {
    res.status(400).send(CommonUtil.createFailureMessage(error))
  })
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  return oAuth2Client;



  // Check if we have previously stored a token.
  // fs.readFile(TOKEN_PATH, (err, token) => {
  //   if (err) return getAccessToken(oAuth2Client, callback);
  //   oAuth2Client.setCredentials(JSON.parse(token));
  //   callback(oAuth2Client);
  // });
}

function getURLForAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  return authUrl;
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
* Lists the names and IDs of up to 10 files.
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
function listFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}