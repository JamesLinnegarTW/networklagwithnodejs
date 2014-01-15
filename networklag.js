var io = require('socket.io').listen(9000);
//io.set('log level', 2);


// Import external files
var fs = require('fs');
var vm = require('vm');
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);

includeInThisContext('./public/js/underscore.js');

var static = require('node-static');
var file = new static.Server('./public');

var tick = 0;
var clients = [];


require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8082);


io.sockets.on('connection', function (socket) {
    console.log("hello");
    clients.push(socket);

    socket.on('disconnect', function(){
        console.log('bye');

        for(var i= 0; i < clients.length; i++) {
            if(clients[i].id == socket.id){
                clients.splice(i,1);
                break;                
            }
        }

    });

});

var lastRender = new Date().getTime();

setInterval(function(){
    var newDate = new Date().getTime();
    var delta = newDate - lastRender;
    lastRender = newDate;

    tick++;
    if(tick > 1000000) tick = 0;

    var data = {};
    data.tick = tick;
    data.time = lastRender;

    for(var i= 0; i < clients.length; i++) {
        clients[i].volatile.emit('w', data);
    }

},100);
