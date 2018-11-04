var rad = Math.PI / 180;
var pieces = 4;
var max = 360;
var start = 0;
var currentExtend = -1;
var colours = ["red", "green", "blue", "pink", "orange", "khaki", "plum", "olive", "peru", "darkslategray"];
var closePieDelay = 50;
var ops = ["+","-","/","*","^","%"];
var comps = ["==","!=","<",">","<=",">="];
var sec1 = "a";
var sec2 = "a";
var pie1 = "a";
var pie2 = "a";
var pieE1 = "a";
var pieE2 = "a";
var curDialect = 0;
var curSample = 0;
var pieM = 200;
var maxPie = 355;
var maxSec = 355;
var currentView = 0;
var conID = 0;
var pieMenuSafeDistance = 280;

var tileList = [];

var pieMenus = [];
var tileMenus = [];
var secMenus = [];
var conMenus = [];
var pieMenu;
var tileMenu;
var secMenu;
var conMenu;
var currentMenu;

var devices = 0;
var devicesMax = 6;
var devNums = null;
var devList = null;
var conMenuRadius = 70;
var conMenuButtonRadius = 20;
var conWidth = 250;
var conHeight = 281;
var conOffsetX = 27;
var conOffsetY = 29;
var conState = 0;
var secW = document.getElementById('sec_svg').getAttribute("width");
var secH = document.getElementById('sec_svg').getAttribute("height");
var pieW = document.getElementById('pie_svg').getAttribute("width");
var pieH = document.getElementById('pie_svg').getAttribute("height");
var tileW = document.getElementById('tile_svg').getAttribute("width");
var tileH = document.getElementById('tile_svg').getAttribute("height");

var selectedTiles = [];


var v1 = function() { mouse = 1; windowMenuClick(0,0,1,0); windowMenuClick(0,0,1,0); };
var v2 = function() { mouse = 1; windowMenuClick(0,0,1,0); windowMenuClick(0,0,1,0); loadSample("turtlehousec",0) };
var v3 = function(x,y,p) {
  if (!x) { x = 500; }
  if (!y) { y = 500; }
  if (!p) { p = 0; }
  var y = [tiles2[0][0],tiles2[0][17],tiles2[0][19],tiles2[0][23]];
  y.forEach(function(e) { e.classList.add(highlight);e.highlight=[0];})
  var polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline'); //Create a path in SVG's namespace
  var line = document.createElementNS("http://www.w3.org/2000/svg", 'line'); //Create a path in SVG's namespace
  a_svgs[0].appendChild(polyline);
  a_svgs[0].appendChild(line);
  polys[p] = {p:polyline,l:line,w:0};
  showTileMenu(x,y,{windex:0,id:p},y)
  return y;
}

function closeAllMenus(id,scope) {
  if (system_mode == 0) {
    var m;
    var target = "piemenu";
    if (scope) { target = scope; }
    if (id >= 0 && id < 4) {
      m = windows[id].getElementsByClassName(target);
    } else {
      m = document.getElementsByClassName(target);
    }

    for (var i = 0; i < m.length;) {
      m[i].parentNode.removeChild(m[i]);
    }
  } else {
    if (currentMenu != null) {
      currentMenu.style.display = "none";
      currentMenu = null;
    }
  }
}

function hasConMenus() {
  return (conMenus != null && conMenus.length != 0) || (conMenu != null && conMenu.style.display == "");
}

function removeFromConMenu(sid,conID) {
  console.log("Remove from Con: " + sid  + ", " + conID);
  var cons = conMenus;
  if (system_mode == 1 && conMenu != null) {
    cons = [conMenu];
  }

  for (i = 0; i < cons.length; i++) {
    //Get menu element container - Only 1 per menu
    var mec = cons[i].getElementsByClassName("conmenubody")[0];
    for (j = 0; j < mec.childElementCount; ) {
      if (mec.children[j].sid == sid || sid == -1) {
        mec.removeChild(mec.children[j]);
      } else {
        j++;
      }
    }
  }

  if (sid != -1) {
    var index = devList.indexOf(sid+"");
    devList.splice(index,1);
    devNums.splice(index,1);
    devices = nextNum(devNums);
  } else {
    devNums = null;
    devList = null
    devices = 0;
  }
  conMenuUpdateStatusText("Found " + devices + " devices.");
  return;
}

//Array remove function
Array.prototype.remove = function(e) {
  var index = this.indexOf(e);
  if (index != -1) {
    return this.splice(index,1);
  }
};

function nextNum(arr) {
  if (arr == null || arr.length == 0) {
    return 0;
  } else if (arr.length == devicesMax-1) {
    return devicesMax;
  } else {
    var i = 0;
    for (i = 0; i < devicesMax; i++) {
      if (!arr.includes(i)) { return i; }
    }
    return i;
  }
}

function conMenuUpdateTitle() {
  var cons = getConMenus();
  for (i = 0; i < cons.length; i++) {
    var ct = cons[i].getElementsByClassName("contitle")[0];
    ct.innerHTML = ws_self();
  }
}

var dialectElement;
function getDialect() {
  if (!dialectElement) { dialectElement = document.getElementById('dialect'); }
  return dialectElement.value;
}

function getDialectClean() {
  var dialect = getDialect();
  if (dialect == "") { dialect = "standard"; }
  return capitalizeFirstLetter(dialect);
}

function conMenuUpdateStatusText(msg) {
  var cons = getConMenus();
  for (i = 0; i < cons.length; i++) {
    var conStatus = cons[i].getElementsByClassName("constatus")[0];
    conStatus.innerHTML = msg;
  }
}

function getConMenus() {
  var cons = conMenus;
  if (system_mode == 1 && conMenu != null) {
    cons = [conMenu];
  }
  return cons;
}

function conMenuUpdateStatus(state) {
  if (state == 2) {

    conMenuUpdateStatusText("Searching for devices...");
    window.setTimeout(function() {
      conMenuUpdateStatusText("Found " + devices + " devices.");
    },3000);

    if (conState != state) {
      conMenuUpdateTitle();
      ws_statusRequest();
    } else {
      removeFromConMenu(-1);
    }
  } else if (state == 1) {
    conMenuUpdateStatusText("Connecting...");
  } else if (state == 0) {
    conMenuUpdateStatusText("Disconnected");
  }
  conState = state;
}

function conMenuStatusRequest() {
  if (ws_conState == 2) {
    conMenuUpdateStatus(2);
    ws_statusRequest();
  } else if (ws_conState == 0) {
    // conMenuUpdateStatus(1);
    ws_startWebSocket();
  }
}


function sendTiles(event) {
  if (!websock) { console.log("Not connected."); return "Not connected"; }
  if (event.target.sending) { console.log("Already sending"); return "Already sending tiles"; }
  var dialect = document.getElementById('dialect').value;
  if (event.target.targetDialect != dialect) { return event.target.sid + " has different dialect.";}

  var tile = event.target.tileSrc;
  var con = event.target.conID;
  var windex = event.target.targetWindex;
  var windex0 = event.target.windex;
  if (!ws_sendTilesState(con)) {
    return "This menu is already transfering data.";
  }
  var data = null;
  var polyID;
  var count = 0;

  if (tile) {
    data = [tile];
    count = 1;
    polyID = -1;
  } else if (event.target.tileGroup) {
    data = event.target.tileGroup;
    polyID = event.target.polyID;
    count = data.length;
  } else {
    data = [];
    tiles2[windex0].forEach(function(e) {
      if (e.classList.contains(highlight)) {
        data.push(e);
      }
    });
    polyID = -2;
    count = data.length;
    if (count == 0) { return "No tiles selected"; }
  }
  for (var i = 0; i < data.length; i++) {
    count += data[i].getElementsByClassName('tile').length;
  }

  data = generateJSObjectFromSelected(data,windex,polyID);

  event.target.setAttribute("id", con + "#");
  event.target.style.fill = "yellow";
  ws_sendTiles(event.target.sid,dialect,con,windex,data,count);
  showAnim(windex0,polyID,tile);
  console.log("Send TO: " + event.target.sid + ", Data Length: " + data.length + ", Data: " + data);
  return "OK";
}

//polyID: -1 = single tile, -2 = all selected tiles
function generateJSObjectFromSelected(tiles,windex,polyID) {
    if (tiles.length == 0) { return null; }
    var chunks = [];
    for (var i=0; i < tiles.length; i++) {
      var tile = tiles[i];
      var a = polyID != -1;
      if (a) {
        var b = tile.prev != false && tile.prev.classList.contains(highlight);
        if (b) {
          var c = polyID == -2;
          var d = !c && tile.prev.highlight != null && tile.prev.highlight.includes(polyID);
          if (c || d) {
            continue;
          }
        }
      }

      var xy;
      if (tile.parentNode != codearea2[windex]) {
        xy = findOffsetTopLeft(tile);
        xy.left += "px";
        xy.top += "px";
      } else {
        xy = {left:tile.style.left,top:tile.style.top};
      }

      var elements = [];
      while ((polyID == -1) || (tile && tile.classList.contains(highlight))
            && (((polyID != -2 && tile.highlight != null) && tile.highlight.includes(polyID))
            || (polyID == -2))) {
        elements.push(generateNodeJSON(tile));
        if (polyID == -1) { break; }
        tile = tile.next;
      }
      chunks.push({type: 'chunk', x: xy.left, y: xy.top, body: elements});
    }
    var dialect = getDialect();
    var h = generateHash({chunks: chunks, dialect: dialect},null,2);
    return decodeURIComponent(atob(h.substring(1)));
}


function updateConMenu(name,dialect,winCount,winActive) {
  console.log("ucm: " + name + "," + dialect + "," + winCount + "," + winActive);

  var sid = ("" + name).split('.')[0];
  var device = devices;

  if (device == devicesMax) {
    console.log("Too many devices for conMenu: " + conID + ", devices: " + devices);
    return;
  }

  if (devNums == null) {
    devNums = [0];
    devList = [sid];
    devices = 1;
  } else {
    if (devList.includes(sid)) { return; }
    devNums.push(devices);
    var devNum = nextNum(devNums);
    devices = devNum;
    devList.push(sid);
  }

  var cons = conMenus;
  if (cons.length == 0 && conMenu != null) { cons = [conMenu]; }
  if (cons.length == 0) { return; }

  //Text
  var fs = "25px";
  var disable = [];
  for (i = 0; i < winCount; i++) {
    disable.push(!winActive.includes((i+1)+""));
  }
  console.log("disable: " + disable);

  for (i = 0; i < cons.length; i++) {
    var svg = cons[i];
    var conMenuBody = svg.getElementsByClassName("conmenubody")[0];
    var de = document.createElement("div");
    var ce = document.createElement("p");

    applyStyle(ce,1);
    ce.innerHTML = (name.substring(0,13) + "<br>" + capitalizeFirstLetter(dialect == "" ? "Standard" : dialect));
    ce.style.width = "40%";
    ce.style.overflow = "hidden";
    ce.BG = ce.style.background;
    ce.style.boxSizing = "border-box";
    de.style.background = "#c4c4d7";
    de.dialect = dialect
    de.style.overflow = "hidden";
    de.winActive = winActive;
    de.setAttribute("class","cme" + sid);
    de.style.height = "36px";
    ce.style.width = "100px";
    ce.style.height = "36px";
    ce.style.pointerEvents = "none";
    de.sid = sid;
    ce.style.float = "left";
    de.appendChild(ce);
    conMenuBody.appendChild(de);

    var buttons = [];
    for (j = 0; j < winCount;j++) {
      var c = document.createElement("input");
      c.setAttribute("type","button");
      c.setAttribute("value",j+1);
      c.style.width = ((250-100)/winCount) + "px";
      c.setAttribute("class",sid+"w"+(j+1));
      c.style.height = "100%";
      c.targetDialect = dialect;
      c.windex = svg.windex;
      c.conID = svg.conID;
      c.sid = sid;
      c.style.border = "groove";
      c.style.borderRadius = "3px";
      c.disabled = disable[j];
      c.targetWindex = j;
      c.tileSrc = svg.tileSrc;
      c.tileGroup = svg.tileGroup;
      c.polyID = svg.polyID;

      //Onclick
      c.addEventListener("click",
      function(event) {
        if (!mouse) { return; }
        var b = sendTiles(event);
        if (b != "OK") {
          updateConMenuStatusText(b,svg);
          event.target.style.background = "red";
          window.setTimeout(function() {
            event.target.style.background = "white";
          },500);
        }
      });
      c.addEventListener("touchend", function(event) {
        var b = sendTiles(event);
        if (b != "OK") {
          updateConMenuStatusText(b,svg);
          event.target.style.background = "red";
          window.setTimeout(function() {
            event.target.style.background = "white";
          },500);
        }
      });

      de.appendChild(c);
    }
  }
  conMenuUpdateStatusText("Found " + devices + " devices.");
}

function updateConMenuStatusText(msg,con) {
  if (!con) { return; }
  con.getElementsByClassName('constatus')[0].innerHTML = msg;
}



function updateConMenuDialect(sid,dia) {
  var cons = conMenus;
  if (cons.length == 0 && conMenu != null) { cons = [conMenu]; }
  if (cons.length == 0) { return; }

  var dialect = capitalizeFirstLetter(dia == "" ? "Standard" : dia);
  for (i = 0; i < cons.length; i++) {
    var cme = cons[i].getElementsByClassName("cme" + sid)[0];
    if (!cme) { continue; }
    var split = cme.children[0].innerHTML.split("<br>");
    cme.children[0].innerHTML = (split[0].substring(0,11)) + "<br>" + dialect;
    Array.prototype.forEach.call(cme.getElementsByTagName("input"), function(el) {
    console.log("Dia: " + el);
    el.targetDialect = dia;
  });
  }



}

function updateConMenuWindows(sid,win,wina) {
  var cons = conMenus;
  if (cons.length == 0 && conMenu != null) { cons = [conMenu]; }
  if (cons.length == 0) { return; }

  var disable = [];
  for (i = 0; i < win; i++) {
    disable.push(!wina.includes((i+1)+""));
  }
  console.log("wina: " + wina + ", disable: " + disable);

  var winTxt = "Windows: " + win + "(" + wina + ")";
  for (i = 0; i < cons.length; i++) {
    var cme = cons[i].getElementsByClassName("cme" + sid)[0];
    for (j = 0; j < win; j++) {
      cme.children[j+1].disabled = disable[j];
    }
  }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function closeCurrentMenu(b) {
  if (currentMenu == null) { return; }

  var z = "pie";
  if (currentMenu.classList.contains("tile")) { z = "tile"; }
  if (currentMenu.classList.contains("con")) { z = "con"; }  
  if (currentMenu.classList.contains("sec")) { z = "sec"; }
  
  // mdebug("| ccm " + z);
  if (system_mode == 1) {
    if (currentMenu.tileSrc || currentMenu.tileGroup) {
      if (!b) {        
        // mdebug("ccm2");
        if (!currentMenu.classList.contains('con')) {
          closeMenu(null, currentMenu);
          currentMenu.style.display = "none";
          currentMenu = null;
          return;
        }
      }
    }
  }


  if (currentMenu.classList.contains("con")) {
    //
  } else if (currentMenu.classList.contains("pie")) {
    //Reset expanded segments
    var idx = currentMenu.getAttribute("idx") || -1;
    if (idx != -1) {
      currentMenu.setAttribute("idx",-1);
      for (i = 0; i < currentMenu.childElementCount; i++) {
        if (currentMenu.children[i].getAttribute('idx') != null) {
          menuExtend(-1,currentMenu.children[i]);
          break;
        }
      }
    }
  } else if (currentMenu.classList.contains("sec")) {
    //Reset expanded segments
    expandSecMenu(currentMenu,-1);
  } else if (currentMenu.classList.contains("tile")) {
    //
  }

  currentMenu.style.display = "none";
  currentMenu = null;
}

function showConMenu(x,y,src,tiles,polyID,w,zIndex) {
  //Create Menu
  var windex = (src != null ? src.windex : w);
  console.log("Windex: " + windex);
  removeFromConMenu(-1,conID);

  var con = conMenu;
  if (con == null) {
    con = document.createElement("div");
    con.setAttribute("class", "con piemenu");
    con.setAttribute("id", "con" + conID);
    applyStyle(con,3);
    con.style.zIndex = 999;
    if (zIndex) {
      con.style.zIndex = zIndex;
    }

    //Add Title
    var ct = document.createElement("p");
    ct.setAttribute("class", "contitle");
    ct.innerHTML = ws_self();
    applyStyle(ct,2);
    con.appendChild(ct);

    //Add Status
    var cd = document.createElement("div");
    var cd2 = document.createElement("div");
    applyStyle(cd2,4);
    applyStyle(cd,0);
    var cs = document.createElement("p");
    var s1 = document.createElement("input");
    var s2 = document.createElement("input");
    applyStyle(s1,5);
    applyStyle(s2,5);
    applyStyle(cs,6);

    cd.style.bottom = "0%";
    s1.setAttribute("value", "\u21BB");
    s2.setAttribute("value", "X");
    s1.style.left = "0px";
    s2.style.right = "0px";

    s1.addEventListener("click",function() { if (mouse) conMenuStatusRequest(); });
    s1.addEventListener("touchend",function() { conMenuStatusRequest(); });
    s2.addEventListener("click",function(event,con) { if (mouse) { closeMenu(event,event.target.parentNode.parentNode); } });
    s2.addEventListener("touchend",function(event,con) { closeMenu(event,event.target.parentNode.parentNode); });

    cd2.appendChild(cs);
    cd.appendChild(s1);
    cd.appendChild(cd2);
    cd.appendChild(s2);

    con.appendChild(cd);
    cs.innerHTML = "";
    cs.setAttribute("class","constatus");

    //Add Menu Element Holder
    var conMenuBody = document.createElement("div");
    conMenuBody.setAttribute("class","conmenubody");
    con.insertBefore(conMenuBody,cd);
  }

  if (conMenu == null && system_mode == 1) {
    conMenu = con;
    // closeCurrentMenu(b);
    // currentMenu = conMenu;
  } else if (system_mode == 0) {
    conMenus.push(con);
  }

  if (src == null) { x+= 20; y+= 22; }

  //(Re) position
  con.style.left = (x - (conWidth)*.5) - conOffsetX + "px";
  con.style.top = (y - (conHeight)*.5) - conOffsetY + "px";

  con.style.display = "";
  con.xPoint = x;
  con.yPoint = y;

  //Set properties
  con.tileSrc = src;
  con.polyID = polyID;
  if (polyID != null) {
    // polys[polyID].m = con;
  }
  con.tileGroup = tiles;
  con.setAttribute("ts", Date.now());
  con.devices = 0;

  con.conID = conID;
  codearea2[windex].appendChild(con);
  con.windex = windex;
  conID++;

  //Display
  con.style.display = "";


  //Check connection?
  //Send Status Request...
  conMenuStatusRequest();
  return con;
}


function createConMenu(svg) {
  var w = svg.getAttribute("width");
  var h = svg.getAttribute("height");
  var r0 = conMenuRadius;
  var r = conMenuButtonRadius;
  var xMid = w*.5;
  var yMid = h*.5;
  var y1 = yMid - r0;

  var newElement = null;
  var textElement = null;

  //Central Close Button
  newElement = createCircle(xMid,yMid,r0,"black","0.7","white","2px","all");
  newElement.addEventListener("click",function(event) { if (mouse) { closeMenu(event,svg); } });
  newElement.addEventListener("touchend",function(event) { closeMenu(event,svg); });
  svg.appendChild(newElement);
  svg.appendChild(createLine(xMid-r,yMid-r,xMid+r,yMid+r,"red",5,.5));
  svg.appendChild(createLine(xMid+r,yMid-r,xMid-r,yMid+r,"red",5,.5));


  //Refresh button
  newElement = createCircle(xMid,y1+5,r,"white",1,"black","5px","all",null);
  newElement.setAttribute("class","con-status-icon");
  newElement.addEventListener("click", function(event) { if (mouse) { refreshConMenu(event,svg); }});
  newElement.addEventListener("touchend", function(event) { refreshConMenu(event,svg); });
  if (ws_conState == 0) { newElement.style.fill = "red"; }
  else if (ws_conState == 1) { newElement.style.fill = "yellow"; }
  svg.appendChild(newElement);

  textElement = createText(xMid,y1+5,fixedFromCharCode(0x01F4F6),"entypo","50px","middle");
  textElement.setAttribute("class","con-status-icon-text");
  if (ws_conState == 2) {
    textElement.textContent = "\u2315";
    textElement.style.fontSize = "30px";
  }
  svg.appendChild(textElement);

  //Title
  var rect = createRect(xMid-(188/2),y1-43,10,10,188,30,"black","0.7","white",null,null,null);
  svg.appendChild(rect);

  textElement = createText(xMid,y1-23,ws_self(),"entypo","23px","middle","white");
  textElement.setAttribute("class","con-status-text");
  svg.appendChild(textElement);
}

function refreshConMenu(event,svg) {
  if (ws_conState == 0) {
    ws_startWebSocket();
  } else if (ws_conState == 1) {
    return;
  } else if (ws_conState == 2) {
    if (ws_sending) { return; }
    ws_sending = true;
    removeFromConMenu(-1);
    Array.prototype.forEach.call(document.getElementsByClassName('con-status-icon'), function(el) {
      el.style.fill = "greenyellow";
    });
    ws_statusRequest();
    window.setTimeout(function() {
      if (!ws_sending) { return; }
      Array.prototype.forEach.call(document.getElementsByClassName('con-status-icon'), function(el) {
        el.style.fill = "white";
      });
      ws_sending = false;
    },3000);
  }
}

function showTileMenu(x,y,src,tileGroup,override) {
  // console.log("ShowTileMenu: " + x + "," + y);
  //Delete + Copy
  if (src != null && src.highlight && src.highlight.includes(-1)) { return; }
  var svg0 = document.getElementById('tile_svg');
  var svg = svg0.cloneNode(true);
  if (system_mode == 0) {
    tileMenus.push(svg);
  }

  var rid = windows[src.windex].rid;
  svg.windex = src.windex;

  var pos;
  if (rid != 0) {
    pos = rotateXY(src.windex, rid, x, y);
  } else {
    pos = positionCorrection([x,y],src.windex);
  }
  x = pos[0];
  y = pos[1];
  x += codearea2[src.windex].scrollLeft;
  y += codearea2[src.windex].scrollTop;
  if (!override && !menuAreaCheck(x,y,src.windex,"tile")) { return; }

  svg.removeAttribute('id');
  svg.style.left = (x - svg.getAttribute("width")*.5) + "px";
  svg.style.top = (y - svg.getAttribute("height")*.5) + "px";
  svg.style.display = "";
  svg.xPoint = x;
  svg.yPoint = y;
  if (tileGroup != null) {
    svg.style.zIndex = 1030;
    svg.polyID = src.id;
    // polys[svg.polyID].m = svg;
    svg.tileGroup = tileGroup;
  } else {
    svg.tileSrc = src;
    if (src.highlight == null || src.highlight.length == 0) {
      src.highlight = [-1];
      src.classList.add(highlight);
    } else {
      if (!src.highlight.includes(-1)) {
        src.highlight.push(-1);
      }
    }
  }
  svg.setAttribute("class","piemenu");
  codearea2[src.windex].appendChild(svg);
  svg.setAttribute("ts", Date.now());
  createTileMenu(svg);
  if (system_mode == 1) {
    closeCurrentMenu(override);
    currentMenu = svg;
  }
  return svg;
}

//Function that allows for 5 digit unicode chars
function fixedFromCharCode (codePt) {
  if (codePt > 0xFFFF) {
    codePt -= 0x10000;
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  } else {
    return String.fromCharCode(codePt);
  }
}

function createTileMenu(svg) {
  var w = svg.getAttribute("width");
  var h = svg.getAttribute("height");
  var r0 = 70;
  var r = 20;
  var r3 = 110;
  var r4 = 125;
  var xMid = w*.5;
  var yMid = h*.5;
  var diagonal = .7071;
  var d4x = .342;
  var d4y = .940;
  var windex = svg.windex;
  var newElement, textElement;

  //Back
  newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
  newElement.style.stroke = "white"; //Set stroke colour
  newElement.style.strokeWidth = "2px"; //Set stroke width
  newElement.setAttribute("cx", xMid);
  newElement.setAttribute("cy", yMid);
  newElement.setAttribute("r", r0);
  newElement.style.fill = "black";
  newElement.style.fillOpacity = "0.5";
  newElement.addEventListener("click", function(event) { if (mouse) { closeMenu(event) }});
  newElement.addEventListener('touchend', closeMenu);
  newElement.style.pointerEvents = "all";
  svg.appendChild(newElement);

  createCancelButton(svg,xMid,yMid);

  //Delete
  var ee = createTileMenuElement(svg,"\uE729",xMid,yMid-r0,r,"50px");
  ee[0].addEventListener("click", function(event) { if (mouse) { deleteTile(event,svg); }});
  ee[0].addEventListener("touchend", function(event) { deleteTile(event,svg); });
  ee[1].style.fontFamily = "entypo";

  //Open Connection Menu
  ee = createTileMenuElement(svg,fixedFromCharCode(0x01f4f6),xMid-r0*diagonal,yMid-r0*diagonal,r,"50px");
  ee[0].addEventListener("click", function(event) {
    if (!mouse) { return; }
    showConMenu(svg.xPoint,svg.yPoint,svg.tileSrc,svg.tileGroup,svg.polyID,windex,svg.style.zIndex);
    closeMenu(event, null, true);
  });
  ee[0].addEventListener("touchend", function(event) {
    showConMenu(svg.xPoint,svg.yPoint,svg.tileSrc,svg.tileGroup,svg.polyID,windex,svg.style.zIndex);
    closeMenu(event, null, true);
  });
  ee[1].style.fontFamily = "entypo";

  if (system_mode == 0) {
    //Send to other workspace
    ee = createTileMenuElement(svg,"\uE74D",xMid,yMid+r0,r,"50px");
    ee[1].style.fontFamily = "entypo";
    ee[0].addEventListener("touchend", function(event) {
      var t = svg.getElementsByClassName('moveTileButton');
      for (var i = 0; i < t.length; i++) {
        if (t[i].style.display == "") {
          t[i].style.display = "none";
        } else {
          t[i].style.display = "";
        }
      }
    });

    //
    var xL = [xMid-r3*diagonal,xMid-r3*diagonal*.5,xMid+r3*diagonal*.5,xMid+r3*diagonal];
    var yL = [yMid+r3*diagonal,yMid+r3*diagonal*1.2,yMid+r3*diagonal*1.2,yMid+r3*diagonal];
    for (var i = 0; i < 4; i++) {
      ee = createTileMenuElement(svg,i+1,xL[i],yL[i],r,"40px");
      ee[1].style.fontFamily = "entypo";
      ee[0].idx = i;
      ee[0].windex = windex;

      if (i == windex) {
        //Disabled
        ee[1].style.stroke = "lightgrey";
        ee[0].style.fill = "grey";
      } else {
        var t = svg.tileGroup;
        if (!t) { t = [svg.tileSrc]; }
        ee[0].addEventListener("click", function(event) { if (mouse) {
          moveTileToWindow(event.target.windex,event.target.idx,t);
          closeMenu(event);
        }});
        ee[0].addEventListener("touchend", function(event) {
          moveTileToWindow(event.target.windex,event.target.idx,t);
          closeMenu(event);
        });
      }
      ee[0].style.display = "none";
      ee[0].setAttribute('class', 'moveTileButton');
      ee[1].setAttribute('class', 'moveTileButton');
      ee[1].style.display = "none";
    }
  } else if (system_mode == 1) {
    /* //Copy
    ee = createTileMenuElement(svg,fixedFromCharCode(0x01F54E),xMid-r0*d4x,xMid,r,"40px");
    newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
    newElement.style.stroke = "black"; //Set stroke colour
    newElement.style.strokeWidth = "5px"; //Set stroke width
    newElement.setAttribute("cx", xMid-r0*d4x);
    newElement.setAttribute("cy", yMid+r0*d4y);
    newElement.setAttribute("r", r);
    newElement.style.fill = "white";
    // newElement.addEventListener("click", function(event) { if (mouse) cloneTile(event,svg.tileSrc); });
    // newElement.addEventListener("touchend", function(event) { cloneTile(event,svg.tileSrc); });
    svg.appendChild(newElement);
    newElement.style.pointerEvents = "all";

    textElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
    textElement.style.fontFamily = "entypo";
    newElement.windex = windex;
    textElement.setAttribute("x", xMid-r0*d4x);
    textElement.setAttribute("y", yMid+r0*d4y);
    textElement.setAttribute("text-anchor", "middle");
    if (mobile) {
      textElement.setAttribute("alignment-baseline", "central"); //Chrome
      textElement.setAttribute("dominant-baseline", "central");  //Firefox
    } else {
      textElement.setAttribute("alignment-baseline", "middle"); //Chrome
      textElement.setAttribute("dominant-baseline", "middle");  //Firefox
    }
    textElement.setAttribute("pointer-events", "none");
    textElement.textContent = fixedFromCharCode(0x01F54E);
    textElement.style.fontSize = "80px";
    newElement.style.strokeWidth = "2px"; //Set stroke width
    newElement.addEventListener("click", function(event) { if (mouse) {
      cloneTile(event,svg.tileSrc);
      closeMenu(event);
    }});
    newElement.addEventListener("touchend", function(event) {
      cloneTile(event,svg.tileSrc);
      closeMenu(event);
    });
    newElement.setAttribute('class', 'moveTileButton');
    textElement.setAttribute('class', 'moveTileButton');
    svg.appendChild(textElement); */
  }

  //Tiles with additional options
  // == < > <= >= !=     6    class: CMPOP
  // + - * / ^ %         6    class: OP
  // && and || is possible through code, but breaks the block version
  ee = createTileMenuElement(svg,"\uF12B",xMid-r0*diagonal,yMid+r0*diagonal,r,"25px");
  ee[0].addEventListener("touchend", function(event) {
    var t = svg.getElementsByClassName('symbolTileButton');
    for (var i = 0; i < t.length; i++) {
      if (t[i].style.display == "") {
        t[i].style.display = "none";
      } else {
        t[i].style.display = "";
      }
    }
  });
  ee[1].style.fontFamily = "fontello";

  var tileOp = false;
  if (svg.tileSrc) {
    var xL = [xMid-r4,xMid-r4*.951,xMid-r4*.809,xMid-r4*.588,xMid-r4*.309,xMid];
    var yL = [yMid,yMid+r4*.309,yMid+r4*.588,yMid+r4*.809,yMid+r4*.951,yMid+r4];
    var t;
    if (svg.tileSrc.classList.contains("comparison-operator")) {
      var opTxt = 7;
      tileOp = true;
      var tileToChange = svg.tileSrc.children[1];
      if (comps.includes(tileToChange.innerHTML)) {
        for (var z = 0; z < 6; z++) {
          createTileMenuOpElement(svg,comps[z],xL[z],yL[z],r,opTxt,tileToChange);
        }
      }
    } else if (svg.tileSrc.classList.contains("operator")) {
      var opTxt = 7;
      tileOp = true;
      var tileToChange = svg.tileSrc.children[1];
      if (ops.includes(tileToChange.innerHTML)) {
        for (var z = 0; z < 6; z++) {
          createTileMenuOpElement(svg,ops[z],xL[z],yL[z],r,opTxt,tileToChange);
        }
      }
    }
  }
  if (!tileOp) {
    ee[0].style.fill = "grey";
    ee[1].style.stroke = "lightgray";
  }

  //Copy
  ee = createTileMenuElement(svg,fixedFromCharCode(0x01F54E),xMid+r0*diagonal,yMid-r0*diagonal,r,"85px");
  ee[0].addEventListener("touchend", function(event) {
    console.log("Copy");
    if (svg.tileSrc) {
      cloneTile(event,svg.tileSrc);
      closeMenu(event);
    } else if (svg.tileGroup) {
      var newTiles = [];
      for (var j = 0; j < svg.tileGroup.length; j++) {
        newTiles.push(cloneTile(event,svg.tileGroup[j],true));
        if (j > 0 && svg.tileGroup[j].prev && svg.tileGroup[j].prev.classList.contains(highlight) &&
              svg.tileGroup[j].prev.highlight.includes(svg.polyID)) {
          newTiles[j].prev = newTiles[j-1];
          newTiles[j-1].next = newTiles[j];
        }
      }
      closeMenu(event);
      removePoly(svg.polyID);
      updateTileIndicator(svg.windex);
      generateCode(svg.windex);
      reflow(svg.windex);
      checkpointSave(svg.windex);
      clearPopouts(svg.windex);
      svg.parentNode.removeChild(svg);
      overlays2[svg.windex].style.display = 'none';
    }
  });
  ee[1].style.fontFamily = "entypo";

  //Group
  ee = createTileMenuElement(svg,"\uE005",xMid+r0,yMid,r,"50px");
  if (svg.tileGroup) {
    ee[0].addEventListener("touchend", function(event) {
      console.log("Group");
      groupTiles(svg.tileGroup,svg.windex);
      closeMenu(event);
    });
  } else {
    ee[0].style.fill = "grey";
    ee[1].style.stroke = "lightgray";
  }
  ee[1].style.fontFamily = "entypo";

  //Collapse
  ee = createTileMenuElement(svg,"\uF0C9",xMid+r0*diagonal,yMid+r0*diagonal,r,"30px");
  ee[0].addEventListener("touchend", function(event) {
    console.log("Collapse");
    if (svg.tileGroup) {
      collapseTiles(svg.tileGroup,svg.windex);
    } else {
      collapseTiles([svg.tileSrc],svg.windex);
    }
  });
  ee[1].style.fontFamily = "fontello";

  tile_created = 1;
}

function groupTiles(selectedTiles,windex) {
  if (selectedTiles.length < 2) { return; }

  var ts = [];

  //Remove current prev + next
  var ax = 0;
  for (var i = 0; i < selectedTiles.length; i++) {
    if (selectedTiles[i].parentNode != codearea2[windex]) { continue; }
    var p = selectedTiles[i];
    var xy = findOffsetTopLeft(selectedTiles[i]);
    var counter = 0;
    console.log("Group:" + p.children[0].value + (p.prev) + " " +  (p.prev ? p.prev.classList : ""));
    while (p.prev && p.prev.classList && p.prev.classList.contains(highlight)) {
      counter++;
      xy = findOffsetTopLeft(p.prev);
      xy.top += counter * 0.01;
      p = p.prev;
    }
    ts.push({"t":selectedTiles[i],"y":xy.top});
    ax += xy.left;
  }
  ax /= ts.length;

  //Order by y position
  ts.sort(compareTileTop);

  for (var i = 0; i < ts.length; i++) {
    if (ts[i].next) { ts[i].next.prev = false; ts[i].next = false; }
    if (ts[i].prev) { ts[i].prev.next = false; ts[i].prev = false; }
  }

  ax -= ts[0].t.offsetWidth / 2;
  var y = ts[0].t.offsetTop;
  var offset = 20;
  for (var i = 0; i < ts.length; i++) {
    ts[i].t.style.left = ax + offset + "px";
    ts[i].t.style.top = y + offset + "px";
    y += ts[i].t.style.offsetHeight;
    if (i != 0) {
      ts[i].t.prev = ts[i-1].t;
      ts[i-1].t.next = ts[i].t;
    }
  }
  generateCode(windex);
  checkpointSave(windex);
  reflow(windex);
}

var ts = [];
function collapseTiles(tiles,windex) {
  var cts = tiles;

  var a = false; // ??

  ts = [];
  //Reduce to collapsable tiles
  for (var i = 0; i < cts.length; i++) {
    if (cts[i].parentNode != codearea2[windex]) { continue; }
    if (cts[i].cflag == 1) { continue; }
    var c = 0;
    var cc = 1;
    var holes = cts[i].getElementsByClassName('hole multi');
    for (var j = 0; j < holes.length; j++) {
      c += holes[j].childElementCount;
    }
    if (c > 2) {
      ts.push({"t":cts[i],"c":c,"v":1,"cc":cc});
      cc++;
      continue;
    }

    if (cts[i].next) {
      var t = cts[i];
      var c = 0;
      while (t.next) {
        t = t.next;
        c++;
      }
      if (c > 2) {
        ts.push({"t":cts[i],"c":c,"v":0,"cc":cc});
        t = cts[i];
        while (t.next) {
          t = t.next;
          t.cflag = 1;
        }
      }
    }
  }
  console.log("Collapsable tiles: " + ts.length);

  for (var i = 0; i < cts.length; i++) {
    delete cts[i].cflag;
  }

  //Check if tiles in selection are already collapsed
  var collapse = true;
  var max = ts.length;
  var min = 0;
  var count = 0;
  for (var i = 0; i < ts.length; i++) {
    console.log(ts[i].t + " " + ts[i].t.classList);
    if (ts[i].t.collapsed) {
      count++;
    }
  }
  console.log("Collapsed Tiles: " + count + " of " + max);

  // console.log("CM: " + count + "," + max);
  if (count < max) {
    //Collapse tiles
    // console.log("Collapse");
    for (var i = 0; i < ts.length; i++) {
      if (ts[i].t.collapsed >= ts[i].cc) { continue; }
      ts[i].t.collapsed = ts[i].cc;
      if (ts[i].v == 0) {
        var t = ts[i].t.next;
        while (t) {
          t.style.display = "none";
          t = t.next;
        }

        //Add collapse block
        var cb = collapser.cloneNode(true);
        cb.removeAttribute('id');
        cb.setAttribute('class','collapsers');
        cb.style.display = "";
        cb.style.left = "-2px";
        cb.style.top = ts[i].t.offsetHeight - 2 + "px";
        cb.children[0].innerHTML = "+" + ts[i].c + " more tiles";
        cb.addEventListener('touchend',function(e) {
          collapseTiles([event.target.parentNode],windex);
        });
        ts[i].t.appendChild(cb);

      } else if (ts[i].v == 1) {
        Array.prototype.forEach.call(ts[i].t.getElementsByClassName('multi hole'),function(e) {
          e.style.display = "none";
        });

        //Add collapse block
        var cb = collapser.cloneNode(true);
        cb.removeAttribute('id');
        cb.setAttribute('class','collapsers');
        cb.style.display = "";
        cb.style.top = "";
        cb.style.left = "15px";
        cb.style.bottom = "-2px";
        cb.children[0].innerHTML = "+" + ts[i].c + " more tiles";
        cb.addEventListener('touchend',function(e) {
          collapseTiles([event.target.parentNode],windex);
        });
        ts[i].t.appendChild(cb);
      }
    }


  } else {
    // console.log("Expand " + max);
    //Expand tiles
    for (var i = min; i < max; i++) {
      ts[i].t.collapsed = 0;
      if (ts[i].v == 0) {
        var t = ts[i].t.next;
        while (t) {
          t.style.display = "";
          t = t.next;
        }
        //Remove collapse block
        var cb = ts[i].t.getElementsByClassName('collapsers')[min];
        if (cb) {
          ts[i].t.removeChild(cb);
        }
      } else if (ts[i].v == 1) {

        Array.prototype.forEach.call(ts[i].t.getElementsByClassName('multi hole'),function(e,i) {
          e.style.display = "";
        });

        //Remove collapse block
        // var id = 0;
        // if (min != 0) { id = min; }
        var cb = ts[i].t.getElementsByClassName('collapsers')[min];
        if (cb) {
          ts[i].t.removeChild(cb);
        }
      }
    }
  }
  reflow(windex);
}

function compareTileTop(a,b) {
  if (a.y < b.y) { return -1; }
  return 1;
}

function createTileMenuOpElement(svg,txt,x,y,r,t,tileToChange) {
  var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
  newElement.style.stroke = "black"; //Set stroke colour
  newElement.style.strokeWidth = "5px"; //Set stroke width
  newElement.setAttribute("cx", x);
  newElement.setAttribute("cy", y);
  newElement.setAttribute("r", r);
  newElement.style.fill = "white";
  newElement.setAttribute("class","symbolTileButton");
  newElement.style.display = "none";
  newElement.addEventListener("click", function() {
    if (!mouse) return;
    tileToChange.innerHTML = txt;
    closeMenu(null,svg);
    generateCode(tileToChange.parentNode.windex);
  });
  newElement.addEventListener("touchend", function() {
    tileToChange.innerHTML = txt;
    closeMenu(null,svg);
    generateCode(tileToChange.parentNode.windex);
  });
  svg.appendChild(newElement);
  newElement.style.pointerEvents = "all";

  var textElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
  textElement.textContent = txt;
  // textElement.style.fontFamily = "entypo";
  textElement.style.fontSize = "20px";
  textElement.setAttribute("x",x);
  textElement.setAttribute("y",y);
  textElement.setAttribute("text-anchor", "middle");
  textElement.style.display = "none";
  textElement.setAttribute("class","symbolTileButton");

  if (system_mode == 1) {
    //Mobile
    textElement.setAttribute("alignment-baseline", "central"); //Chrome
    textElement.setAttribute("dominant-baseline", "central");  //Firefox
  } else {
    textElement.setAttribute("alignment-baseline", "middle");
    textElement.setAttribute("dominant-baseline", "middle");
  }

  textElement.setAttribute("pointer-events", "none");
  svg.appendChild(textElement);
  return [newElement,textElement];
}

function createTileMenuElement(svg,txt,x,y,r,fs) {
  var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
  newElement.style.stroke = "black"; //Set stroke colour
  newElement.style.strokeWidth = "5px"; //Set stroke width
  newElement.setAttribute("cx", x);
  newElement.setAttribute("cy", y);
  newElement.setAttribute("r", r);
  newElement.style.fill = "white";
  newElement.style.pointerEvents = "all";
  svg.appendChild(newElement);

  var textElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
  textElement.textContent = txt;
  textElement.style.fontSize = fs;
  textElement.setAttribute("x",x);
  textElement.setAttribute("y",y);
  textElement.setAttribute("text-anchor", "middle");
  if (system_mode == 1) {
    //Mobile
    textElement.setAttribute("alignment-baseline", "central"); //Chrome
    textElement.setAttribute("dominant-baseline", "central");  //Firefox
  } else {
    textElement.setAttribute("alignment-baseline", "middle");
    textElement.setAttribute("dominant-baseline", "middle");
  }
  textElement.setAttribute("pointer-events", "none");
  svg.appendChild(textElement);
  return [newElement,textElement];
}

function fixNextPrev(holes) {
  for (var i = 0; i < holes.length; i++) {
    for (var j = 0; j < holes[i].children.length; j++) {
      fixNextPrev(holes[i].children[j].getElementsByClassName('hole multi'));

      if (j == 0) {
        holes[i].children[j].prev = false;
      } else {
        holes[i].children[j].prev = holes[i].children[j-1];
      }

      if (j + 1 == holes[i].children.length) {
        holes[i].children[j].next = false;
      } else {
        holes[i].children[j].next = holes[i].children[j+1];
      }
    }
  }
}

function cloneTile (event, tile, b) {
  var svg = event.target.parentNode;
  var tmp = tile;


  while (!tmp.classList.contains('tile')) {
    tmp = tmp.parentNode;
  }

  var newTile = tmp.cloneNode(true);
  newTile.windex = tmp.windex;
  addTileTouchToTile(newTile);
  newTile.prev = false;
  newTile.next = false;
  var xy = findOffsetTopLeft(tile);
  var tileChildren = newTile.getElementsByClassName('tile');
  for (var i=0; i<tileChildren.length; i++) {
    if (tileChildren[i].classList.contains('tile')) {
      if (!tileChildren[i].windex) { tileChildren[i].windex = tmp.windex; }
      addTileTouchToTile(tileChildren[i]);
    }
  }

  // var holesO = tile.getElementsByClassName('hole multi');
  var holesN = newTile.getElementsByClassName('hole multi');
  fixNextPrev(holesN);


  var left = tile.offsetLeft;
  var top = tile.offsetTop;
  var p = tile.offsetParent;
  while (p && p.classList && !p.classList.contains('codearea')) {
    left += p.offsetLeft;
    top  += p.offsetTop;
    p = p.offsetParent;
  }

  newTile.collapsed = tile.collapsed;
  newTile.style.left = left + 10 + 'px';
  newTile.style.top = top + 10 + 'px';
  newTile.style.position = "absolute";
  newTile.classList.remove(highlight);
  tiles2[tile.windex].push(newTile);
  Array.prototype.forEach.call(newTile.getElementsByClassName('tile'), function(el) {
    tiles2[tile.windex].push(el);
  });

  codearea2[tile.windex].appendChild(newTile);
  if (!b) {
    updateTileIndicator(tile.windex);
    generateCode(tile.windex);
    reflow(tile.windex);
    checkpointSave(tile.windex);
    clearPopouts(tile.windex);
    svg.parentNode.removeChild(svg);
    overlays2[tile.windex].style.display = 'none';
  }
  return newTile;
}



function deleteTile (event) {
  var svg = event.target.parentNode;

  var windex = svg.windex;
  // console.log("Delete Tile: " + tile.classList + " - " + event.target.tagName);
  if (svg.tileSrc) {
    var tmp = svg.tileSrc;
    while (!tmp.classList.contains('tile')) {
      tmp = tmp.parentNode;
    }
    if (tmp.next) {
      tmp.next.prev = false;
    }
    if (tmp.prev) {
      tmp.prev.next = false;
    }
    tmp.parentNode.removeChild(tmp);
  } else if (svg.tileGroup) {
    Array.prototype.forEach.call(svg.tileGroup,function(e) {
      if (e.parentNode != null) {
        if (e.next) { e.next.prev = false; }
        if (e.prev) { e.prev.next = false; }
        e.parentNode.removeChild(e);
      }
    });
  }
  // while (tmp) {
  //   tmp.parentNode.removeChild(tmp);
  //   tmp = tmp.next;
  // }
  tiles2[windex] = [];
  Array.prototype.forEach.call(codearea2[windex].getElementsByClassName('tile'), function(el) {
      // console.log(el.tagName + ", " + el.parentNode.classList);
      tiles2[windex].push(el);
    });
  updateTileIndicator(windex);
  generateCode(windex);
  reflow(windex);
  checkpointSave(windex);
  clearPopouts(windex);
  overlays2[windex].style.display = 'none';
  svg.parentNode.removeChild(svg);
  if (svg.polyID != undefined) { removePoly(svg.polyID); }
  holes2[windex] = codearea2[windex].getElementsByClassName('hole');
}

function cloneSVG(target,x,y,id,cl) {
  var svg0 = document.getElementById(target);
  var svg = svg0.cloneNode(true);
  svg.removeAttribute('id');
  svg.setAttribute("class",cl);
  svg.style.top = ((y) - svg.getAttribute("height") * .5) + "px";
  svg.style.left = ((x) - svg.getAttribute("width") * .5) + "px"
  svg.style.fontFamily = "none";
  svg.style.display = "";
  svg.xPoint = x;
  svg.yPoint = y;
  svg.windex = id;
  codearea2[id].appendChild(svg);
  svg.setAttribute("ts", Date.now());
  if (system_mode == 1) {
    closeCurrentMenu();
    currentMenu = svg;
  }
  return svg;
}

function showPieMenu(x,y,id) {
  if (id < 0 || id > 3) { return; }
  var pos;
  // console.log("ShowPieMenu: " + x + ", " + y + ", " + windows[id].rid);
  if (windows[id].rid != 0) {
    pos = rotateXY(id,windows[id].rid, x, y);
  } else {
    pos = positionCorrection([x,y],id);
  }
  x = pos[0];
  y = pos[1];

  x += codearea2[id].scrollLeft;
  y += codearea2[id].scrollTop;
  if (!menuAreaCheck(x,y,id,"pie")) { return; }

  // console.log("ShowPieMenu: " + x + ", " + y + ", " + windows[id].rid);
  var svg = cloneSVG('pie_svg',x,y,id,"pie piemenu");
  if (system_mode == 0) {
    pieMenus.push(svg);
  }
  createPieMenu(svg);
}

function menuAreaCheck(x,y,id,type) {
  if (system_mode == 1) { return true; }

  var p = codearea2[id].getElementsByClassName("piemenu");
  var cx = 0, cy = 0;

  for (var i = 0; i < p.length; i++) {
    var cc = p[i].classList;
    if (cc.contains("sec")) {
        cx = secW / 2;
        cy = secH / 2;
    } else if (cc.contains("pie")) {
        cx = pieW / 2;
        cy = pieH / 2;
    } else {
        cx = tileW / 2;
        cy = tileH / 2;
    }
    var dist = Math.sqrt(Math.pow(x-(parseFloat(p[i].style.left)+cx), 2) + Math.pow(y - (parseFloat(p[i].style.top)+cy), 2));
    console.log("dist: " + dist + " - " + x + "," + y + " - " + (p[i].style.left+cx) + "," + (p[i].style.top+cy));
    if (dist < pieMenuSafeDistance) {
      return false;
    }
  }
  return true;
}

function showSecMenu(x,y,id) {
  if (id < 0 || id > windowMax) { return; }
  var pos;

  if (windows[id].rid != 0) {
    pos = rotateXY(id,windows[id].rid, x, y);
  } else {
    pos = positionCorrection([x,y],id);
  }
  x = pos[0];
  y = pos[1];

  var svg;
  if (codearea2[id].style.visibility == "hidden") {
    if (!menuAreaCheck(x,y,id,"sec")) { return; }
    svg = cloneSVG('sec_svg',x,y,id,"sec piemenu");
    editor4[id].appendChild(svg);
  } else {
    x += codearea2[id].scrollLeft;
    y += codearea2[id].scrollTop;
    if (!menuAreaCheck(x,y,id,"sec")) { return; }
    svg = cloneSVG('sec_svg',x,y,id,"sec piemenu");
  }


  if (system_mode == 0) {
    secMenus.push(svg);
  }
  createSecondaryMenu(svg);

}

function closePieMenu(event) {
  event.preventDefault();
  event.stopPropagation();
  var elem = event.target;
  if (!elem.parentNode) { return; }

  // console.log("closePie: " + elem.tagName);
  //Get containing SVG
  while (elem.tagName != "svg" && elem.parentNode != null) {
    elem = elem.parentNode;
  }

  var timeDif = Date.now() - elem.getAttribute("ts");
  if (timeDif > closePieDelay) {
    window.setTimeout(function() {
      if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    },10);
  }
}

function spliceMenuList(svg) {
  if (svg == null) { return; }

  if (svg.classList.contains("con")) {
    var index = conMenus.indexOf(svg);
    conMenus.splice(index,1);
  } else if (svg.classList.contains("pie")) {
    var index = pieMenus.indexOf(svg);
    pieMenus.splice(index,1);
  } else if (svg.classList.contains("sec")) {
    var index = secMenus.indexOf(svg);
    secMenus.splice(index,1);
  } else if (svg.classList.contains("tile")) {
    var index = tileMenus.indexOf(svg);
    tileMenus.splice(index,1);
  }
}

function closeMenu(event, svg, b) {
  var elem;
  // console.log("svg: " + svg);
  if (!svg) {
     elem = event.target;
     while (elem.tagName != "svg" && elem.parentNode != null) {
      elem = elem.parentNode;
    }
  } else {
    elem = svg;
  }
  if (system_mode == 0) { spliceMenuList(elem); }
  if (elem) {
    if (elem.polyID != undefined && !b) {
      removePoly(elem.polyID);
    }
    if (elem.tileSrc && !b) {
      elem.tileSrc.highlight.remove(-1);
      if (elem.tileSrc.highlight.length == 0) {
        elem.tileSrc.classList.remove(highlight);
      }
    }
  }


  var timeDif = Date.now() - elem.getAttribute("ts");
  if (timeDif > closePieDelay) {
    window.setTimeout(function() {
      if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    },10);
  }
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
}

function createPieMenu(svg) {
  //Find all tiles and create pie menu from them
  // console.log("Create pie menu: " + svg);
  var tmp = toolbox.getElementsByClassName('tile');
  var cats = [];
  var catTile = [];
  var catCount = 0;
  colours = [];
  for (var i in tmp) {
    if (tmp[i].nodeType == 1) {
      var cat = tmp[i].getAttribute("data-category");
      if (!cats.includes(cat)) {
        cats.push(cat);
        // colours[i] = tmp[i].style.background;
        colours[catCount] = window.getComputedStyle(tmp[i]).backgroundColor;
        if (catCount == 2) { colours[catCount] = "blue"; }
        catCount++;
      }
    }
  }

  var tiles = [];
  for (var c in cats) {
    for (var i in tmp) {
      if (tmp[i].nodeType != 1) { continue; }
      if (tmp[i].getAttribute("data-category") == cats[c]) {
        tiles.push(tmp[i]);
      }
    }
  }

  var redo = false;
  if (!tileList || tileList.length == 0) {
    redo = true;
  }

  var tileGroups = [];
  for (var i = 0; i < tiles.length; i++) {
    var tileType = tiles[i].getAttribute("data-category");

    if (redo) {
      tileList.push(tiles[i]);
    }

    var b = -1;
    for (var j = 0; j < tileGroups.length; j++) {
      if (tileGroups[j].type == tileType) {
        tileGroups[j].count++;
        b = j;
        break;
      }
    }

    if (b == -1) {
      tileGroups.push({ type: tileType, count: 1, idx: i});
    }
  }

  if (pie2 == "z") {
    pie2 = "A";
  } else if (pie2 == "Z") {
    if (pie1 == "z") {
      pie1 = "A";
      pie2 = "a";
    } else if (pie1 == "Z") {
      pie1 = "a";
      pie2 = "a";
    } else {
      pie1 = nextChar(pie1);
      pie2 = "a";
    }
  } else {
    pie2 = nextChar(pie2);
  }

  createPie(svg, tileGroups);
}

function createPie(svg, tileGroups) {
  //Create base pie
  this.pieces = tileGroups.length;
  this.max = 360;
  this.start = -45;
  seg = max/pieces;
  for (var i = 0; i < pieces; i++) {
    createPieSegment(pieM,pieM,100,50,start,seg,svg,i,-2,tileGroups[i].type);
    start += seg;
  }

  createCancelButton(svg,pieM,pieM);

  //Create popout segments
  for (var i = 0; i < tileGroups.length; i++) {
    createExtendMenus(tileGroups[i],i,svg);
  }
}

function createExtendMenus(tileGroup,idx,svg) {
  // console.log(idx);
  var p = tileGroup.count;
  // console.log("TileGroupIdx: " + tileGroup.idx);
  segAngle = start + idx * max / pieces + max / pieces / 2;
  defSize = 40;
  seg = maxPie/p;
  if (p * defSize > maxPie) {
    seg = maxPie/p;
  } else {
    seg = defSize;
  }
  s = segAngle - (seg*p)/2;
  for (var i = 0; i < p; i++) {
    createPieSegment(pieM,pieM,160,120,s,seg,svg,idx,"pie" + idx,tileGroup.idx+i);
    s += seg;
  }
}

function createExtendSec(svg,idx,txtData,start) {
  var x0 = 200;
  var y0 = 200;
  var r = 140;
  var r2 = 40;
  var r3 = r + r2;
  var txtMod = 0.6;
  var r4 = r + r2 * txtMod;
  var p = txtData.length;
  var w = 50;
  var seg = w;
  if (idx == 3) { seg = 25; }
  var limit = 180;
  if (idx == 5) { limit = 270; }
  if (seg * p > limit) {
    seg = limit/p;
  }
  var windex = svg.windex;

  var left = start - seg * p *.5;
  // console.log("ext: " + txtData + "," + start + "," + seg + "," + left);

  var p1 = [x0,y0-r];
  var p2 = [x0,y0-r-r2];

  for (var i = 0; i < p; i++) {
    var ang = left + seg * i;
    var p1R = rotatePoint(x0,y0,ang*rad,p1[0],p1[1]);
    var p2R = rotatePoint(x0,y0,ang*rad,p2[0],p2[1]);
    var ang2 = ang + seg;
    var p3R = rotatePoint(x0,y0,ang2*rad,p2[0],p2[1]);
    var p4R = rotatePoint(x0,y0,ang2*rad,p1[0],p1[1]);
    // console.log("ext: " + (ang) + "," + (ang2));


    var data =  "M " + p1R[0] + " " + p1R[1] + " ";
    data += "L " + p2R[0] + " " + p2R[1] + " ";
    data += "A " + r3 + " " + r3 + " " + seg + " 0 1 " + p3R[0] + " " + p3R[1] + " ";
    data += "L " + p4R[0] + " " + p4R[1] + " ";
    data += "A " + r + " " + r + " " + (-seg) + " 0 0 " + p1R[0] + " " + p1R[1] + " ";



    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
    newElement.setAttribute("d",data); //Set path's data
    newElement.style.stroke = "white";
    newElement.style.strokeWidth = "2px";
    if (idx == 6) {
      newElement.style.fill = "red";
    } else {
      newElement.style.fill = "black";
    }

    newElement.style.fillOpacity = "0.7";
    newElement.style.pointerEvents = "all";

    if (idx != 3 || i != 1) {
      svg.appendChild(newElement);
    }


    var xp = p1R[0] + (p2R[0] - p1R[0]) * txtMod;
    var yp = p1R[1] + (p2R[1] - p1R[1]) * txtMod;
    var xp2= p4R[0] + (p3R[0] - p4R[0]) * txtMod;
    var yp2= p4R[1] + (p3R[1] - p4R[1]) * txtMod;

    var other = 0;
    if (ang < 90 && ang > -90 || ang >= 270) {
      data = "M " + xp + " " + yp + " ";
      data += "A " + r4 + " " + r4 + " " + seg + " 0 1 " + xp2 + " " + yp2;
    } else {
      data = "M " + xp2 + " " + yp2 + " ";
      data += "A " + r4 + " " + r4 + " " + seg + " 0 0 " + xp + " " + yp;
      other = 1;
    }


    var mypath2 = document.createElementNS("http://www.w3.org/2000/svg","path");
    mypath2.setAttributeNS(null, "id", "path" + sec1 + sec2 + "e" + idx + i);
    mypath2.setAttributeNS(null, "d", data);
    mypath2.setAttributeNS(null,"fill", "none");
    mypath2.setAttributeNS(null,"stroke","none");
    svg.appendChild(mypath2);

    //Text1 White
    var text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text1.setAttributeNS(null, "fill", "black");
    text1.setAttributeNS(null,"font-size","15px");
    text1.setAttributeNS(null, "dominant-baseline", "middle");
    textpath = document.createElementNS("http://www.w3.org/2000/svg","textPath");
    textpath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#path" + sec1 + sec2 + "e" + idx + i);
    textpath.setAttribute("startOffset","50%");
    textpath.setAttribute("text-anchor","middle");
    var txtD = txtData[i].text;
    if (!txtD) { txtD = txtData[i]; }
    txtElem = document.createTextNode(txtD);
    text1.setAttribute("pointer-events", "none");
    textpath.appendChild(txtElem);
    text1.appendChild(textpath);
    if (mobile) {
      text1.style.fill = "white";
    }
    svg.appendChild(text1);

    newElement.idx = i;

    if (idx == 0) {
      newElement.addEventListener("click", function(event) {
        if (!mouse) return;
        var d = document.getElementById("dialect");
        d.value = d.options[event.target.idx].value;
        curDialect = event.target.idx;
        changeDialect(windex);
        tileList = [];
        closeAllMenus(-1);
      });
      newElement.addEventListener("touchend", function(event) {
        var d = document.getElementById("dialect");
        d.value = d.options[event.target.idx].value;
        curDialect = event.target.idx;
        changeDialect(windex);
        tileList = [];
        closeAllMenus(-1);
      });

      newElement.setAttribute("class","sec" + idx);
      text1.setAttribute("class","sec" + idx);
      newElement.style.display = "none";
      text1.style.display = "none";

      if (i == curDialect) {
        newElement.style.fill = "gray";
      }
    } else if (idx == 3) {
      newElement.setAttribute("class","sec" + idx);
      text1.setAttribute("class","sec" + idx);
      newElement.style.display = "none";
      text1.style.display = "none";

      if (i == 0) {
        //Load
        newElement.addEventListener("click", function(event) {
          if (!mouse) { return; }
          expandSecMenu(svg,-1);
          var uf = document.getElementById("userfile");
          uf.idx = svg.windex;
          uf.value = "";
          uf.click();
          closeSecondaryMenu(svg);
        });
        newElement.addEventListener("touchend", function(event) {
          expandSecMenu(svg,idx);
          var uf = document.getElementById("userfile");
          uf.idx = svg.windex;
          uf.value = "";
          uf.click();
          closeSecondaryMenu(svg);
          event.preventDefault();
        });

      } else {
        //Save File
        //Needs a href
        var a = document.createElementNS("http://www.w3.org/2000/svg","a");
        a.appendChild(newElement);
        a.addEventListener("click", function() { if (mouse) expandSecMenu(svg,-1); fakeDownload(svg.windex)});
        a.addEventListener("touchend", function() { expandSecMenu(svg,-1); fakeDownload(svg.windex)});
        svg.appendChild(a);
      }

    } else if (idx == 6) {
      newElement.addEventListener("click", function(event) {
        if (!mouse) return;
        clearCode(windex);
      });
      newElement.addEventListener("touchend", function(event) {
        clearCode(windex);
        expandSecMenu(svg,-1);
      });
      newElement.setAttribute("class","sec" + idx);
      text1.setAttribute("class","sec" + idx);
      newElement.style.display = "none";
      text1.style.display = "none";
      // newElement.setAttribute("fill", "red");
    } else if (idx == 5) {
      newElement.addEventListener("click", function(event) {
        if (!mouse) return;
        var d = document.getElementById("samples");
        d.value = d.options[event.target.idx+1].value;
        // curSample = event.target.idx;
        closeAllMenus(windex);
        // console.log("Loading: " + d.value);
        loadSample(d.value,windex);
        // addTileTouch();
        checkpointSave(windex);
        // svg.sampleID = event.target.idx;
      });
      newElement.addEventListener("touchend", function(event) {
        var d = document.getElementById("samples");
        d.value = d.options[event.target.idx+1].value;
        closeAllMenus(windex);
        // console.log("Loading: " + d.value);
        loadSample(d.value,windex);
        checkpointSave(windex);
      });
      newElement.setAttribute("class","sec" + idx);
      text1.setAttribute("class","sec" + idx);
      text1.setAttribute("font-size", "12px");
      newElement.style.display = "none";
      text1.style.display = "none";

      // if (!svg.sampleID && i == 0) {
        // newElement.style.fill = "gray";
      // }
      // if (svg.sampleID && i == svg.sampleID) {
        // newElement.style.fill = "gray";
      // }

    }
  }
}

function rotatePoint(cx, cy, a, px, py) {
  var s = Math.sin(a);
  var c = Math.cos(a);
  px -= cx;
  py -= cy;
  var xn = px * c - py * s;
  var yn = px * s + py * c;
  px = xn + cx;
  py = yn + cy;
  return [px,py];
}

function createPieSegment(rx,ry,rad1,rad2,a1,a2,svg,idx,c,idx2,c2) {
  //c :=
  // 2          -> Sec Menu
  //-2          -> Pie Menu
  //-3          -> Window Menu
  //'pie' + idx -> Pie Menu Outer Section

  a1 = a1 % 360;
  var windex = svg.windex;
  var p1x = rx;
  var p1y = ry-rad2;
  var p2x = rx;
  var p2y = ry-rad1;
  var dx = 0 - rx;
  var dy = 0 - ry;
  var i;
  var p1x1 = p1x+dx;
  var p1y1 = p1y+dy;
  var p2x1 = p2x+dx;
  var p2y1 = p2y+dy;
  var a1r = a1 * rad;
  var a2r = (a1+a2) * rad;

  p1xR = Math.round(((p1x1) * Math.cos(a1r) - (p1y1) * Math.sin(a1r)) - dx);
  p1yR = Math.round(((p1y1) * Math.cos(a1r) + (p1x1) * Math.sin(a1r)) - dy);
  p2xR = Math.round(((p2x1) * Math.cos(a1r) - (p2y1) * Math.sin(a1r)) - dx);
  p2yR = Math.round(((p2y1) * Math.cos(a1r) + (p2x1) * Math.sin(a1r)) - dy);
  p3xR = Math.round(((p2x1) * Math.cos(a2r) - (p2y1) * Math.sin(a2r)) - dx);
  p3yR = Math.round(((p2y1) * Math.cos(a2r) + (p2x1) * Math.sin(a2r)) - dy);
  p4xR = Math.round(((p1x1) * Math.cos(a2r) - (p1y1) * Math.sin(a2r)) - dx);
  p4yR = Math.round(((p1y1) * Math.cos(a2r) + (p1x1) * Math.sin(a2r)) - dy);

  data =  "M " + p1xR + " " + p1yR + " ";
  data += "L " + p2xR + " " + p2yR + " ";
  data += "A " + rad1 + " " + rad1 + " " + a2 + " 0 1 " + p3xR + " " + p3yR + " ";
  data += "L " + p4xR + " " + p4yR + " ";
  data += "A " + rad2 + " " + rad2 + " " + a2 + " 0 0 " + p1xR + " " + p1yR + " ";

  newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
  newElement.setAttribute("d",data); //Set path's data
  if (c == 2 || c == -3) {
    newElement.style.stroke = "white";
    newElement.style.strokeWidth = "4px";
    newElement.style.fill = "black";
  } else {
    newElement.style.stroke = "#000"; //Set stroke colour
    newElement.style.strokeWidth = "2px"; //Set stroke width
    newElement.style.fill = colours[idx];
  }
  newElement.style.fillOpacity = "0.7";
  newElement.style.pointerEvents = "all";

  if (c) {
    //Draw the secondary menu text using SVG textPath
    var other = 0;
    if (a1 >= 90 && a1 < 270) {
      data = "M " + p3xR + " " + p3yR + " ";
      data += "A " + rad1 + " " + rad1 + " " + (-a2) + " 0 0 " + p2xR + " " + p2yR;
      other = 1;
    } else {
      data = "M " + p2xR + " " + p2yR + " ";
      data += "A " + rad1 + " " + rad1 + " " + a2 + " 0 1 " + p3xR + " " + p3yR;
    }

    var pathName = "path";
    if (c == 2) {
      pathName += "p" + sec1 + sec2 + idx;
    } else if (c == -2) {
      pathName += "s" + pie1 + pie2 + idx;
    } else {
      pathName += pie1 + pie2 + idx + pieE1 + pieE2 + idx2;
    }

    if (c != -3) {
      var mypath2 = document.createElementNS("http://www.w3.org/2000/svg","path");
      mypath2.setAttributeNS(null, "id", pathName);
      mypath2.setAttributeNS(null, "d", data);
      mypath2.setAttributeNS(null,"fill", "none");
      mypath2.setAttributeNS(null,"stroke","none");
      svg.appendChild(mypath2);

      var text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text1.setAttributeNS(null, "fill", "black");
      text1.setAttributeNS(null,"font-size","15px");
      if (other) {
        text1.setAttributeNS(null, "dominant-baseline", "hanging");
      } else {
        text1.setAttributeNS(null, "dominant-baseline", "ideographic");
      }


      var textpath = document.createElementNS("http://www.w3.org/2000/svg","textPath");
      textpath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + pathName);
      textpath.setAttribute("startOffset","50%");
      textpath.setAttribute("text-anchor","middle");

      //Text
      var txtElem;
      if (c == 2 || c == -2 || c == -3) {
        txtElem = document.createTextNode(idx2);
      } else {
        text1.setAttribute("class",c);
        text1.style.display = "none";
        var tileText = tileList[idx2].getAttribute("desc");
        if (!tileText) {
          tileText = (tileList[idx2].getElementsByTagName('span')[0]).innerText || "?";
        }
        tileText = tileText.replace(/[(){}:=]/gi, '')
        tileText = tileText.toUpperCase();
        tileText = tileText.trim();
        if (tileText == "IF" && idx2 == 19) { tileText = "IF ELSE"; }
        txtElem = document.createTextNode(tileText);
      }

      textpath.appendChild(txtElem);
      text1.appendChild(textpath);
    }


    //SecMenu Main Button operations
    if (c == 2) {
      svg.appendChild(newElement);
      newElement.idx = idx;

      //Menu Actions
      if (idx == 0) {
        //Expand menu - dialect
        var txt = document.getElementById("dialect").options;
        createExtendSec(svg,idx,txt,a1+a2*.5);


        newElement.addEventListener("click", function(event) {
          if (!mouse) return;
          expandSecMenu(svg,event.target.idx);
        });
        newElement.addEventListener("touchend", function(event) {
          expandSecMenu(svg,event.target.idx);
          event.preventDefault();
        });
      } else if (idx == 1) {
        //Run Code
        newElement.addEventListener("click", function() {
          if (!mouse) { return; }
          expandSecMenu(svg,idx);
          updateTileIndicator(windex);
          if (minigraceRunning[windex]) {
            if (output[windex].style.display == "none") {
              expandOutput(windex);
              return;
            } else {
              if (minigraceTerminationCounter == 0) {
                minigraceTerminationCounter = 1;
              }
              minigraceTerminationTarget[windex] = 1;

              setTimeout(minigraceStopCheck,600)
              return;
            }
          }
          if (errorTiles2[windex].length > 0) {
            highlightTileErrors(null,windex);
          } else {
            checkExpandOutput(windex);
            go(windex);
          }
        });
        newElement.addEventListener("touchend", function() {
          expandSecMenu(svg,idx);
          updateTileIndicator(windex);
          event.preventDefault();
          if (minigraceRunning[windex]) {
            if (output[windex].style.display == "none") {
              expandOutput(windex);
              return;
            } else {
              // minigrace.stopRunning = 1;
              if (minigraceTerminationCounter == 0) {
                minigraceTerminationCounter = 1;
              }
              minigraceTerminationTarget[windex] = 1;

              setTimeout(minigraceStopCheck,600)
              return;
            }
          }
          if (errorTiles2[windex].length > 0) {
            highlightTileErrors(null,windex);
          } else {
            checkExpandOutput(windex);
            go(windex);
          }
        });
        newElement.setAttribute('class', 'goPie');
        if (minigraceRunning[windex]) {
          if (output[windex].style.display == "none") {
            newElement.style.fill = "gold";
          } else {
            newElement.style.fill = "red";
          }
        }
      } else if (idx == 2) {
        //Code View
        newElement.addEventListener("click", function() {
          if (!mouse) return;
          expandSecMenu(svg,idx);
          if (!(document.getElementById("viewbutton").disabled)) {
              toggleShrink(windex);
              if (svg.currentView == 0) {
                svg.currentView = 1;
              } else {
                svg.currentView = 0;
              }
              closeSecMenu(svg)
          }
        });
        newElement.addEventListener("touchend", function() {
          expandSecMenu(svg,idx);
          if (!(document.getElementById("viewbutton").disabled)) {
              toggleShrink(windex);
              if (svg.currentView == 0) {
                svg.currentView = 1;
              } else {
                svg.currentView = 0;
              }
              closeSecMenu(svg)
          }
          event.preventDefault();
        });
      } else if (idx == 3) {
        //Files
        var txt = ["Load","Save"];
        createExtendSec(svg,idx,txt,a1+a2*.5);

        newElement.addEventListener("click", function(event) {
          if (!mouse) return;
          expandSecMenu(svg,event.target.idx);
        });
        newElement.addEventListener("touchend", function(event) {
          expandSecMenu(svg,event.target.idx);
          event.preventDefault();
        });

      } else if (idx == 4) {
        //Connection Menu
        newElement.addEventListener("click", function(event) {
          if (!mouse) return;
          showConMenu(svg.xPoint,svg.yPoint,null,null,-1,event.target.parentNode.windex);
          closeSecMenu(svg);
        });
        newElement.addEventListener("touchend", function(event) {
          // console.log("Touch Windex: " + event.target.parentNode.windex);
          showConMenu(svg.xPoint,svg.yPoint,null,null,-1,event.target.parentNode.windex);
          closeSecMenu(svg);
          event.preventDefault();
        });


      } else if (idx == 5) {
        //Expand menu - sample
        var txt = document.getElementById("samples").options;
        txt = Array.from(txt);
        txt = txt.slice(1,txt.length);
        createExtendSec(svg,idx,txt,a1+a2*.5);

        newElement.addEventListener("click", function(event) {
          if (!mouse) return;
          expandSecMenu(svg,event.target.idx);
        });
        newElement.addEventListener("touchend", function(event) {
          expandSecMenu(svg,event.target.idx);
          event.preventDefault();
        });
      } else if (idx == 6) {
        //Reset Code
        createExtendSec(svg,idx,["Confirm"],a1+a2*.5);
        newElement.addEventListener("click", function() { if (mouse) expandSecMenu(svg,event.target.idx); });
        newElement.addEventListener("touchend", function() { expandSecMenu(svg,event.target.idx); event.preventDefault();});
      } else if (idx == 7) {
        //Reset Output
        newElement.addEventListener("click", function() { if (!mouse) { return; } expandSecMenu(svg,idx); clearOutput(windex); closeSecondaryMenu(svg) });
        newElement.addEventListener("touchend", function() { expandSecMenu(svg,idx); clearOutput(windex); closeSecondaryMenu(svg); event.preventDefault(); });
      } else if (idx == 8) {
        //View Errors
        newElement.setAttribute("class", "errorPie");
        if (errorTiles2[windex] == null) {
          updateTileIndicator(windex);
        }
        if (errorTiles2[windex].length > 0) {
          newElement.style.fill = "red";
        } else {
          newElement.style.fill = "green";
        }

         newElement.addEventListener("click", function() {
          if (!mouse) return;
          expandSecMenu(svg,idx);
          indicatorDisplay(errorTiles2[windex].length,windex);
          closeSecondaryMenu(svg);
        });
        newElement.addEventListener("touchend", function() {
          expandSecMenu(svg,idx);
          indicatorDisplay(errorTiles2[windex].length,windex);
          closeSecondaryMenu(svg);
          event.preventDefault();
        });

      }
    }


    if (c != -3) {
      svg.appendChild(text1);
    }

    if (c == -3) {
      newElement.addEventListener("click", function(event) {
        if (!mouse) return;
        windowMenuClick(event.target.idx,event.target.parentNode.idx,event.button == 0 ? 1 : 2,5);
      });
      newElement.addEventListener("touchstart", function(event) { wMenuTouchStart(event) });
      newElement.addEventListener("touchmove", function(event) { wMenuTouchMove(event) });
      newElement.addEventListener("touchend", function(event) { wMenuTouchEnd(event) });
      newElement.idx = idx;
    }

    if (c == 2 || c == -3) {
      //SecMenu Icons
      //Find center point of segment
      var x1 = p4xR + (p3xR - p4xR) *.5;
      var y1 = p4yR + (p3yR - p4yR) *.5;
      var xy = rotatePoint(rx,ry,(-a2)*.5*rad,x1,y1);

      var textElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
      if (c == -3) {
        textElement.textContent = idx2;
      } else {
        textElement.textContent = c2;
        if (idx == 1) { textElement.setAttribute("class", "goPieText"); }
      }
      if (mobile) {
        textElement.style.fill = "white";
      }

      textElement.setAttribute("x",xy[0]);
      textElement.setAttribute("y",xy[1]);
      textElement.setAttribute("text-anchor", "middle");

      if (mobile) {
        //Mobile
        textElement.setAttribute("dominant-baseline", "central"); //Firefox
        textElement.setAttribute("alignment-baseline", "central"); //Chrome
      } else {
        textElement.setAttribute("dominant-baseline", "middle");
        textElement.setAttribute("alignment-baseline", "middle");
      }

      textElement.setAttribute("pointer-events", "none");
      textElement.style.fontFamily = "entypo";
      if (c == -3) {
        textElement.style.fontSize = "30px";
      } else {
        textElement.style.fontSize = "40px";
      }
      if (idx == 1 && c != -3) {
        textElement.style.fontSize = "30px";
      }

      if (c == 2 && idx == 1) {
        if (minigraceRunning[windex]) {
          if (output[windex].style.display == "none") {
            textElement.textContent = "\uE70A";
            textElement.style.fontSize = "40px";
          } else {
            textElement.textContent = "■";
            textElement.style.fontSize = "50px";
          }

        }
      }

      svg.appendChild(textElement);
      if (c == 2) {
        return;
      }
    }
  }

  if (c && c != 2 && c != -2 && c != -3) {
    //Pie Outer Segment
    newElement.setAttribute("class",c);
    newElement.style.display = "none";
    newElement.addEventListener("touchstart", function(event) { segmentDragStart(event,windex); });
    newElement.addEventListener("touchmove", function(event) { segmentDragMove(event,windex); });
    newElement.addEventListener("touchend", function(event) { segmentDragEnd(event,windex); });
    newElement.addEventListener("click", function(event) { if (mouse) pieExtendClick(tileList[event.target.tileIdx],event.target.parentNode,event); });
    newElement.tileIdx = idx2;
  } else if (c != -3) {
    newElement.setAttribute("idx", idx);
    newElement.addEventListener("click", function(){ if (mouse) menuExtend(this.getAttribute("idx"),this); });
    newElement.addEventListener("touchend", function(){ menuExtend(this.getAttribute("idx"),this); event.preventDefault();});
  }
  svg.appendChild(newElement);
}

function expandSecMenu(svg, idx) {
  if (svg.idx != -1) {
    //Close expansion
    var txt = "sec" + svg.idx;
    var m = svg.getElementsByClassName(txt);
    for (var i = 0; i < m.length;i++) {
      // m[i].parentNode.removeChild(m[i]);
      m[i].style.display = "none";
    }
  }

  // console.log("Expand: " + svg + "," + svg.idx + "," + idx);
  var txt = "sec" + idx;
  if (idx == 0) {
    if (svg.idx != 0) {
      //Show dialect
      var m = svg.getElementsByClassName(txt);
      for (var i = 0; i < m.length;i++) {
        m[i].style.display = "";
      }
      svg.idx = 0;
    } else {
      svg.idx = -1;
    }
  } else if (idx == 3) {
    //Files
    if (svg.idx != 3) {
      var m = svg.getElementsByClassName(txt);
      for (var i = 0; i < m.length;i++) {
        m[i].style.display = "";
      }
      svg.idx = 3;
    } else {
      svg.idx = -1;
    }
  } else if (idx == 6) {
    if (svg.idx != 6) {
        //Show confirm delete
      var m = svg.getElementsByClassName(txt);
      for (var i = 0; i < m.length;i++) {
        m[i].style.display = "";
      }
      svg.idx = 6;
    } else {
      svg.idx = -1;
    }
  } else if (idx == 5) {
    if (svg.idx != 5) {
      //Show samples
      var m = svg.getElementsByClassName(txt);
      for (var i = 0; i < m.length;i++) {
        m[i].style.display = "";
      }
      svg.idx = 5;
    } else {
      svg.idx = -1;
    }
  } else {
    svg.idx = -1;
  }
}

function closeSecMenu(svg) {
  var timeDif = Date.now() - svg.getAttribute("ts");
  if (timeDif > closePieDelay) {
    window.setTimeout(function() { svg.parentNode.removeChild(svg); },10);
  }
}

function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

function createSecondaryMenu(svg,id) {
  if (!svg) {
    svg = document.getElementById("pie_svg");
    svg.style.left = "0%";
    svg.style.display = "";
  }
  //Secondary Menu Commands:  -- -- -- -- -- -- -- Also needs to work in text mode!
  //Dialect+, Run, Run All, Code View, Load File, Save File?, Load Sample, Reset, Clear Output
  var options = ["Dialect", "Run", "Code View", "Files", "CrossDevice", "Samples", "Reset Code", "Reset Output", "View Errors"];//,"Clear Output"];
  // var subOptions = "[4, 0, 0, 0, 0, 0, 0, 5, 0, 0];
  // var oChars = ["\uE736",String.fromCharCode(9658),"\uE731",fixedFromCharCode(0x1F4E4),
  // fixedFromCharCode(0x1F4E5),"\uE005","\u27F3","\uE730","\u26A0"];
  var oChars = ["\uE736",String.fromCharCode(9658),"\uE731",fixedFromCharCode(0x1F4E5),
  fixedFromCharCode(0x01F4F6),"\uE005","\u27F3","\uE730","\u26A0"];
  var x0 = 200;
  var y0 = 200;
  this.pieces = options.length;
  this.max = 360;
  this.start = -45;
  var seg = max/pieces;
  for (var i = 0; i < pieces; i++) {
    createPieSegment(x0,y0,120,50,start,seg,svg,i,2,options[i],oChars[i]);
    start += seg;
  }

  //For unique ids aa-ZZ
  if (sec2 == "z") {
    sec2 = "A";
  } else if (sec2 == "Z") {
    if (sec1 == "z") {
      sec1 = "A";
      sec2 = "a";
    } else if (sec1 == "Z") {
      sec1 = "a";
      sec2 = "a";
    } else {
      sec1 = nextChar(sec1);
      sec2 = "a";
    }
  } else {
    sec2 = nextChar(sec2);
  }

  createCancelButton(svg,x0,y0);
}

function segmentDragStart(event,windex) {
  var menus = codearea2[windex].getElementsByClassName('popup-menu');

  for (var i = 0; i < event.targetTouches.length; i++) {
    var id = event.targetTouches[i].identifier;
    var target = event.target;

    if (!(id in pieMenuTouches)) {
      //New Touch Event
      event.preventDefault();
      var pos = positionCorrection([event.changedTouches[i].clientX,event.changedTouches[i].clientY],windex);

      segmentTouches[id] = {x:pos[0], y:pos[1], updates:0}
      segmentTouches[id].tile = tileList[target.tileIdx];
      segmentTouches[id].svg = target.parentNode;
    }
  }
  event.preventDefault();
}

function segmentDragMove(event,windex) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    //Target is always the path element
    if (id in segmentTouches) {
      //Distance check - create tile after some distance
      if (!segmentTouches[id].ok) {
        var pos = positionCorrection([event.changedTouches[i].clientX,event.changedTouches[i].clientY],windex);
        var dist = Math.sqrt(Math.pow(pos[0] - segmentTouches[i].x, 2) + Math.pow(pos[1] - segmentTouches[i].y, 2));
        // console.log("SegDrag: " + dist + ", " + segMoveThresholdDistance);
        if (dist > segMoveThresholdDistance) {
          //#TODO
          //Start Dragging Tile
          // console.log("Segment Drag Distance Reached");
          segmentTouches[id].ok = 1;
          // createTile(segmentTouches[id].tile, null, event.changedTouches[id].clientX, event.changedTouches[id].clientY);
        }
      }
      segmentTouches[id].updates++;
    }
  }
  event.preventDefault();
  // event.stopPropagation();
}

function segmentDragEnd(event,windex) {
  // console.log("S Drag End");
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    // console.log("S Drag End: " + id + ", " + segmentTouches[id] + ", " + segmentTouches[id].tile);
    if (id in segmentTouches) {
      if (segmentTouches[id].ok) {
        //target is always svg element
        createTile(segmentTouches[id].tile, null, event.changedTouches[i].clientX, event.changedTouches[i].clientY, event.target.parentNode.windex);
      } else {
          var svg = event.changedTouches[i].target;
          while (svg.tagName != "svg") {
            svg = svg.parentNode;
          }
          pieExtendClick(segmentTouches[id].tile, svg, event);
      }
    }
    delete segmentTouches[id];
  }
  event.preventDefault();
}


function pieExtendClick(tile, svg, event) {
  createTile(tile, svg, 0, 0, svg.windex);
  closePieMenu(event);
}

function createTile(tile, svg, x, y, id) {
  //Based on embedded function in main.js
  if (tile.nodeType != 1) {
    tile = tileList[tile];
  }
  var xPoint, yPoint;

  if (svg) {
    x = svg.xPoint;
    y = svg.yPoint;
  } else {
    if (windows[id].rid != 0) {
      pos = rotateXY(id,windows[id].rid, x, y);
    } else {
      pos = positionCorrection([x,y],id);
    }
    x = pos[0];
    y = pos[1];
    x += codearea2[id].scrollLeft;
    y += codearea2[id].scrollTop;
  }

  var cl = tile.cloneNode(true);
  cl.windex = id;
  addTileTouchToTile(cl);
  if (!cl.dataset) {
      cl.dataset = {};
      for (var k in this.dataset)
          cl.dataset[k] = this.dataset[k];
  }
  codearea2[id].appendChild(cl);
  cl.style.position = 'absolute';

  cl.style.left = x + "px";
  cl.style.top = y + "px";
  cl.style.display = "";
  attachTileBehaviour(cl);
  tiles2[id].push(cl);

  if (!cl.next)
    cl.next = false;
  if (!cl.prev)
    cl.prev = false;

  //Timeout function to center new tile as width cannot be accessed until element has been drawn
  cl.style.visibility = "hidden";
  holes2[cl.windex] = codearea2[cl.windex].getElementsByClassName('hole');
  setTimeout(function() {
    cl.style.left = cl.offsetLeft - cl.offsetWidth *.5 + 'px';
    cl.style.top = cl.offsetTop - cl.offsetHeight *.5 + 'px';
    cl.style.visibility = "";
  }, 5);
}

function createCancelButton(svg,x,y) {
  if (!x) { x = 150; }
  if (!y) { y = 150; }

  var xy = [[-20,-20,20,20],[20,-20,-20,20]];
  for (var i = 0; i < 3; i++) {
    var newElement;
    if (i == 0) {
      newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
      newElement.setAttribute("cx", x);
      newElement.setAttribute("cy", y);
      newElement.setAttribute("r", 40);
      newElement.style.fill = "black";
      newElement.style.fillOpacity = "0.95";
    } else {
      newElement = document.createElementNS("http://www.w3.org/2000/svg", 'line'); //Create a path in SVG's namespace
      newElement.setAttribute("x1", x+xy[i-1][0]);
      newElement.setAttribute("y1", y+xy[i-1][1]);
      newElement.setAttribute("x2", x+xy[i-1][2]);
      newElement.setAttribute("y2", y+xy[i-1][3]);
      newElement.style.stroke = "red";
      newElement.style.strokeWidth = 5;
      // newElement.style.strokeOpacity = .5;
    }
    newElement.style.pointerEvents = "all";
    newElement.addEventListener("click", function(event){ if (mouse) closeMenu(event); });
    newElement.addEventListener('touchend', function(event) { closeMenu(event); event.preventDefault(); });
    svg.appendChild(newElement);
  }
}

function menuExtend(n, tile) {
  // console.log("Menu Extend");
  // console.trace();
  var currentExtend =  tile.parentNode.getAttribute('idx') || -1;
  var svg = tile.parentNode; //??

  if (currentExtend != -1) {
    objs = svg.getElementsByClassName("pie" + currentExtend);
    for (i = 0; i < objs.length; i++) {
      objs[i].style.display = "none";
    }
  }
  if (currentExtend != n) {
    objs = svg.getElementsByClassName("pie" + n);
    for (i = 0; i < objs.length; i++) {
      objs[i].style.display = "";
    }
    currentExtend = n;
  } else {
    currentExtend = -1;
  }
  tile.parentNode.setAttribute('idx', currentExtend);
}
