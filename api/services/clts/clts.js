var torrentStream = require('./torrent-stream');
let engines = {};
module.exports.CltsService = {
    getTorrentFiles : (torrentId, onData, onError) => {
        let engine = torrentStream(torrentId);
        engine.on('ready', function () {
            var files = [];
            for (i = 0; i < engine.files.length; i++) {
                var eachFile = engine.files[i];
                files.push({
                    name: eachFile.name,
                    size: eachFile.length,
                    offset: eachFile.offset,
                    id: engine.infoHash
                });
            }
            engine.destroy();
            onData({files,torrentId})
        });
    },

    createEngine: (magnet, onEngine, onError) => {
        if (engines[magnet]) {
            onEngine(engines[magnet])
        } else {
            let engine = torrentStream(magnet);
            engine.on('ready', function () {
                engines[magnet] = engine;
                onEngine(engine)
            });
        }
    },

    streamTorrent : (engine, file, start , end, readableStream) => {
            var fileToDownload = engine.files[file.id];

            var stream = fileToDownload.createReadStream({
                start,
                end
            });

            stream.pipe(readableStream)
        /*let engine = torrentStream(magnet);
        engine.on('ready', function () {

            var offset = start + file.offset;
            var pieceLength = engine.torrent.pieceLength;
            startPiece = (offset / pieceLength) | 0;
            endPiece = ((end + file.offset) / pieceLength) | 0;

            var fileToDownload = engine.files[file.id];

            var stream = fileToDownload.createReadStream({
                start,
                end
            });

            stream.pipe(readableStream)

        });*/
    }
}