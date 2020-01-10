const express = require('express');
const fileUpload = require('express-fileupload');

const bodyParser = require('body-parser');
var ipaParser = require('./ipa-parser');
// var ipaParser = require('ipa-metadata');

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
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    var folder = path.join('public/uploads/') + Date.now();
    mkdirp(folder, function (err) {
        if (err) {
            console.log('Error creating file ' + err);
        }
    });
    let filePath = folder + '/' + sampleFile.name;
    console.log(filePath);
    sampleFile.mv(filePath, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        ipaParser(filePath, function (err, metadata) {
            if (err) {
                console.log('error parsing ', + err);
            } else {
                console.log('parsing successful');
                if (metadata) {
                    fs.readFile('templates/app.plist.template', 'utf-8', (err, data) => {
                        // console.log(data);
                        data = data.replace('IPA_URL', serverURL + '/' + filePath);
                        data = data.replace('BUNDLE_IDENTIFIER', metadata.metadata.CFBundleIdentifier);
                        data = data.replace('BUNDLE_VERSION', metadata.metadata.CFBundleShortVersionString);
                        data = data.replace('TITLE_STRING', metadata.metadata.CFBundleName);
                        fs.writeFile(folder + '/app.plist', data, 'utf-8', (err) => {
                            if (err) {
                                console.log(err);
                            }
                            fs.readFile('templates/build.html.template', 'utf-8', (err, data) => {
                                data = data.replace('APP_NAME', metadata.metadata.CFBundleName);
                                data = data.replace('BUNDLE_VERSION', metadata.metadata.CFBundleShortVersionString);
                                data = data.replace('BUILD_URL', serverURL + '/public/build.html');
                                fs.writeFile(folder + '/index.html', data, 'utf-8', (err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            });
                            console.log(data);
                        });
                    });
                }
            }
        });


        console.log('uploaded');
        fs.readFile('public/ui/upload-success.html', 'utf-8', (err, data) => {
            data = data.replace('BUILD_URL', serverURL + '/' + folder.replace('public/', ''));
            data = data.replace('BUILD_URL', serverURL + '/' + folder.replace('public/', ''));
            console.log(data);
            res.send(data.toString());
        });
    });
});

const IP = "10.40.20.32"
const PORT = 8081;
var serverURL = 'http://' + IP + ':' + PORT;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
    mkdirp.sync(path.join(__dirname, '..', 'public/uploads'), (err) => {
        if (err) {
            console.log('Error creating directory', err);
        } else {
            console.log('Successfully created uploads directory');
        }
    });
});