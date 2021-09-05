var torrentStream = require('./torrent-stream');
const { Readable } = require('stream');
let engines = {};
let streams = {};
module.exports.CltsService = {
    getTorrentFiles: (torrentId, onData, onError) => {
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
            onData({ files, torrentId })
        });
    },

    createEngine: (magnet, id, onEngine, onError) => {
        if (engines[id]) {
            onEngine(engines[magnet])
        } else {
            let engine = torrentStream(magnet);
            engine.on('ready', function () {
                engines[id] = engine;
                onEngine(engine)
            });
        }
    },

    destroyEngine: (id) => {
        if (engines[id]) {
            engines[id].destroy();
            delete engines[id];
            console.log('Engine destroyed for ', id);
        } else {
            console.log('No engine found for ', id);
        }
    },

    destroyReadStream: (id) => {
        if (streams[id]) {
            streams[id].destroy();
            delete streams[id];
            console.log('Read stream destroyed for ', id);
        } else {
            console.log('No read stream found for ', id);
        }
    },

    streamTorrent: (engine, file, start, end, readableStream) => {

        var offset = start + file.offset;
        var pieceLength = engine.torrent.pieceLength;
        startPiece = (offset / pieceLength) | 0;
        endPiece = ((end + file.offset) / pieceLength) | 0;
        _critical = Math.min(1024 * 1024 / pieceLength, 2) | 1;

        _offset = offset - startPiece * pieceLength;

        _piece = startPiece;
        pieces = {};


        let stream = new Readable({
            read() {
                console.log('read requested for ', _piece);
                var piece = pieces[_piece];
                if (piece) {
                    if (_offset) {
                        piece = piece.slice(_offset)
                        _offset = 0
                    }
                    this.push(piece);
                    console.log('buffer fetched for ', _piece);
                    delete pieces[_piece];
                    if (_piece >= endPiece) {
                        this.destroy();
                        engine.deselect(startPiece, endPiece, true, null);
                        stream = null;
                    }
                    _piece++;
                    return null;
                } else {
                    _waitingFor = _piece;
                    _piece++;
                    return engine.critical(_waitingFor, _critical)
                }
            }
        });

        engine.removeAllListeners();
        engine.on('download', (index, buffer) => {
            if (_waitingFor === index) {
                console.log('pushing buffer to stream for', index);
                if (_offset) {
                    buffer = buffer.slice(_offset)
                    _offset = 0
                }
                stream.push(buffer);
                if (index >= endPiece) {
                    stream.destroy();
                    engine.deselect(startPiece, endPiece, true, null)
                    stream = null;
                }
                _waitingFor = -1;
            } else {
                pieces[index] = buffer;
            }
        })

        streams[file.name] = stream;

        stream.pipe(readableStream);

        engine.select(startPiece, endPiece, true, null)
    }
}