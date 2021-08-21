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
                    size: eachFile.length,
                    offset: eachFile.offset,
                    id: engine.infoHash
                });
            }
            engine.destroy();
            onData({files,torrentId})
        });
    },

    streamTorrent : (magnet, file, start , end, readableStream) => {
        let engine = torrentStream(magnet);
        engine.on('ready', function () {

            var offset = start + file.offset;
            var pieceLength = engine.torrent.pieceLength;
            startPiece = (offset / pieceLength) | 0;
            endPiece = ((end + file.offset) / pieceLength) | 0;

            engine.select(startPiece, endPiece, true, null);

            // const readableStream = new Stream.Readable({
            //     read() {}
            // })

            // readableStream.pipe(writeStream)

            engine.on('download', (index, buffer) => {
                readableStream.push(buffer);
            })

        });
    }
}