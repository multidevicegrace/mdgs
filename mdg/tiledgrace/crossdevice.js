var conMenu;
var conList = [];
var conStatus;
var conMenuTitle;
var conCount = 0;
var conMenuBody;
var conWidth = 240;
var conHeight = 400;
var conState = 0;


a_svg = document.getElementById('a_svg0');
a_anim_space = document.getElementById('anim_space');
resizeElements();
setupConMenu();


//Connection Menu
function setupConMenu() {
  conMenu = document.getElementById('conmenu');
  applyStyle(conMenu,3);
  document.getElementById('outputarea').appendChild(conMenu);
  conMenu.style.display = "";

  //Add Title
  var ct = document.getElementById("conmenutitle");
  conMenuTitle = ct;
  applyStyle(ct,2);

  //Add Status
  var cd = document.createElement("div");
  applyStyle(cd,0);
  var cs = document.createElement("p");
  var s1 = document.createElement("input");
  var s2 = document.createElement("input");
  applyStyle(s1,4);
  applyStyle(s2,4);
  cd.appendChild(s1);
  cd.style.bottom = "4%";
  s1.setAttribute("value", "Refresh");
  s2.setAttribute("value", "Disconnect");
  s1.onclick = function() { conMenuStatusRequest(); }
  s2.onclick = function() {
    ws_forceClose();
    removeFromConMenu(-1);
    conMenuTitle.innerHTML = "Not Connected";
  }
  cd.appendChild(s2);
  cd.appendChild(cs);
  applyStyle(cs,0);
  conMenu.appendChild(cd);
  cs.innerHTML = "&nbsp";
  conStatus = cs;

  //Add Menu Element Holder
  conMenuBody = document.createElement("div");
  conMenu.insertBefore(conMenuBody,cd);

  window.onresize = resizeElements;
  resizeElements();
}

function hideMenus() {
  var menus = codearea.getElementsByClassName('popup-menu');
  for (var i=0; i<menus.length; i++)
    codearea.removeChild(menus[i]);
}

function resizeElements() {
  a_svg.setAttribute("width",codearea.offsetWidth + "px");
  a_svg.setAttribute("height",codearea.offsetHeight + "px");
  a_anim_space.style.width = codearea.offsetWidth + "px";
  a_anim_space.style.height = codearea.offsetHeight + "px";


  if (!conMenu) { return; }
  conMenu.style.height = toolbox.offsetHeight - (conMenu.previousElementSibling.offsetTop +
    conMenu.previousElementSibling.offsetHeight + 15) + "px";

  //Adjust position
  // conMenu.style.left = (codearea.offsetWidth / 2) - (conWidth/2) + "px";
  // conMenu.style.top = (codearea.offsetHeight / 2) - (conHeight/2) + "px";
}

function hasConMenus() {
  return conMenu && conMenu.style.display == "";
}

function removeFromConMenu(sid) {
  if (!conMenu) { return; }
  conList = [];
  conCount = 0;
  for (var i = 0; i < conMenuBody.childElementCount;) {
    if (conMenuBody.children[i].sid == sid || sid == -1) {
      conMenuBody.removeChild(conMenuBody.children[i]);
    } else {
      conList.push(conMenuBody.children[i].sid);
      conCount++;
      i++;
    }
  }
  conStatus.innerHTML = "Found " + conCount + " devices.";
}

function updateConMenuTitle() {
  if (conMenu == null) { return; }
  conMenuTitle.innerHTML = ws_self();
}

function updateConMenu(name,dialect,winCount,winActive) {
  if (conMenu == null) { return; }
  var sid = name.split(".")[0];
  if (conList.includes(sid)) { return; }
  conList.push(sid);
  conCount++;

  //Add mouse listener

  var disable = [];
  for (i = 0; i < winCount; i++) {
    disable.push(!winActive.includes((i+1)+""));
  }


  var de = document.createElement("div");
  var ce = document.createElement("p");

  applyStyle(ce,1);
  ce.innerHTML = name + "<br>" + capitalizeFirstLetter(dialect == "" ? "Standard" : dialect);
  ce.style.boxSizing = "border-box";
  ce.style.height = "36px";
  var ceW = conWidth * 0.5;
  ce.style.width = ceW + "px";
  de.dialect = dialect
  de.winActive = winActive;
  de.setAttribute("class","cme" + sid);
  de.style.height = "36px";
  de.sid = sid;
  ce.style.float = "left";
  de.appendChild(ce);
  conMenuBody.appendChild(de);

  var buttons = [];
  for (j = 0; j < winCount;j++) {
    var c = document.createElement("input");
    c.setAttribute("type","button");
    c.setAttribute("value",j+1);
    c.style.width = ((conWidth-ceW)/winCount) + "px";
    c.setAttribute("class",sid+"w"+(j+1));
    c.style.height = "100%";
    c.targetDialect = dialect;
    c.windex = 0;
    c.conID = 0;
    c.sid = sid;
    c.style.border = "groove";
    c.style.borderRadius = "3px";
    c.disabled = disable[j];
    c.targetWindex = j;
    c.winCount = winCount;
    c.winActive = winActive;
    c.style.background = "white";
    c.style.fontSize = "18px";
    c.cursor = "pointer";


    //Onclick
    c.addEventListener('click', function(event) {
      if (event.target.sending) { return; }
      event.target.sending = true;
      var b = sendTiles(event,event.target.sid);

      if (b != "OK") {
        conStatus.innerHTML = b;
        event.target.style.background = "red";
        window.setTimeout(function() {
          event.target.style.background = "white";
          event.target.sending = false;
        },500);
      } else {
        showAnim(0);
      }
    });


    de.appendChild(c);
  }
  if (ws_auth) {
    conStatus.innerHTML = "Found " + conCount + " devices.";
  }
}

function updateConMenuDialect(sid,dia) {
  if (conMenu == null) { return; }
  var dialect = capitalizeFirstLetter(dia == "" ? "Standard" : dia);
  var cme = conMenu.getElementsByClassName("cme" + sid)[0];
  var split = cme.children[0].innerHTML.split("<br>");
  cme.children[0].innerHTML = split[0] + "<br>" + dialect;
  Array.prototype.forEach.call(cme.getElementsByTagName("input"), function(el) {
    // console.log("Dia: " + el);
    el.targetDialect = dia;
  });
}

function updateConMenuWindows(sid,win,wina) {
  if (conMenu == null) { return; }

  var disable = [];
  for (i = 0; i < win; i++) {
    disable.push(!wina.includes((i+1)+""));
  }
  // console.log("sid: " + sid + ", wina: " + wina + ", disable: " + disable);

  var winTxt = "Windows: " + win + "(" + wina + ")";

  var cme = conMenu.getElementsByClassName("cme" + sid)[0];
  for (j = 0; j < win; j++) {
    cme.children[j+1].disabled = disable[j];
  }

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var dialectElement;
function getDialect() {
  if (!dialectElement) { dialectElement = document.getElementById('dialect'); }
  return dialectElement.value;
}

function getDialectClean() {
  var d = getDialect();
  if (d == "") { d = "standard"; }
  return capitalizeFirstLetter(d);
}


function sendTiles(event, sid) {
  if (selectedTiles.length == 0) { return "No tiles selected"; }
  if (!event.target.winActive || event.target.winActive.length == 0) { return sid + " has no active workspaces"; }
  var dialect = getDialect();
  if (dialect != event.target.targetDialect) { return sid + " has a different dialect"; }

  //Get tiles
  var ce = event.target;
  var tileData = generateJSObjectFromSelected();
  if (tileData == null) {
    //Duplicate, probably won't trigger
    return "No tiles selected";
  }
  console.log("Selected Tiles: " + selectedTiles.length);
  var count = selectedTiles.length;
  for (var i = 0; i < selectedTiles.length; i++) {
    count += selectedTiles[i].getElementsByClassName('tile').length;
  }
  if (ws_sendTiles(sid, dialect, -1, tileData, event.target.targetWindex, count)) {
    ce.sending = true;
    ce.style.background = "yellow";
    return "OK";
  }
  return "Failed to send tiles to " + sid;
}

function combineTileData(data1,data2) {
  var d1 = data1.split("\n");
  var d2 = data2.split("\n");
  if (d1.length <= 1) {
    return data2;
  }

  //Remove Chunk section
  var c1 = d1.splice(d1.length-1,1)[0];
  var c2 = d2.splice(d2.length-1,1)[0];
  if (!d1[d1.length-1].startsWith("dialect")) {
    d1.push("\n");
  }
  // console.log("c1: " + c1);
  // console.log("c2: " + c2);

  var res = "";
  //Append all non dialect lines to data1
  for (var i = 0; i < d1.length; i++) {
    res += d1[i] + "\n";
  }

  for (var i = 0; i < d2.length; i++) {
    if (i == 0 && d2[i].startsWith("dialect")) { continue; }
    res += d2[i] + "\n";
  }

  //Add Combined chunk lines
  c2 = c2.replace("// chunks:","");
  c1 += c2;
  res += c1;

  // console.log(res);
  // console.log(d2);
  return res;
}

function loadTiles(blob) {
  var reader = new FileReader();
  reader.readAsText(blob);
  reader.addEventListener("load", function() {
      var data = combineTileData(generateStringCode(false),reader.result);
      minigrace.mode = "json";
      minigrace.compile(data);
      minigrace.mode = "js";
      var b = false;
      if (minigrace.generated_output == "") { b = true; }
      loadJSON(minigrace.generated_output,b,0,tiles.length);
      checkpointSave();
  });
}

function generateJSObjectFromSelected() {
    if (selectedTiles.length == 0) { return null; }
    var chunks = [];
    for (var i=0; i < selectedTiles.length; i++) {
      var tile = selectedTiles[i];
      if (tile.prev != false && tile.prev.classList.contains(highlight)) {
        continue;
      }
      var xy;
      if (tile.parentNode != codearea) {
        xy = findOffsetTopLeft(tile);
        xy.left += "px";
        xy.top += "px";
      } else {
        xy = {left:tile.style.left,top:tile.style.top};
      }

      var elements = [];
      while (tile && tile.classList.contains(highlight)) {
        elements.push(generateNodeJSON(tile));
        tile = tile.next;
      }
      chunks.push({type: 'chunk', x: xy.left, y: xy.top, body: elements});
    }
    var dialect = getDialect();
    var h = generateHash({chunks: chunks, dialect: dialect},null,2); 
    return decodeURIComponent(atob(h.substring(1)));
}

function conMenuStatusRequest(state) {
  var b = false;
  if (state != conState) { updateConMenuTitle(); }
  if (state && conState != state) { conState = state; b = true; }
  if (conMenu && conMenu.style.display == "") {
    if (conState == 2) {
      if (!b) {
        removeFromConMenu(-1);
      }
      conStatus.innerHTML = "Searching for devices...";
      ws_statusRequest();
      window.setTimeout(changeConStatus,3000);
    } else if (conState == 0) {
      connect();
    }
  }
}

function connect() {
  if (conState != 0) { return; }
  ws_startWebSocket();
  conStatus.innerHTML = "Connecting...";
  conState = 1;
}

function showConMenu(hide) {
  if (!conMenu && !hide) {
    setupConMenu();
    connect();
  }

  if (conMenu.style.display == "none" && hide != true) {
    //Show
    conMenu.style.display = "";
    conCount = 0;
    updateConMenuTitle();

    if (conState == 2) {
      //Look for devices
      conStatus.innerHTML = "Searching for devices...";
      if (ws_statusRequest()) {
        window.setTimeout(changeConStatus,3000);
      } else {
        console.log("Could not request status.");
        conStatus.innerHTML = "Not connected.";
      }
    }

    //Highlight tiles
    for (i = 0; i < tiles.length; i++) {
      // tiles[i].classList.add(highlight);
    }
  } else {
    //Hide
    conMenu.style.display = "none";
    //Remove Connection Menu Entries
    conList = [];
    while (conMenuBody.childElementCount > 0) {
      conMenuBody.removeChild(conMenuBody.children[0]);
    }
    for (i = 0; i < tiles.length; i++) {
      // tiles[i].classList.remove(highlight);
    }
  }
}



function changeConStatus() {
  if (conMenu.style.display == "none" || !ws_auth) { return; }
  if (conStatus.innerHTML != "Searching for devices...") { return; }
  conStatus.innerHTML = "Found " + conCount + " devices.";
}

function applyStyle(elem, id) {
  if (id == 0) {
    //#constatus
    elem.style.margin = "0px 0px 1px 0px";    elem.style.background = "darkgrey";    elem.style.textAlign = "center";    // elem.style.bottom = "-0.5%";    elem.style.position = "absolute";    elem.style.width = "100%";
  } else if (id == 1) {    //.conmenuentry    elem.style.color = "black";    elem.style.border = "2px groove hsl(90, 100%, 2%)";    elem.style.background = "#c4c4d7";    elem.style.margin = "0";    elem.style.fontSize = "12px";
    elem.style.fontFamily = "'Monaco','Menlo','Ubuntu Mono','Droid Sans Mono','Consolas',monospace";
  } else if (id == 2) {    //#conmenutitle    elem.style.fontSize = "19px";    elem.style.color = "black";    elem.style.textAlign = "center";    elem.style.padding = "0px";    elem.style.margin = "0px";    elem.style.border = "5px solid silver";
  } else if (id == 3) {    //#conmenu    elem.style.position = "relative";    elem.style.width = conWidth + "px";    elem.style.height = conHeight + "px";    elem.style.background = "white";    elem.style.opacity = "1";    elem.style.border = "5px solid silver";
    elem.style.maring = "0px 3px 0px;";
  } else if (id == 4) {
    elem.setAttribute("type","button");
    elem.style.width = "50%";
  }
}