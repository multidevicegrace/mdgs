//Handles the client portion of the WebSocket connection

var websock;
var ws_sid;
var ws_auth = false;
var ws_hook = false;
var ws_hub = false;
var ws_cid;
var ws_cid_length = 3;
var ws_hubName = "HUB1";
var ws_name;
var ws_nameList = Array("Apple","Apricot","Avocado","Banana","Bilberry","Blackberry","Blueberry","Currant","Cherry","Cherimoya","Chico","Cloudberry","Coconut","Cranberry","Cucumber","Damson","Date","Durian","Elderberry","Feijoa","Fig","Goji berry","Gooseberry","Grape","Raisin","Grapefruit","Guava","Honeyberry","Jabuticaba","Jackfruit","Jambul","Jujube","Juniper","Kiwano","Kiwifruit","Kumquat","Lemon","Lime","Loquat","Longan","Lychee","Mango","Mangosteen","Melon","Cantaloupe","Honeydew","Watermelon","Mulberry","Nectarine","Nance","Olive","Orange","Clementine","Mandarine","Tangerine","Papaya","Peach","Pear","Persimmon","Plantain","Plum","Prune","Pineapple","Plumcot","Pomelo","Quince","Raspberry","Rambutan","Redcurrant","Salal","Salak","Satsuma","Soursop","Strawberry","Tamarillo","Tamarind","Ugli","Yuzu","Avocado");
var ws_disabled = 1;
var ws_dataID = 0;
var ws_dataState = [];
var ws_attempts = 2;
var ws_attempt = 0;
var ws_alerts = 1;
var ws_conState = 0;
var ws_err = 0;
var ws_msgs = [];
var ws_cookie = false;
var ws_port = null;
var ws_address = "multi-device-grace.herokuapp.com";
var ws_protocol = "wss";
var ws_type;

//Read vars from config
if (c_protocol) { ws_protocol = c_protocol; }
if (c_hub) { ws_hubName = c_hub; }

function ws_startWebSocket() {
  if (system_mode == 1) { ws_type = "Mobile"; } else { ws_type = "Tabletop"; }
  
  
  console.log("WebSocket - Connecting...");
  var addr = ws_protocol + "://" + ws_address;
  
  websock = new WebSocket(addr);
  ws_updateConStatus(1,"Connecting...");

  //Message Handlers
  websock.onopen = function(evt) { ws_handleOpen(); console.log("OPEN"); }
  websock.onmessage = function(evt) {
    ws_handleMessage(evt.data);
  }
  websock.onerror = function(evt) {
    ws_err = 1;
    if (websock != null) {
      if (mobile && ws_alerts) {
        // alert("WS ERROR: " + evt.data);
      } else {
        console.log("WS Error: " + evt.data);
      }
    } else {
      //Failed to connect
      ws_retryConnection();
    }
  }
  websock.onclose = function(evt) { ws_handleClose(evt.data); }

  if (!ws_hook) {
    //Shutdown hook attempt
    var myEvent = window.attachEvent || window.addEventListener;
    var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload';
    myEvent(chkevent, function(e) { // For >=IE7, Chrome, Firefox
      ws_shutdown();
    });
    ws_hook = true;
  }
  
  // window.setTimeout(function() {
    // if (ws_started == 0 && websock && websock.readyState == 1 && !ws_auth) {
      // ws_handleOpen();
    // }
  // },100);
}

function ws_retryConnection(msg) {
  if (ws_attempt < ws_attempt) {
    ws_attempt++;
    console.log("WS connection closed: retry attempt: " + ws_attempt + " of " + ws_attempts);
    window.setTimeout(ws_startWebSocket,500);
  } else {
    console.log("Failed to connect to WebSocket server.");
  }
}

function ws_handleMessage(_msg) {
  msg = JSON.parse(_msg);
  // console.log("MSG: " + _msg);
  if (msg.auth == 0) {
    ws_cid = null;
    tablePrompt();
  } else if (msg.auth) {
    //Auth
    ws_sid = msg.auth;
    ws_name = ws_sid + ". " + ws_nameList[Math.floor(Math.random()*ws_nameList.length)];
    console.log("WebSocket - Authenticated: " + ws_name);

    ws_auth = true;
    ws_addCookie();
    ws_joinHub();
  } else if (msg.jhub) {
    //Join Hub
    console.log("WebSocket - Joined hub");
    ws_hub = true;
    ws_updateConStatus(2,ws_name);
  } else if (msg.lhub) {
    removeFromConMenu(msg.lhub);    
  } else if (msg.sreq) {    
    ws_statusResponse(msg.from);
    if (msg.hidden) { return; }
    updateConMenu(msg.name,msg.dia,msg.win,msg.wina);    
  } else if (msg.srep) {    
    updateConMenu(msg.name,msg.dia,msg.win,msg.wina);
  }else if (msg.drep) {
    //Dialect change announcement
    ws_receiveDialectChange(msg);
  } else if (msg.wrep) {
    ws_receiveWindowChange(msg);
  } else if (msg.tdat != null) {    
    ws_receiveTiles(msg,0);
  } else if (msg.trep != null) {
    ws_sendTilesDone(msg);
  }
}

function ws_getCookie() {
  //Get cid cookie if it exists
  var pairs = document.cookie.split(";");
  for (var i = 0; i < pairs.length; i++) {
    var p = pairs[i].split("=");
    if (p[0] == "cid") {
      ws_cid = p[1];
      if (ws_cid) { return true; }
      return false;
    }
  }
  return false;
}

function ws_addCookie() {
  //Add cid cookie if it does not exist
  if (ws_cookie) { return; }
  document.cookie = "cid=" + ws_cid;
}


function ws_sendDialectChange() {
  var dialect = document.getElementById('dialect').value;
  websock.send(JSON.stringify({"toH":ws_hubName,"drep":"1","dia":dialect}));
}

function ws_receiveDialectChange(msg) {
  updateConMenuDialect(msg.from,msg.dia);
}

function ws_sendWindowChange() {
  var win_active = ["1"];
  if (windowMax && windowMax > 1) {
    win_active = getActiveWindows();
  }
  if (win_active.length == 0) {
    win_active = ["0"];
  }

  websock.send(JSON.stringify({"toH":ws_hubName,"wrep":"1","win":windowMax,"wina":win_active}));
}

function ws_receiveWindowChange(msg) {
  updateConMenuWindows(msg.from,msg.win,msg.wina);
}

function ws_self() {
  if (ws_conState == 0) { return "Not Connected"; }
  else if (ws_conState == 1) { return "Connecting..."; }
  else if (ws_conState == 2) { return ws_name + " - " + getDialectClean(); }
}



function ws_joinHub() {
  if (!ws_auth) { return; }
  console.log("WebSocket - Joining hub...");
  websock.send(JSON.stringify({"jhub":ws_hubName}));
  console.log("Sent hub join request");
}


function ws_handleOpen() {
  ws_attempt = 0;
  
  //Authenticate
  if (!ws_auth && !ws_hub) {
    ws_attempt = 0;
    if (!ws_cid) {
      var b = ws_getCookie();
      if (!b) {
        if (system_mode == 1) {
          var c = prompt("Enter client id");
          if (!c) { ws_forceClose(); return; }
          while (c.length < ws_cid_length) {
            c = "0" + c;
          }
          ws_cid = c;
          ws_sendAuth();
        } else {
          tablePrompt();
        }
      } else {
        ws_cookie = true;
        websock.send(JSON.stringify({"auth":ws_cid,"type":ws_type}));
      }
    } else {      
      websock.send(JSON.stringify({"auth":ws_cid,"type":ws_type}));
    }
  }
}

function ws_setCID(cid) {  
  if (ws_cid != null) { return; }
  if (cid == null) { ws_forceClose(); return; }

  while (cid.length < ws_cid_length) {
    cid = "0" + cid;
  }
  ws_cid = cid;
  ws_sendAuth();
}

function ws_sendAuth() {
  if (!ws_auth && !ws_hub) {
    console.log("WebSocket - Authenticating...");
    websock.send(JSON.stringify({"auth":ws_cid,"type":ws_type}));
  }
}



function ws_statusRequest(sid) {
  if (!websock) { return; }
  if (!ws_auth || !ws_hub) { return; }  
  var win_active = ["1"];
  if (windowMax && windowMax > 1) {
    win_active = getActiveWindows();
  }
  if (win_active.length == 0) {
    win_active = ["0"];
  }
  
  websock.send(JSON.stringify({"toH":ws_hubName,"sreq":"1","dia":getDialect(),"win":windowMax,"wina":win_active,"name":ws_name}));
  console.log("Sent status request to hub");
}

function ws_statusResponse(sid,conID) {
  var win_active = ["1"];
  if (windowMax && windowMax > 1) {
    win_active = getActiveWindows();
  }
  if (win_active.length == 0) {
    win_active = ["0"];
  }
  var dialect = document.getElementById('dialect').value;


  websock.send(JSON.stringify({"toS":sid,"srep":"1","win":windowMax,"wina":win_active,"dia":dialect,"name":ws_name}));
}

function ws_sendTilesState(conID) {
  if (ws_dataState[conID] != 1) {
    return true;
  } else {
    return false;
  }
}

function ws_sendTiles(sid, dialect, conID, windex, tileData, tileCount) {
  //Send tiles to SID over WebSocket
  console.log("TileData Length: " + tileData.length);
  if (tileData.length > 200000) {
    console.log("Too much tile data to send: " + tileData.length);
    return false;
  }
  ws_dataState[conID] = 1;


  var msg = JSON.stringify({"toS":sid,"tdat":"1","dia":dialect,"conID":conID,"win":windex,"tileCount":tileCount,"tiles":tileData});
  websock.send(msg);
  return true;
}


function ws_sendTilesDone(msg) {
  var conM;
  if (system_mode == 0) {
    conM = document.getElementById("con" + msg.conID);
  } else {
    conM = document.getElementById("con" + 0);
  }
  var ce = conM.getElementsByClassName(msg.from+"w" + (parseInt(msg.win)+1))[0];
  var cs = conM.getElementsByClassName("constatus")[0];
  if (msg.ok == "0") {
    //Failed
    console.log("SID: " + msg.from + " reports failure on tile transfer - " + msg.conID);
    ce.style.background = "red";
    cs.innerHTML = "Failed to send tiles to " + msg.from;
  } else if (msg.ok == "1") {
    //Success
    console.log("SID: " + msg.from + " reports success on tile transfer - " + msg.conID);
    ce.style.background = "green";
    cs.innerHTML = "Tiles sent to " + msg.from;
  }
  ws_dataState[msg.conID] = null;
  window.setTimeout(function() {
    ce.style.background = "white";
    ce.sending = 0;
  },2000);
}

function ws_receiveTiles(msg,stage) {
  var ok = "1";
  var dialect = document.getElementById('dialect').value;
  if (msg.dia != dialect) {
    ok = "0";
  }

  var windex = parseInt(msg.win);

  if (ok == "1") {
    //Process tiles
    loadJSON(msg.tiles,msg.win,true,msg.tileCount);
  }


  websock.send(JSON.stringify({"toS":msg.from,"trep":"1","ok":ok,"conID":msg.conID,"win":msg.win}));
  //Con Menu Status Change?
}

function ws_byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

function ws_announce(id) {
  if (!ws_auth && !ws_hub) { return; }
  if (id == 0) {
    //Id request
    websock.send(JSON.stringify({"toH":ws_hubName + "@" + ws_cid,"announce":"1"}));
    console.log("Sent idreq");
  } else if (id == 1) {
    //Id response
    websock.send(JSON.stringify({"toH":ws_hubName + "@" + ws_cid,"idrep":ws_sid}));
    console.log("Sent idrep");
  }
}

function ws_reset() {
  ws_auth = false;
  ws_sid = null;
  ws_hub = false;
  ws_sending = false;
  // for (i = 0; i < windowMax; i++) {
    // closeAllMenus(i,"con");
  // }
}


function ws_updateConStatus(state, txt, override) {
  ws_conState = state;
  conMenuUpdateStatus(state);
}



function ws_handleClose(msg) {
  ws_reset();
  if (ws_err) {
    if (ws_attempt >= ws_attempts) {
      console.log("WS closed" + (msg == null ? "" : ": " + msg) + ". Switching to network " + (ws_network+1));
      ws_network++;
    } else {
      ws_attempt++;
    }
    ws_err = 0;
    ws_startWebSocket();
  } else {
    ws_attempt = 0;
    console.log("WS closed timeout / close()");
    ws_updateConStatus(0,"Not Connected.");
  }
}

function ws_forceClose() {
  console.log("WebSocket - Terminated");
  ws_attempt = 0;
  ws_reset();
  ws_shutdown();
  ws_updateConStatus(0,"Not Connected.",true);
}

function ws_shutdown() {
  if (websock != null) {
    websock.onclose = function () {}; // disable onclose handler first
    websock.close()
    websock = null;
  }
}