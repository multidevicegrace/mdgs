var highlight = "highlighted";
var selectButton = document.getElementById('select_button');
var deleteButton = document.getElementById('delete_button');
var selectedTiles = document.getElementsByClassName(highlight);
var copyButton = document.getElementById('copy_button');
var collapser = document.getElementById('collapser');
var collapsers = document.getElementsByClassName('collapsers');
var collapseButton = document.getElementById('collapse_button');
var runButton = document.getElementById('runbutton');
var mgrunning = false;
var mgstop = false;
var mgtimer = null;

window.addEventListener('keyup',function(event) {
  codeareaKeybinds(event,true);
});
window.addEventListener('mouseup',function(event) {
  if (dragSelect) { selectMouseEvent(event,"u"); }
});
window.addEventListener('mousemove',function(event) {
  if (event.target == codearea) { return; }
  if (dragSelect) { selectMouseEvent(event,"m"); }
});
codearea.addEventListener('mousedown', function(ev) {
  if (selecting) { selectMouseEvent(ev,"d"); }
});
codearea.addEventListener('mousemove', function(ev) {
  if (selecting) { selectMouseEvent(ev,"m"); }
});
codearea.addEventListener('mouseup', function(ev) {
  if (selecting) { selectMouseEvent(ev,"u"); }
});

//Allow programs to be stopped whilst running
minigrace.trapErrorsFunc = minigrace.trapErrors;
minigrace.trapErrors = function(func) {
  if (mgtimer != null) {
    clearTimeout(mgtimer);
  }

  if (!mgrunning) {
    runButton.value = "Stop";
    mgrunning = true;    
  } else {
    if (mgstop) {
      mgrunning = false;
      mgstop = false;
      runButton.value = "Run";
      return;
    }
  }
  
  mgtimer = setTimeout(function() {
    mgrunning = false;
    mgstop = false;
    runButton.value = "Run";
  },300);
  
  minigrace.trapErrorsFunc(func);
};

var showErrorsInOutputArea = true;


var selecting = false;
function toggleSelect(b) {
  if (!selecting && !b) {
    codearea.style.cursor = "crosshair";
    hideMenus();
    clearPopouts();

  } else if (selecting || b == true) {
    codearea.style.cursor = null;
    endDragSelect(true);
  }

  if (!b) {
    selecting = !selecting;
  } else {
    selecting = false;
  }
}

var dragSelect = false;
var dragStart;
var dragDiv = null;
var dragID = 0;
function selectMouseEvent(event,id) {
  if (id == "m" && !dragSelect) { return; }
  if (id == "d" && event.target == codearea && event.button == 0) {
    if (!dragSelect) {
      //Start drag select
      dragSelect = true;
      dragStart = {x:event.clientX,y:event.clientY};
      event.preventDefault();
    }
  }

  if (id == "m" && dragSelect) {
    event.preventDefault();
    if (dragDiv == null) {
      dragDiv = document.createElement("div");
      dragDiv.setAttribute("class","drag_div");
      document.body.appendChild(dragDiv);
    }

    var l, t;
    var w, h;

    if (event.clientX < dragStart.x) {
      l = event.clientX;
    } else {
      l = dragStart.x;
    }
    if (event.clientY < dragStart.y) {
      t = event.clientY;
    } else {
      t = dragStart.y;
    }
    w = Math.abs(event.clientX - dragStart.x);
    h = Math.abs(event.clientY - dragStart.y);
    dragDiv.style.left = l + "px";
    dragDiv.style.top = t + "px";
    dragDiv.style.width = w + "px";
    dragDiv.style.height = h + "px";

    var c = selectTilesWithinArea(l,t,l+w,t+h);
  }

  if (id == "u" && dragSelect) {
    endDragSelect();
  } else if (id == "u" && event.target != codearea) {
    //Select single tile
    selectTile(event.target);
  }
}

var leeway = 3;
function selectTilesWithinArea(l,t,r,b) {
  var count = 0;
  var changed = false;
  for (var i = 0; i < tiles.length; i++) {
    if (tiles[i].parentNode != codearea) { continue; }
    var left = 0;
    var top = 0;
    var width = tiles[i].offsetWidth - leeway * 2;
    var height = tiles[i].offsetHeight - leeway * 2;
    var d = findOffsetTopLeft(tiles[i]);
    left = d.left + leeway - codearea.scrollLeft;
    top = d.top + leeway - codearea.scrollTop;

    if (left >= l && top >= t && left + width <= r && top + height <= b) {
      if (!tiles[i].classList.contains(highlight)) {        
        tiles[i].classList.add(highlight);
        tiles[i].dragID = dragID;
        changed = true;
        count++;
      }
    } else {
      if (tiles[i].classList.contains(highlight) && tiles[i].dragID == dragID) {
        tiles[i].classList.remove(highlight);        
        changed = true;
      }
    }
    if (changed) { copyBonus = 5; }
  }
  return count;
}

function selectTile(tile) {
  var t = tile;
  while (!t.classList.contains("tile") && t != null) {
    t = t.parentNode;
  }
  if (t == null) { return; }

  if (t.classList.contains(highlight)) {
    t.classList.remove(highlight);
  } else {
    if (t.parentNode != codearea) {
    //Unselect other tiles
      Array.prototype.forEach.call(tiles, function(e) {
        e.classList.remove(highlight);
      });
    } else {
      if (selectedTiles.length > 0 && selectedTiles[0].parentNode != codearea) {
        selectedTiles[0].classList.remove(highlight);
      }
    }
    t.classList.add(highlight);
  }
  copyBonus = 5;




  if (selectedTiles.length != 0) {
    deleteButton.value = "Remove Selected";
    copyButton.value = "Clone Selected";
    collapseButton.value = "Collapse Selected";
  } else {
    deleteButton.value = "Remove All";
    copyButton.value = "Clone All";
    collapseButton.value = "Collapse All";
  }
}

function selectAllTiles() {
  Array.prototype.forEach.call(tiles,function(e) {
    if (e.parentNode == codearea && !e.classList.contains(highlight)) {
      e.classList.add(highlight);
    }
  });
  //Change buttons
}



function codeareaKeybinds(event,esc) {
  /* Keys used in original:
  //r -> run
  //v -> toggle code view

  //New Keys:
  //Ctrl + Z -> undo (back) (don't think there is a way to stop this going to previous non tg websites)
               // can't check history
               // can't reliably remove a cookie on page exit
  //Ctrl + Y -> redo (forward)
  //T        -> Toggle Select
  //
  //For selected tiles:
  //Del      -> delete selected
  //Ctrl + C -> copy
  //Ctrl + V -> paste
  //Esc      -> cancel select mode (+ selection?)
  //Right click (collapse)
  */
  if (codearea.style.display == "none") { return; }

  var alt = event.altKey;
  var shift = event.shiftKey;
  var ctrl = event.ctrlKey && !alt && !shift;
  var key = event.key;
  var keycode = event.keyCode;

  // console.log("Ctrl: " + ctrl + ", key: " + key + ", esc: " + esc);

  if (!esc) {
    if (event.target == document.body) {
      if (!ctrl && key == "t") {
        toggleSelect();
        return;
      }
    }

    if (!selecting) {
      if (ctrl) {
        if (key == "z" || keycode == 26) {
          window.history.back();
        } else if (key == "y" || keycode == 25) {
          window.history.forward();
        }
      }
    } else {
      //Not Selecting
    }

    //
    if (event.target == document.body) {
      if (key == "c" && !ctrl) {
        copyTiles();
      } else if (key == "q") {
        collapseTiles();
      } else if (key == "g") {
        groupTiles();
      }
    }



  } else {
    if (key == "Escape") {            
      toggleSelect(true);
    } else if (key == "Delete") {      
      if (event.target == document.body || event.target.getAttribute("type") == "button") {
        clearCode();
      }
    } else if (key == "a") {      
      if (ctrl && event.target == document.body) {
        selectAllTiles();
      }
    }
  }
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

function groupTiles() {
  if (selectedTiles.length < 2) { return; }

  var ts = [];

  //Remove current prev + next
  var ax = 0;
  for (var i = 0; i < selectedTiles.length; i++) {
    if (selectedTiles[i].parentNode != codearea) { continue; }
    var p = selectedTiles[i];
    var xy = findOffsetTopLeft(selectedTiles[i]);
    var counter = 0;
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
  reflow();
  generateCode();
  checkpointSave();  
}

function compareTileTop(a,b) {  
  if (a.y < b.y) { return -1; }
  return 1;
}

var copyBonus = 50;
var copied = false;
function copyTiles(e) {
  if (copied) { return; }
  if (selectedTiles.length == 0) { return; }
  var tileCount = tiles.length;
  var newTiles = [];
  if (selectedTiles.length == 1 && selectedTiles[0].parentNode != codearea) {
    var t = selectedTiles[0].cloneNode(true);
    codearea.appendChild(t);
    t.classList.remove(highlight);
    var xy = findOffsetTopLeft(selectedTiles[0]);
    // console.log(xy);
    t.style.left = xy.left + copyBonus + "px";
    t.style.top = xy.top + copyBonus + "px";
    // console.log(t.style.left + "," + t.style.top);
    t.style.position = "absolute";
    newTiles.push(t);
  } else if (selectedTiles.length >= 1) {
    Array.prototype.forEach.call(selectedTiles,function(e) {
      if (e.parentNode != codearea) { return; }
      var t = e.cloneNode(true);
      codearea.appendChild(t);
      t.classList.remove(highlight);
      t.style.left = parseFloat(t.style.left) + copyBonus + "px";
      t.style.top = parseFloat(t.style.top) + copyBonus + "px";
      newTiles.push(t);
      var i = newTiles.length-1;
      // console.log(newTiles.length + ", " + i + ", "  + newTiles[i]);
      if (e.prev && i > 0 && e.prev.classList.contains(highlight)) {
        t.prev = newTiles[i-1];
        newTiles[i-1].next = t;
      }
    });
  } else {
    Array.prototype.forEach.call(codearea.children,function(e) {
      if (!e.classList.contains('tile')) { return; }
      var t = e.cloneNode(true);
      codearea.appendChild(t);
      t.classList.remove(highlight);
      t.style.left = parseFloat(e.style.left) + copyBonus + "px";
      t.style.top = parseFloat(e.style.top) + copyBonus + "px";
      newTiles.push(t);
      var i = newTiles.length-1;
      // console.log(newTiles.length + ", " + i + ", "  + newTiles[i]);
      if (e.prev && i > 0) {
        t.prev = newTiles[i-1];
        newTiles[i-1].next = t;
      }
    });
  }
  copyBonus += 10;
  Array.prototype.forEach.call(newTiles,function(e) {
    attachTileBehaviour(e);
    var tileChildren = e.getElementsByClassName('tile');
    for (var i=0; i<tileChildren.length; i++) {
      if (tileChildren[i].classList.contains('tile')) {
        attachTileBehaviour(tileChildren[i]);
      }
    }

    var holesN = e.getElementsByClassName('hole multi');
    fixNextPrev(holesN);
  });

  updateTileIndicator();
  generateCode();
  reflow();
  checkpointSave();
  clearPopouts();

  copied = true;
  copyButton.setAttribute("disabled",true);

  //Lazy timer to prevent crash (happens when copying too many tiles too quickly)
  var timeout = Math.min(2500,(tiles.length - tileCount) * 50);
  window.setTimeout(function() { copied = false; copyButton.removeAttribute("disabled"); },timeout);
}


function endDragSelect(b) {
  if (!dragSelect && !b) { return; }
  if (dragDiv != null) {
    document.body.removeChild(dragDiv);
    dragDiv = null;
  }
  dragStart = null;
  dragSelect = false;
  dragID++;
  if (b) {
    dragID = 0;
    Array.prototype.forEach.call(tiles,function(e) {
      e.classList.remove(highlight);
      delete e.dragID;
    });
    deleteButton.value = "Remove All";
    copyButton.value = "Clone All";
    collapseButton.value = "Collapse All";

  } else {
    if (selectedTiles.length != 0) {
      deleteButton.value = "Remove Selected";
      copyButton.value = "Clone Selected";
      collapseButton.value = "Collapse Selected";
    }
  }

}

function collapseTiles(list,targ) {
  if (selectedTiles.length == 0 && list == undefined) { return; }
  var cts;

  var a = false;
  //Selected tiles, or all if none selected
  if (selectedTiles.length != 0) {
    cts = selectedTiles;
  } else {
    cts = tiles;
    a = true;
  }
  if (list != undefined) {
    cts = list;
    // console.log("Collapse: " + list + " " + list[0].classList);
    a = false;
  }

  var ts = [];
  //Reduce to collapsable tiles
  for (var i = 0; i < cts.length; i++) {
    if (cts[i].parentNode != codearea) { continue; }
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
      // console.log(ts[ts.length-1]);
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
        // console.log(ts[ts.length-1]);
        t = cts[i];
        while (t.next) {
          t = t.next;
          t.cflag = 1;
        }
      }
    }
  }




  for (var i = 0; i < cts.length; i++) {
    delete cts[i].cflag;
  }




  //Check if tiles in selection are already collapsed
  var collapse = true;
  var max = ts.length;
  var min = 0;
  var count = 0;
  for (var i = 0; i < ts.length; i++) {
    // console.log(ts[i].t + " " + ts[i].t.classList);
    if (ts[i].t.collapsed) {
      count++;
    }
  }

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
        cb.addEventListener('click',function(e) {
          collapseTiles([event.target.parentNode],event.target);
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
        cb.addEventListener('click',function(e) {
          collapseTiles([event.target.parentNode],event.target);
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
        ts[i].t.removeChild(cb);
      } else if (ts[i].v == 1) {

        Array.prototype.forEach.call(ts[i].t.getElementsByClassName('multi hole'),function(e,i) {
          e.style.display = "";
        });

        //Remove collapse block
        // var id = 0;
        // if (min != 0) { id = min; }
        var cb = ts[i].t.getElementsByClassName('collapsers')[min];
        ts[i].t.removeChild(cb);
      }
    }
  }
  reflow();
}


function clearCode() {
  //Clear code - also update url
  if (selectedTiles.length == 0) { return; }
  
  if (selectedTiles.length != 0) {
    while (selectedTiles.length != 0) {
      selectedTiles[0].parentNode.removeChild(selectedTiles[0]);
    }
    deleteButton.value = "Remove All";
    copyButton.value = "Clone All";
    collapseButton.value = "Collapse All";
  } else {
    while (tiles.length != 0) {
      tiles[0].parentNode.removeChild(tiles[0]);
    }
  }

  if (tiles.length == 0) {
    copyButton.removeAttribute("disabled");
  }

  generateCode();
  checkpointSave();
}