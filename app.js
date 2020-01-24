const express = require('express');
const fileUpload = require('express-fileupload');
const https = require('https')

const bodyParser = require('body-parser');
const ipaParser = require('app-info-parser/src/ipa')
const Applesign = require('applesign');

const mkdirp = require('mkdirp');
const path = require('path');
var fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(fileUpload());

// HTTP POST
// upload image files to server
app.post("/upload", function (req, res) {
    console.log('upload started');
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files were uploaded.');
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file;

    // Use the mv() method to place the file somewhere on your server
    var folder = path.join('public/uploads/') + Date.now();
    mkdirp(folder, function (err) {
        if (err) {
            console.log('Error creating file ' + err);
            return res.status(500).send(err.message);
        }

        let filePath = folder + '/' + sampleFile.name;
        console.log(filePath);
        sampleFile.mv(filePath, function (err) {
            if (err) {
                console.log('moving file failed' + err);
                return res.status(500).send(err.message);
            }

            console.log('codesign ' + req.body.codesign);
            if (req.body.codesign == 'true') {
                console.log('let\' sign the code');
                const as = new Applesign({
                    identity: '2A27FB7A96138C76DA5AC137F485136272C29D23',
                    mobileprovision: 'code-sign/c39148d5-1c6e-46d0-b66f-2d1c8e6a841d.mobileprovision',
                });
                as.events
                    .on('warning', (msg) => {
                        console.log('WARNING', msg);
                    })
                    .on('message', (msg) => {
                        console.log('msg', msg);
                    });

                as.signIPA(filePath)
                    .then(_ => {
                        console.log('ios-deploy -b', as.config.outfile);
                        console.log('replacing the source ipa file...');
                        fs.rename(folder + '/' + as.config.outfile, filePath, function (err) {
                            if (err)
                                console.log('moving failed ' + err);
                            else
                                console.log('replaced');
                            process.exitCode = 0;
                        });
                    })
                    .catch(e => {
                        console.error(e);
                        process.exitCode = 1;
                    });
            }

            const parser = new ipaParser(filePath)
            parser.parse().then(result => {
                if (err) {
                    console.log('error parsing ', + err);
                    return res.status(500).send(err.message);
                } else {
                    console.log('parsing successful');
                    if (result) {
                        fs.readFile('templates/app.plist', 'utf-8', (err, data) => {
                            // console.log(data);
                            data = data.replace('IPA_URL', serverURL + '/' + filePath.replace('public/', ''));
                            data = data.replace('BUNDLE_IDENTIFIER', result.CFBundleIdentifier);
                            data = data.replace('BUNDLE_VERSION', result.CFBundleShortVersionString);
                            data = data.replace('TITLE_STRING', result.CFBundleName);
                            fs.writeFile(folder + '/app.plist', data, 'utf-8', (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err.message);
                                }
                                fs.readFile('templates/build.html', 'utf-8', (err, data) => {
                                    data = data.replace('APP_NAME', result.CFBundleName);
                                    data = data.replace('BUNDLE_VERSION', result.CFBundleShortVersionString);
                                    data = data.replace('BUILD_URL', serverURL + '/' + folder.replace('public/', ''));
                                    data = data.replace('PLIST_URL', serverURLHttps + '/' + folder.replace('public/', '') + '/app.plist');
                                    fs.writeFile(folder + '/index.html', data, 'utf-8', (err) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(err.message);
                                        }
                                    });
                                });
                            });

                            if (result.icon) {
                                var base64Data = result.icon.replace(/^data:image\/png;base64,/, "");
                                fs.writeFile(folder + "/app-icon.png", base64Data, 'base64', function (err) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send(err.message);
                                    }
                                });
                            } else {
                                console.log('iPA don\'t have any icons, using blank icon...');
                                fs.copyFile('templates/app-icon.png', folder + "/app-icon.png", function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }
                        });
                    }
                }

            }).catch(err => {
                console.log('err ----> ', err)
                return res.status(500).send(err.message);
            })

            console.log('uploaded');
            fs.readFile('public/ui/upload-success.html', 'utf-8', (err, data) => {
                data = data.replace('BUILD_URL', serverURL + '/' + folder.replace('public/', ''));
                data = data.replace('BUILD_URL', serverURL + '/' + folder.replace('public/', ''));
                res.send(data.toString());
            });
        });
    });

});

const IP = "HRISHIK-IN-DA01"
const PORTHttps = 8081;
const PORT = 8082;
var serverURL = 'http://' + IP + ':' + PORT;
var serverURLHttps = 'https://' + IP + ':' + PORTHttps;

const httpsOptions = {
    key: fs.readFileSync('security/server.key'),
    cert: fs.readFileSync('public/security/server.crt')
}

const server = https.createServer(httpsOptions, app).listen(PORTHttps, () => {
    console.log(`listening on port ${PORTHttps}`)
    mkdirp.sync(path.join(__dirname, '..', 'public/uploads'), (err) => {
        if (err) {
            console.log('Error creating directory', err);
        } else {
            console.log('Successfully created uploads directory');
        }
    });
});



app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
    mkdirp.sync(path.join(__dirname, 'public/uploads'), (err) => {
        if (err) {
            console.log('Error creating directory', err);
        } else {
            console.log('Successfully created uploads directory');
        }
    });
});