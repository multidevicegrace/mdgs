var Server = require('ws').Server;
var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + "/debug.log", {flags : 'a'});
var http = require('http');
var logging = false;

var port = 64999;
var server;
var ws;
var cid = 1;
var maxConnections = 20;

var sockets = [];
var hubs = [];
var ids = [];

var auth = "760";
var authReplyF = JSON.stringify({auth:"0"});
var authAttempts = 5;
var maxMessage = 165000;
var sname = "server";
var hubNameMax = 7;
var debug = true;

//Check for passed port
if (process.argv.length > 2) {
  var i = parseInt(process.argv[2]);
  if (i == process.argv[2]) {
    port = i;
  }
}

process.stdin.resume();
start();

var maxCount = 10;
var count = 0;
function start() {
  for (var i = maxConnections; i > 0; i--) {
    ids.push(i);
  }


  startServer();

  var a = ws.address();
  var msg = "{ ";
  try {
    var keys = Object.keys(a);
    var vals = Object.values(a);
    for (var i = 0; i < keys.length; i++) {
      if (i != 0) { msg += ", "; }
      msg += keys[i] + ": " + vals[i];
    }
    msg += " }";
    console.log("Server: " + msg);
  } catch (e) {
    console.log("Server failed to start on port " + port + ", trying port " + (port + 1));
    port++;
    count++;
    if (count < maxCount) {
      start();
    }
  }
}


function exitHandler(options,err) {
  if (err) { console.log(err.stack); }
  if (options.exit) {
    for (var i = 0; i < sockets.length; i++) {
      if (sockets[i] && sockets[i].readyState != 3) {
        try {
          send(i,JSON.stringify({info:"Server shutdown",from:sname}));
          sockets[i].close();
        } catch (er) {}
      }
    }
    console.log("Server shutting down");
    process.exit();
  }
}

process.on('exit', exitHandler.bind(null,{}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

function startServer() {
  server = http.createServer().listen(port);
  ws = new Server({server:server});
  try {
    ws.on('connection', function(w){
      if (Object.keys(sockets).length >= 20) {
        send(null,"Server at capacity.",w);
        return;
      }

      var id = getID();
      if (id == -1) {
        send(null,"Server at capacity.",w);
        return;
      }
      w.id = id;
      w.auth = false;
      w.authCount = 0;
      console.log('New Connection id: ', id);
      console.log("Address: " + w._socket.remoteAddress + " " + w._socket.remotePort);

      w.on('message', function(_msg){
        if (_msg.length > maxMessage) { drop(w.id); return; }
        var msg = null;
        try {
          var msg = JSON.parse(_msg);
        } catch (e) {
          console.log(w.id + " unknown message: " + _msg);
          drop(w.id);
          return;
        }

        msg.from = w.id;
        if (!w.auth) {
          handleAuth(w,msg);
          return;
        }

        handleMessage(w,msg);
      });

      w.on('close', function() {
        drop(w.id);
        console.log(w.id + " disconnected.");
      });

      sockets[id] = w;
    });
  } catch (error) {
    console.log("Error:");
    console.log(error);
  }
}

function reverse(a,b) {
  if (a > b) {return -1} else if (a < b) {return 1} else { return 0 }
}

function getID() {
  if (ids.length == 0) {
    return -1;
  }
  ids.sort(reverse);
  return ids.pop();
}

function handleAuth(w,msg) {
  if (msg.auth && msg.auth == auth) {
    w.auth = true;
    w.type = msg.type;
    send(null,JSON.stringify({auth:w.id}),w);    
  } else {
    send(null,authReplyF,w);
    w.authCount++;
    if (w.authCount >= authAttempts) {
      w.close();
    }
    log(w.id + " failed auth. Attempt " + w.authCount + " of " + authAttempts);

  }
}

function handleMessage(w,msg) {
  if (msg.jhub) {
    deleteOtherData(msg,0);
    joinHub(msg.jhub,w.id);
  } else if (msg.lhub) {
    deleteOtherData(msg,1);
    leaveHub(msg.lhub,w.id);
  } else if (msg.toH) {
    deleteOtherData(msg,2);
    sendToHub(msg.toH,w.id,msg);
  } else if (msg.toS) {
    deleteOtherData(msg,3);
    sendToSID(msg.toS,w.id,msg);
  }
}

function deleteOtherData(msg,id) {
  delete msg.info;
  delete msg.auth;
  if (id != 0) {
    delete msg.jhub;
  } else {
    msg.jhub = msg.jhub.substring(0,hubNameMax);
  }
  if (id != 1) {
    delete msg.lhub;
  } else {
    msg.lhub = msg.lhub.substring(0,hubNameMax);
  }
  if (id != 2) {
    delete msg.toH;
  } else {
    msg.toH = msg.toH.substring(0,hubNameMax);
  }


  if (id != 3) {
    delete msg.toS;
  }
}

function drop(id) {
  if (!sockets[id]) { return; }
  if (sockets[id].hub != undefined) {
    leaveHub(sockets[id].hub,id);
  }
  ids.push(id);

  var d = new Date();
  var m = d.getMinutes();
  if (m < 10) { m = "0" + m ; }
  d = "(" + d.getDay() + "/" + d.getMonth() + "/"
      + d.getFullYear() + " " + d.getHours() + ":" + m + ")";
  var t = d + " " + id + " - ";
  if (sockets[id].tdat) {
    t += " Send Events: " + sockets[id].tdat;
    t += " - Tiles Sent: ";
    for (var i = 0; i < sockets[id].tdat; i++) {
      t += sockets[id].tcnt[i] + ",";
    }
    t += " - Sent To: ";
    for (var i = 0; i < sockets[id].tdat; i++) {
      t += sockets[id].ttyp[i] + ",";
    }
  } else {
    t += " No tiles sent.";
  }
  // console.log(sockets[id].tcnt);
  // console.log(sockets[id].ttyp);
  log(t);

  sockets[id].close();
  sockets.remove(id);
}

function joinHub(hub,id) {
  if (sockets[id].hub != undefined && sockets[id].hub == hub) { return; }
  if (sockets[id].hub != undefined) {
    leaveHub(sockets[id].hub,id);
  }
  if (!hubs[hub]) {
    hubs[hub] = [id];
    send(id,JSON.stringify({jhub:"OK",hub:hub}));
    sockets[id].hub = hub;
    console.log(id + " created hub: " + hub);
  } else {
    if (!hubs[hub].includes(id)) {
      // sendToHub(hub,sname,{jhub:id});
      hubs[hub].push(id);
      sockets[id].hub = hub;
      send(id,JSON.stringify({jhub:"OK",hub:hub}));
      console.log(id + " joined hub: " + hub);
    }
  }
}

function leaveHub(hub,id) {
  if (hubs[hub] != undefined && hubs[hub].includes(id)) {
    hubs[hub].remove(id);
    sendToHub(hub,sname,{lhub:id});
    delete sockets[id].hub;
  }
}

function sendToSID(sid,id,msg) {
  if (debug) {
    console.log("Send to: " + sid + ", from: " + id);
  }
  if (sid == id) { return; }
  if (sockets[sid] && sockets[sid].hub != undefined && sockets[id].hub != undefined
      && sockets[sid].hub == sockets[id].hub) {
    if (msg.tdat) {
      if (!sockets[id].tdat) {
        sockets[id].tdat = 1;
        sockets[id].tcnt = [msg.tileCount];
        sockets[id].ttyp = [sockets[sid].type];
      } else {
        sockets[id].tdat++;
        sockets[id].tcnt.push(msg.tileCount);
        sockets[id].ttyp.push(sockets[sid].type);
      }
      // console.log(id + " sent " + msg.tileCount + ", to " + sockets[sid].type);
    }
    delete msg.toS;
    send(sid,JSON.stringify(msg));
  }
}

function sendToHub(hub,id,msg) {
  if (debug && id != sname) {
    console.log("Send to hub: " + hub + ", from: " + id);
    if (hubs[hub]) {
      console.log(hubs[hub]);
    }
  }
  if ((id == sname || sockets[id].hub != undefined) && hubs[hub] != undefined) {
    for (var i = 0; i < hubs[hub].length; i++) {
      if (hubs[hub][i] != id) {
        delete msg.toH;
        send(hubs[hub][i],JSON.stringify(msg));
      }
    }
  }
}

function send(id,msg,w) {
  if (id != null) {
    if (sockets[id] && sockets[id].readyState == 1) {
      sockets[id].send(msg);
    }
  } else {
    if (w) {
      w.send(msg);
    }
  }
}

//Array remove function
Array.prototype.remove = function(e) {
  var index = this.indexOf(e);
  if (index != -1) {
    return this.splice(index,1);
  }
};

function log(msg) {
  if (logging) { 
    log_file.write(msg + "\n");  
  }
}
