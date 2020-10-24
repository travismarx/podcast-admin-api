var http = require('http'),
    fileSystem = require('fs'),
    util = require('util'),
    path = require('path');

http.createServer(function(request, response) {
    console.log(request.url, 'request made');
    console.log(request.method, 'request made');
    var filePath = path.join(__dirname, '6-19_VMS.mp3');
    var stat = fileSystem.statSync(filePath);

    response.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size,
        // 'Content-Disposition': 'attachment; filename=6-19_VMS.mp3',
    });

    var readStream = fileSystem.createReadStream(filePath);
    // // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(response);
    // util.pump(readStream, response);
})
.listen(4499);