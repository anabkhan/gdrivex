var torrentStream = require('./torrent-stream');
module.exports.CltsService = {
    getTorrentFiles : (torrentId, onData, onError) => {
        let engine = torrentStream(torrentId);
        engine.on('ready', function () {
            var files = [];
            for (i = 0; i < engine.files.length; i++) {
                var eachFile = engine.files[i];
                files.push({
                    name: eachFile.name,
                    id: engine.infoHash
                });
            }
            engine.destroy();
            onData({files,torrentId})
        });
    }
}