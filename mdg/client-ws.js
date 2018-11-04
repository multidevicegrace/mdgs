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
var ws_err = 0;
var ws_cookie = false;
var ws_hidden = false;
var ws_port = null;
var ws_address = "multi-device-grace.herokuapp.com";
var ws_protocol = "wss";
var ws_type = "Desktop";


//Read vars from config
if (c_hub) { ws_hubName = c_hub; }


function ws_startWebSocket() {
  conState = 1;
  console.log("WebSocket - Connecting...");
    var addr = ws_protocol + "://" + ws_address;
 
  websock = new WebSocket(addr);
  if (conStatus) { conStatus.innerHTML = "Connecting..."; }

  //Message Handlers
  websock.onopen = function(evt) { ws_handleOpen(); }
  websock.onmessage = function(evt) {
      ws_handleMessage(evt.data);
  }
  websock.onerror = function(evt) {
    ws_err = 1;
    if (websock != null) {
      console.log("WS Error: " + evt.data);
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
    ws_cid = "";    
    ws_addCookie(true);
    ws_handleOpen();
  } else if (msg.auth) {
    //Auth
    ws_sid = msg.auth;
    if (ws_hidden) {
      ws_name = "Admin";
    } else {
      ws_name = ws_sid + ". " + ws_nameList[Math.floor(Math.random()*ws_nameList.length)];
    }
    console.log("WebSocket - Authenticated: " + ws_name);

    ws_auth = true;
    ws_addCookie();
    ws_joinHub();
  } else if (msg.jhub) {
    //Join Hub
    console.log("WebSocket - Joined hub");
    ws_hub = true;
    conMenuStatusRequest(2);
  } else if (msg.lhub) {
    removeFromConMenu(msg.lhub);
    console.log("SID: " + msg.lhub + " left hub.");  
  } else if (msg.sreq) {    
    if (ws_hidden) { return; }
    ws_statusResponse(msg.from);
    if (msg.hidden) { return; }
    updateConMenu(msg.name,msg.dia,msg.win,msg.wina);    
  } else if (msg.drep) {
      //Dialect change announcement
    ws_receiveDialectChange(msg);
  } else if (msg.wrep) {
    ws_receiveWindowChange(msg);
  } else if (msg.srep) {        
    updateConMenu(msg.name,msg.dia,msg.win,msg.wina);
  } else if (msg.tdat) {        
    ws_receiveTiles(msg,0);
  } else if (msg.trep) {    
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

function ws_addCookie(b) {
  //Add cid cookie if it does not exist
  if (ws_cookie && !b) { return; }
  document.cookie = "cid=" + ws_cid;
}

function ws_sendDialectChange() {
  if (ws_hidden) { return; }
  var dialect = document.getElementById('dialect').value;
  websock.send(JSON.stringify({"toH":ws_hubName,"drep":"1","dia":dialect}));
}

function ws_receiveDialectChange(msg) {  
  updateConMenuDialect(msg.from,msg.dia);  
}

function ws_receiveWindowChange(msg) {   
  updateConMenuWindows(msg.from,msg.win,msg.wina);  
}

function ws_self() {
  if (!websock || !ws_auth) { return "Not Connected"; }
  var d = getDialect();
  if (d == "") { d = "standard"; }
  return ws_name + " - " + capitalizeFirstLetter(d);
}

function ws_joinHub() {
  if (!ws_auth) { return; }
  websock.send(JSON.stringify({"jhub":ws_hubName}));
}

function ws_handleOpen() {
  //Authenticate
  if (!ws_auth && !ws_hub) {
    ws_attempt = 0;
    if (!ws_cid) {
      //Try to get from cookie
      var b = ws_getCookie();
      if (!b) {
        var c = prompt("Enter client id");
        if (!c) { ws_forceClose(); return; }
        while (c.length < ws_cid_length) {
          c = "0" + c;
        }
        ws_cid = c;
      } else {
        ws_cookie = true;
      }
    }
    websock.send(JSON.stringify({"auth":ws_cid,"type":ws_type}));
  }
}

function ws_statusRequest() {
  if (!websock) { return false; }
  if (!ws_auth || !ws_hub) { return false; }
  websock.send(JSON.stringify({"toH":ws_hubName,"sreq":"1","dia":getDialect(),"win":"1","wina":["1"],"name":ws_name,"hidden":ws_hidden}));
  return true;
}

function ws_admin(i) {
  ws_forceClose();
  ws_hidden = true;
  ws_cid = i;
  ws_type = "Admin";
  ws_startWebSocket();
}

function ws_statusResponse(sid,conID) {
  var win_active = ["1"];
  var dialect = document.getElementById('dialect').value;
  websock.send(JSON.stringify({"toS":sid,"srep":"1","win":"1","wina":win_active,"dia":dialect,"name":ws_name}));
}

function ws_sendTilesState(conID) {
  if (ws_dataState[conID] != 1) {
    return true;
  } else {
    return false;
  }
}

function ws_sendTiles(sid, dialect, conID, tileData, win, tileCount) {
  //Send tiles to SID over WebSocket
  console.log("TileData Length: " + tileData.length);
  if (tileData.length > 200000) {
    console.log("Too much tile data to send: " + tileData.length);
    return false;
  }
  ws_dataState[conID] = 1;
  if (!win) { win = "0"; }

  console.log("Tiles: "  + tileCount);
  
  websock.send(JSON.stringify({"toS":sid,"tdat":"1","dia":dialect,"conID":conID,"win":win,"tileCount":tileCount,"tiles":tileData}));
  return true;
}

function ws_sendTilesDone(msg) {
  var ce = document.getElementsByClassName(msg.from+"w" + (parseInt(msg.win)+1))[0];
  if (msg.ok == "0") {
    //Failed    
    ce.style.background = "red";
    conStatus.innerHTML = "Failed to send tiles to " + msg.from;
  } else if (msg.ok == "1") {
    //Success    
    ce.style.background = "green";
    conStatus.innerHTML = "Tiles sent to " + msg.from;
  }

  window.setTimeout(function() {
    ce.style.background = "white";
    ce.sending = 0;
  },2000);
}

function ws_receiveTiles(msg,stage) {
  var ok = "1";
  var dialect = document.getElementById('dialect').value;
  var err = "";
  if (msg.dia != dialect) {
    ok = "0";
    err = "Different Dialect";
  }
  console.log("Tiles: " + msg.tileCount + ", OK: " + ok);
  // console.log("TileData: " + msg.tiles);

  if (ok == "1") {
    //Process tiles
    loadJSON(msg.tiles,true,msg.tileCount);
  }

  var sid;  
  websock.send(JSON.stringify({"toS":msg.from,"trep":"1","ok":ok,"conID":msg.conID,"win":msg.win}));
  sid = msg.from;
  conStatus.innerHTML = "Received tiles from " + sid;
}



function ws_byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

function ws_announce(id) {
  if (!ws_auth && !ws_hub) { return; }
  if (id == 0) {
    //Id request
    websock.send(JSON.stringify({"toH":ws_hubName + "@" + ws_cid,"announce":"1"}));
    // console.log("Sent idreq");
  } else if (id == 1) {
    //Id response
    websock.send(JSON.stringify({"toH":ws_hubName + "@" + ws_cid,"idrep":ws_sid}));
    // console.log("Sent idrep");
  }
}

function ws_reset() {
  ws_auth = false;
  ws_sid = null;
  ws_hub = false;
}

function ws_handleClose(msg) {
  ws_reset();
  if (ws_err) {    
    ws_err = 0;
    ws_startWebSocket();
  } else {
    // console.log("WS closed timeout / close()");    
    ws_attempt = 0;
    ws_updateConStatus(0,"Not Connected.");
    ws_startWekSocket();
  }
}

function ws_forceClose() {
  console.log("WebSocket - Terminated");
  ws_attempt = 0;
  ws_reset();
  ws_shutdown();
  conState = 0;
  ws_hidden = false;
  if (conStatus) { conStatus.innerHTML = "Not Connected."; }
}

function ws_shutdown() {
  if (websock != null) {
    websock.onclose = function () {}; // disable onclose handler first
    websock.close()
    websock = null;
  }
}