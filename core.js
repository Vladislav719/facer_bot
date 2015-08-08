/**
 * Created by vlad on 31.07.15.
 */
var Twit = require('twit');
var mediaUtil = require('./util');
var T = new Twit(require('./config'));
var fs = require('fs');

var siteUrl = 'http://turnyournameintoaface.com/';

var postTwit = function (name, botMessage) {

    mediaUtil.loadFile(name, function (path) {
        var b64content = fs.readFileSync(path, { encoding: 'base64' });

        T.post('media/upload', {media_data: b64content}, function (err, data, response) {
            if (err) {
                throw err;
            }
            var params = {
                status: botMessage,
                media_ids: [data.media_id_string]
            };

            T.post('statuses/update', params, function (err, data, response) {
                if (err) throw err;
                else console.log("ТВИТ ОТПРАВЛЕН")
            })
        })
        mediaUtil.deleteFile(path)
    });


};

var processMsg = function (msg) {
    if (msg.toLowerCase().indexOf('me') > -1) {
        return 1; // для текущего аккаунта-брать ник из аккаунта
    } else if(msg.toLowerCase().indexOf('for') > -1) {
        return 2; // для присланного имени
    } else if(msg.indexOf('help') > -1) {
        return 3;
    }
};

var stream = T.stream('statuses/filter', {  track: '@facer_bot' });

stream.on('tweet', function (tweet) {
    console.log(tweet.text);
    var text = tweet.text;
    var screenName = '@'+tweet.user.screen_name;
    switch (processMsg(text)) {
        case 1:
            var botMsg = screenName+ ' your unique avatar:';
            postTwit(screenName, botMsg);
            break;
        case 2:
            var botMsg = screenName+ '  unique avatar for @' + getNickFromMessage(text) + ' :';
            postTwit(getNickFromMessage(text), botMsg)
            break;
        case 3:
            //var botMsg = screenName+' Tweet "@facer_bot help" to get info. '
            //var secondMsg = screenName+ 'Tweet "@facer_bot for nickname" to get avatar for this nickname';
            //postSimpleMessage(botMsg)
            //postSimpleMessage(secondMsg)
            break;
        default:

            break;
    }
});


var postSimpleMessage = function (msg) {
    T.post('statuses/update', { status: msg }, function(err, data, response) {
        if (err) throw err;
        console.log("tweet отправлен help")
    })
};

var getNickFromMsg = function (msg) {
    var arr = msg.split(" ");
    var nick = arr[arr.length-1];
    if (nick.toLowerCase().indexOf("@") > -1) {
        nick = nick.replace('@','');
    }
    return nick
};

var getNickFromMessage = function (msg) {
    var index = msg.toLowerCase().lastIndexOf("for ");
    var strStartFor = msg.slice(index, msg.length);
    var i = strStartFor.slice(4, strStartFor.length);
    if (i.indexOf(" ") > -1) {
        var k = i.indexOf(' ');
        i = i.slice(0, k);
    }
    if (i.indexOf("@") > -1) {
        i = i.slice(1, i.length)
    }
    return i;
}