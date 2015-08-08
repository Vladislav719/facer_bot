/**
 * Created by vlad on 31.07.15.
 */
var request = require('request');
var cheerio = require('cheerio');
var url = 'http://turnyournameintoaface.com/?name=';
var siteUrl = 'http://turnyournameintoaface.com/';
var fs = require('fs');

var requestSite = function (url, fn) {
    request(url, function (err, res, body) {
        fn(err, res, body);
    });
};
/**
 *
 * @param name
 * @returns {*}
 */
var parseImageUrlFromHtml = function (name, fn) {
    requestSite(url+name, function (err,res, body) {
        var $ = cheerio.load(body);
        var src = $('img').attr('src');
        fn(siteUrl+src);
    });
};

var encodeImageToBase64ByUrl = function (name, result) {
    parseImageUrlFromHtml(url+name, function (path) {
        request.get(path, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
                result(data);
            }
        });
    });
};

var saveImage = function (name, localPath) {
    parseImageUrlFromHtml(name, function (imgPath) {
        request.get({url:imgPath, encoding: 'binary'}, function (err, res, body) {
            fs.writeFile('./tmp/'+name+'.png', body, 'binary', function (err) {
                if (err) {
                    console.log(name)
                    console.log(err)
                }
                else {
                    localPath('./tmp/'+name+'.png')
                    console.info('INFO: FILE SAVED')
                }
            })
        })
    });
};

var deleteFile = function (path) {
    fs.unlink(path, function (err) {
        if (err) throw err;
        else console.info("INFO: FILE DELETED!");
    });
};

module.exports = {
    deleteFile: deleteFile,
    loadFile: saveImage
};
