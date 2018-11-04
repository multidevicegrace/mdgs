'use strict';

const express = require('express');
const Server = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const CLIENT_INDEX = path.join(__dirname, 'redirecter.html');

const server = express()
  .use((req, res) => {
    if (req.method.toLowerCase() == "get") {
      var page = "";
      console.log(req.originalUrl);
      if (req.path.match("/mdg/tabletopgrace")) {
        if (req.path.endsWith("tabletopgrace") || req.path.endsWith("tabletopgrace/")) {
          page = "/mdg/tabletopgrace/index.html";
        } else {
          page = req.path;
        }
      } else if (req.path.match("tiledgrace")) {
        if (req.path.endsWith("tiledgrace") || req.path.endsWith("tiledgrace/")) {
          page = "/mdg/tiledgrace/index.html";
        } else {
          page = req.path;
        }
      }
      if (page) {
        res.sendFile(path.join(__dirname, page));
      } else {
        res.sendFile( INDEX );
      }
    } else {

      res.status(404).send('Page not found.')
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


var ws = new Server({ server });

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


}


function exitHandler(options,err) {
  if (options.exit) {
    for (var i = 0; i < sockets.length; i++) {
      if (sockets[i] && sockets[i].readyState != 3) {
        try {
          send(i,JSON.stringify({info:"Server shutdown",from:sname}));
          sockets[i].close();
        } catch (er) {}
      }
    }

    process.exit();
  }
}

process.on('exit', exitHandler.bind(null,{}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

function startServer() {
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



      ('New Connection id: ', id);


      w.on('message', function(_msg){
        if (_msg.length > maxMessage) { drop(w.id); return; }
        var msg = null;
        try {
          var msg = JSON.parse(_msg);
        } catch (e) {

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

      });

      sockets[id] = w;
    });
  } catch (error) {


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
  //
  //


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

  } else {
    if (!hubs[hub].includes(id)) {
      // sendToHub(hub,sname,{jhub:id});
      hubs[hub].push(id);
      sockets[id].hub = hub;
      send(id,JSON.stringify({jhub:"OK",hub:hub}));

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
      //
    }
    delete msg.toS;
    send(sid,JSON.stringify(msg));
  }
}

function sendToHub(hub,id,msg) {

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

