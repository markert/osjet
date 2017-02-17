'use strict';
var nopt = require('nopt');
var jet = require('node-jet');
var os = require('os');
var diskspace = require('diskspace');


var knownOpts = {
    'port': Number,
    'addr': String,
    'nojet': Boolean,
    'initpath': String,
    'updateinterval': String
};
var shortHands = {
    'p': ['--port'],
    'a': ['--addr'],
    'nj': ['--nojet', 'true'],
    'i': ['--initpath'],
    'u': ['--updateinterval'],
};

var parsedArgs = nopt(knownOpts, shortHands, process.argv, 2);
var addr = parsedArgs.addr || '127.0.0.1';
var port = parsedArgs.port || 11122;
var nojet = parsedArgs.nojet || false;
var initpath = parsedArgs.nojet || 'system/';
var interval = parsedArgs.interval || 1000;

if (!nojet) {
    new jet.Daemon().listen({
        tcpPort: port,
        wsPort: port + 1
    });
}

var peer = new jet.Peer({
    port: port,
    ip: addr
});


peer.connect().then(function() {
    console.log('peer connected');
});

var system = {};

for (var k in os) {
    if (os.hasOwnProperty(k) && typeof os[k] === 'function' && k !== 'getNetworkInterfaces') {
        system[k] = new jet.State(initpath + k, os[k]());
        peer.add(system[k]).then(function() {});
    } else if (os.hasOwnProperty(k) && typeof os[k] !== 'function') {
        system[k] = new jet.State(initpath + k, os[k]);
        peer.add(system[k]).then(function() {});
    }
}

system.diskspace = new jet.State(initpath + 'diskspace', {
    total: 0,
    free: 0,
    status: 'READY'
});
peer.add(system.diskspace).then(function() {});

var updateStates = function() {
    setTimeout(function() {
        system.freemem.value(os.freemem());
        system.cpus.value(os.cpus());
        system.loadavg.value(os.loadavg());
        system.uptime.value(os.uptime());
        system.networkInterfaces.value(os.networkInterfaces());
        diskspace.check('/', function(err, total, free, status) {
            system.diskspace.value({
                total: total,
                free: free,
                status: status
            });
        });
        updateStates();
    }, interval)
}
