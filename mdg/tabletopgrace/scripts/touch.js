"use strict"
var targets = [];
var dragStarted = false;
var nodes = {};
var touches = {};
var pieMenuTouches = {};
var windowTouches = {};
var optTouches = {};
var btnTouches = {};
var segTouches = {};
var windowMenuTouches = {};
var segmentTouches = {};

//Squared distance in pixels
var pieMenuMoveThresholdCount = 10;
var pieMenuMoveThresholdDistance = 40;
var tileMenuMoveThresholdDistance = 30;
var wMenuThresholdDistance = 50;
var wMenuMoveThresholdDistance = 20;
var windowTouchTypeTimer = 5;
var windowTouchPolyUpdateTimer = 5;
var optMoveThresholdDistance = 2;
var btnMoveThresholdDistance = 2;
var segMoveThresholdDistance = 20;
var secMenuDistance = 100;
var scrollTouchDist = 100;
var scrollTouchThresh = .2;

var currentFocus;
var hasFocus = false;
var pieMenuEndDelay = 100;
var shortPress = 200;
var longPress = 400;
var longPressPie = 300;

var aceContent;

var toDeg = (180 / Math.PI);
var toRad = Math.PI / 180;

var sameDirThresh = 10 * toRad //10deg
var rotateMinThresh = 3 * toRad //3deg
var moveThresh = 1;
var lastUpdate;
var lastUpdate2;

var tileZIndex2 = [5,5,5,5];
var tileLastZIndex2 = [5,5,5,5];
var tileMaxZIndex = 1000;
var highlight = "highlighted";
var drag_mode = 1;

var keyboards = [];
var polys = {};
var polyCounter = 0;


function addTouch(i) {
  addPieTouch(i);
  addTileTouch(i);
}

function setTilesZIndex(id) {
  //Give all tiles a zindex
  for (var i = 0; i < tiles2[id].length; i++) {
    tiles2[id][i].style.zIndex = tileZIndex2[id];
  }
}

function tileBringToFront(tile) {
  var id = tile.windex;
  if (tile.style.zIndex == tileLastZIndex2[id] && tileLastZIndex2[id] != tileZIndex2[id]) { return; }
  tileLastZIndex2[id]++;
  tile.style.zIndex = tileLastZIndex2[id];
  if (tileLastZIndex2[id] > tileMaxZIndex) {
    setTilesZIndex(id);
    tileLastZIndex2[id] = tileZIndex2[id] + 1;
    tile.style.zIndex = tileLastZIndex2[id];
  }
}

function resetPage() {
  window.location = window.location.pathname;
}

function addPieTouch(i) {
  codearea2[i].addEventListener('touchstart', pieTouchStart);
  codearea2[i].addEventListener('touchmove', pieTouchMove);
  codearea2[i].addEventListener('touchend', pieTouchEnd);
  editor4[i].addEventListener('touchstart', pieTouchStart);
  editor4[i].addEventListener('touchmove', pieTouchMove);
  editor4[i].addEventListener('touchend', pieTouchEnd);
  editor4[i].windex = codearea2[i].windex;
  codearea2[i].t1 = codearea2[i].t2 = null;
}

function addPieMenuTouch(seg, func) {
  seg.addEventListener('touchstart', segTouchStart);
  seg.addEventListener('touchmove', segTouchMove);
  seg.addEventListener('touchend', segTouchEnd);
  seg.func = func;
}

function addOptTouch(opt, func) {
  opt.addEventListener('touchstart', optTouchStart);
  opt.addEventListener('touchmove', optTouchMove);
  opt.addEventListener('touchend', optTouchEnd);
  opt.func = func;
}

function addButtonTouch(btn, func, src) {
  btn.addEventListener('touchstart', btnTouchStart);
  btn.addEventListener('touchmove', btnTouchMove);
  btn.addEventListener('touchend', btnTouchEnd);
  btn.btnFunc = func;
  btn.btnSrc = src;
}

function addWMenuTouch() {
  windowarea = document.getElementById("windowarea");
  windowarea.style.pointerEvents = "none";
  var blank = document.getElementById("blank");
  blank.addEventListener('touchstart', function(event) { event.preventDefault(); });
  blank.addEventListener('touchmove', function(event) { event.preventDefault(); });
  blank.addEventListener('touchend', function(event) { event.preventDefault(); });


  for (var i = 0; i < 4; i++) {
    var id = "svg_" + i;
    var elem = document.getElementById(id);
    if (system_mode == 1) {
      elem.parentNode.removeChild(elem);
      continue;
    }
    elem.addEventListener('touchstart', function(event) { event.preventDefault(); });
    elem.addEventListener('touchmove', function(event) { event.preventDefault(); });
    elem.addEventListener('touchend', function(event) { wMenuEnd(event); });
    elem.addEventListener("click", function(event) { if (!mouse) { return; } showWindowMenu2(event); event.preventDefault(); });
    elem.style.pointerEvents = "all";
  }
}


function btnTouchStart(event) {
  for (var i = 0; i < event.targetTouches.length; i++) {
    var id = event.targetTouches[i].identifier;

    if (!(id in btnTouches)) {
      //New Touch Event
      event.preventDefault();
      var x = event.targetTouches[i].clientX;
      var y = event.targetTouches[i].clientY;

      btnTouches[id] = {x:x, y:y, target:event.target};
    }
  }
}

function btnTouchMove(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in btnTouches)) { continue; }
    if (btnTouches[id].target == event.target && id in btnTouches) {
      //Distance check
      var x = event.changedTouches[i].clientX;
      var y = event.changedTouches[i].clientY;
      var dist = Math.sqrt(Math.pow(x - btnTouches[i].x, 2) + Math.pow(y - btnTouches[i].y, 2));
      if (dist > btnMoveThresholdDistance) {
        delete btnTouches[id];
        continue;
      }
    }
  }
}

function btnTouchEnd(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in btnTouches)) { continue; }
    if (btnTouches[id].target == event.target && id in btnTouches) {
      event.target.btnFunc(event, event.target.btnSrc);
    }
    delete btnTouches[id];
  }
}

function wMenuEnd(event) {
  // console.log("wMenuEnd");
  event.preventDefault();
  for (var i = 0; i < event.changedTouches.length; i++) {
    var x = event.changedTouches[i].clientX;
    var y = event.changedTouches[i].clientY;
    showWindowMenu2(event, x, y)
  }
}

function segTouchStart(event) {
  for (var i = 0; i < event.targetTouches.length; i++) {
    var id = event.targetTouches[i].identifier;

    if (!(id in segTouches)) {
      //New Touch Event
      event.preventDefault();
      var x = event.targetTouches[i].clientX;
      var y = event.targetTouches[i].clientY;

      segTouches[id] = {x:x, y:y, target:event.target};
    }
  }
}

function segTouchMove(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in segTouches)) { continue; }
    if (segTouches[id].target == event.target && id in segTouches) {
      //Distance check
      var x = event.changedTouches[i].clientX;
      var y = event.changedTouches[i].clientY;
      var dist = Math.sqrt(Math.pow(x - segTouches[i].x, 2) + Math.pow(y - segTouches[i].y, 2));
      if (dist > segMoveThresholdDistance) {
        delete segTouches[id];
        continue;
      }
    }
  }
}

function segTouchEnd(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in segTouches)) { continue; }
    if (segTouches[id].target == event.target && id in segTouches) {
      event.target.func(event);
    }
    delete segTouches[id];
  }
}

function optTouchStart(event) {
  for (var i = 0; i < event.targetTouches.length; i++) {
    var id = event.targetTouches[i].identifier;

    if (!(id in optTouches)) {
      //New Touch Event
      event.preventDefault();
      var x = event.targetTouches[i].clientX;
      var y = event.targetTouches[i].clientY;

      optTouches[id] = {x:x, y:y, target:event.target};
    }
  }
}

function optTouchMove(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in optTouches)) { continue; }
    if (optTouches[id].target == event.target && id in optTouches) {
      //Distance check
      var x = event.changedTouches[i].clientX;
      var y = event.changedTouches[i].clientY;
      var dist = Math.sqrt(Math.pow(x - optTouches[i].x, 2) + Math.pow(y - optTouches[i].y, 2));
      if (dist > optMoveThresholdDistance) {
        delete optTouches[id];
        continue;
      }
    }
  }
}

function optTouchEnd(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in optTouches)) { continue; }
    if (optTouches[id].target == event.target && id in optTouches) {
      event.target.func(event);
    }
    delete optTouches[id];
  }
}

function wMenuTouchStart(event) {
  // console.log('wMenuTouchStart: ' + event.target);
  for (var i = 0; i < event.targetTouches.length; i++) {
    var id = event.targetTouches[i].identifier;

    if (!(id in windowMenuTouches)) {
      //New Touch Event
      event.preventDefault();
      var x = event.targetTouches[i].clientX;
      var y = event.targetTouches[i].clientY;

      windowMenuTouches[id] = {x:x, y:y, target:event.target, ts:Date.now()};
    }
  }
}

function wMenuTouchMove(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in windowMenuTouches)) { continue; }
    if (windowMenuTouches[id].target == event.target && id in windowMenuTouches) {
      //Distance check
      var x = event.changedTouches[i].clientX;
      var y = event.changedTouches[i].clientY;
      var dist = Math.sqrt(Math.pow(x - windowMenuTouches[id].x, 2) + Math.pow(y - windowMenuTouches[id].y, 2));
      if (dist > wMenuMoveThresholdDistance) {
        delete windowMenuTouches[id];
        // console.log(id + " wMenuTouchMove delete");
        continue;
      }
    }
  }
}

function wMenuTouchEnd(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in windowMenuTouches)) { continue; }
    var timeDif = Date.now() - windowMenuTouches[id].ts;
    if (timeDif > shortPress) {
      windowMenuClick(windowMenuTouches[id].target.idx,windowMenuTouches[id].target.parentNode.idx,2);
    } else {
      windowMenuClick(windowMenuTouches[id].target.idx,windowMenuTouches[id].target.parentNode.idx,1, [windowMenuTouches[id].x,windowMenuTouches[id].y]);
    }

    delete windowMenuTouches[id];
  }
}

function pieTouchStart(event) {
  // console.log("P: " + event.target);
  if (event.target.style.display == "none") { return; }
  if (!event.target.classList.contains('codearea') && !event.target.classList.contains('ace_content')) { return; }
  if (event.target.classList.contains('codearea') && event.target.style.visibility == 'hidden') { return; }

  //Remove focus
  if (hasFocus && system_mode == 1) {
    currentFocus.blur();
    currentFocus = null;
    hasFocus = false;
    return;
  }

  var s = "Touches: ";
  var windex = event.target.windex;
  if (windex) {
    var tt = event.target.parentNode;
    while (tt != null ) {
      windex = tt.windex;
      tt = tt.parentNode;
      if (windex) { break; }
    }
  }

  event.preventDefault();

  var ii = "";
  for (var i = 0; i < event.targetTouches.length; i++) {
    ii += " " + i;
    var id = event.targetTouches[i].identifier;
    if (!(id in pieMenuTouches) && !(id in windowTouches)) {
      //New Touch Event
      var x = event.targetTouches[i].clientX;
      var y = event.targetTouches[i].clientY;

      pieMenuTouches[id] = {x:x, y:y, updates:0, target:event.targetTouches[i].target, id:id, windex: windex, time:Date.now()}


      if (system_mode == 0 && (codearea2[windex].t1 == id || codearea2[windex].t2 == id)) {
        codearea2[windex].t1 = codearea2[windex].t2 = null;
        lastUpdate = null;        
      } else if (system_mode == 1) {
        lastUpdate2 = null;
      }
    }
  }
  // console.log("Touch Start:" + ii);
}

function pieTouchMove(event) {
  if (event.target.style.display == "none") { return; }
  if (!event.target.classList.contains('codearea') && !event.target.classList.contains('ace_content')) { return; }
  event.preventDefault();
  var dragUpdate = false;
  var ii = "";
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    ii += " (" + i + " " + id + ")";
    if (id in pieMenuTouches) {
      if (pieMenuTouches[id].dying) {
        continue;
      }
      //Moves check - Number of updates since this touch began
      if (pieMenuTouches[id].updates > pieMenuMoveThresholdCount) {
        pieMenuTouches[id].dying = 1;
        window.setTimeout(pieTouchDelayedEnd, pieMenuEndDelay, id);
        continue;
      }

      var windex = pieMenuTouches[id].windex;
      //Distance check
      var x = event.changedTouches[i].clientX;
      var y = event.changedTouches[i].clientY;
      var dist = Math.sqrt(Math.pow(x - pieMenuTouches[id].x, 2) + Math.pow(y - pieMenuTouches[id].y, 2));
      if (dist > pieMenuMoveThresholdDistance) {
        windowTouches[id] = pieMenuTouches[id];
        delete pieMenuTouches[id];
        windowTouches[id].counter = 0;
        windowTouches[id].type = 0;
        continue;
      }

      pieMenuTouches[id].updates++;
    } else if (id in windowTouches) {
      if (system_mode == 0) {
        if (windowTouches[id].ignore) { continue; }
        var windex = windowTouches[id].windex;

        //Check for two new touches that are close enough to start a drag
        if (windowTouches[id].type == 0) {
           var found = false;
          // console.log("codearea2 t1: " + codearea2[windex].t1);
          if (codearea2[windex].t1 == null) {
            var list = Object.keys(windowTouches);
            if (!event.changedTouches[id]) { continue; }
            for (var j = 0; j < list.length; j++) {
              var id2 = list[j];
              // console.log("J: " + j + ", id2: " + id2 + ", ct[id2]: " + event.changedTouches[id2]);
              if (id2 == id) { continue; }
              if (!event.changedTouches[id2]) { continue; }
              if (windowTouches[id2].ignore) { continue; }
              if (windowTouches[id2].type != 0) { continue; }
              if (windowTouches[id2].counter >= windowTouchTypeTimer) { continue; }

              var dist = Math.sqrt(Math.pow(event.changedTouches[id].clientX - event.changedTouches[id2].clientX, 2)
                  + Math.pow(event.changedTouches[id].clientY - event.changedTouches[id2].clientY, 2));
              if (dist < scrollTouchDist) {
                // console.log("Type 1: " + id + ", " + id2);
                windowTouches[id].type = windowTouches[id2].type = 1;
                codearea2[windex].t1 = id;
                codearea2[windex].t2 = id2;
                found = true;
                break;
              } else {
                // console.log(id + " vs " + list[j].id + " : " + dist + " >= " + scrollTouchDist);
              }
            }
          }
          if (!found) {
            windowTouches[id].counter++;
            if (windowTouches[id].counter >= windowTouchTypeTimer) {
              // console.log("Touch: " + id + " -> type 2");
              windowTouches[id].type = 2;
              windowTouches[id].counter = 0;
              var pos = null;
              if (windows[windex].rid == 0) {
                pos = positionCorrection([windowTouches[id].x,windowTouches[id].y],windex);
              } else {
                pos = rotateXY(windex,windows[windex].rid,windowTouches[id].x,windowTouches[id].y);
              }
              windowTouches[id].xPoints = [pos[0]];
              windowTouches[id].yPoints = [pos[1]];
            }
          }
        } else if (windowTouches[id].type == 1 && !dragUpdate) {
          //Perform drag
          var t1 = event.changedTouches[codearea2[windex].t1];
          var t2 = event.changedTouches[codearea2[windex].t2];
          // console.log("T1: " + t1 + ", T2: " + t2);
          if (t1 != null && t2 != null) {
            var dist = Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2));
            // console.log("LastUpdate: " + lastUpdate);
            if (dist < scrollTouchDist) {
              if (lastUpdate != null) {
                var dir1 = [t1.clientX - lastUpdate.t1[0], t1.clientY - lastUpdate.t1[1]];
                if (Math.abs(dir1[0] + dir1[1]) < scrollTouchThresh) {
                  // console.log("Drag dir1 was too small: " + (dir1[0] + dir1[1]) + " < " + scrollTouchThresh);
                  continue;
                }
                var dir2 = [t2.clientX - lastUpdate.t2[0], t2.clientY - lastUpdate.t2[1]];
                if (Math.abs(dir2[0] + dir2[1]) < scrollTouchThresh) {
                  // console.log("Drag dir2 was too small: " + (dir2[0] + dir2[1]) + " < " + scrollTouchThresh);
                  continue;
                }
                // console.log("Drag: " + dir1 + ", " + dir2);
                var aDir = [(dir1[0] + dir2[0]) * 0.5, (dir1[1] + dir2[1]) * 0.5];
                // console.log("Drag aDir: " + aDir);
                if (windows[windex].rid == 0) {
                  codearea2[windex].scrollLeft += aDir[0];
                  codearea2[windex].scrollTop += aDir[1];
                } else if (windows[windex].rid == 1) {
                  codearea2[windex].scrollLeft += aDir[1];
                  codearea2[windex].scrollTop -= aDir[0];
                } else if (windows[windex].rid == 2) {
                  codearea2[windex].scrollLeft -= aDir[1];
                  codearea2[windex].scrollTop += aDir[0];
                } else if (windows[windex].rid == 3) {
                  codearea2[windex].scrollLeft -= aDir[0];
                  codearea2[windex].scrollTop -= aDir[1];
                }
              }
              // lastUpdate = {t1:[t1.clientX, t1.clientY], t2:[t2.clientX, t2.clientY]};
            } else {

              // console.log("Drag too big: " + dist + " >= " + scrollTouchDist);
            }
            lastUpdate = {t1:[t1.clientX, t1.clientY], t2:[t2.clientX, t2.clientY]};

          } else {
           // console.log("Drag T1 or T2 is null: >" + t1 + "< , >" + t2 + "<");
          }
          dragUpdate = true;
        } else if (windowTouches[id].type == 2) {
          //Select tool
          if (!event.changedTouches[id]) { continue; }
          if (windowTouches[id].counter % windowTouchPolyUpdateTimer == 0) {
            var pos = null;
            if (windows[windex].rid == 0) {
              pos = positionCorrection([event.changedTouches[id].clientX,event.changedTouches[id].clientY],windex);
            } else {
              pos = rotateXY(windex,windows[windex].rid,event.changedTouches[id].clientX,event.changedTouches[id].clientY);
            }
            windowTouches[id].xPoints.push(pos[0]);
            windowTouches[id].yPoints.push(pos[1]);
            var points = "";
            for (var j = 0; j < windowTouches[id].xPoints.length; j++) {
              if (j != 0) { points += ","; }
              points += windowTouches[id].xPoints[j] + " " + windowTouches[id].yPoints[j];
            }

            var polyID;
            var polyline;
            var line;
            if (windowTouches[id].polyID != undefined) {
              polyID = windowTouches[id].polyID;
            } else {
              polyID = polyCounter;
              windowTouches[id].polyID = polyID;
              polyCounter++;
            }

            if (!polys[polyID]) {
              //Polyline
              polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline'); //Create a path in SVG's namespace
              polyline.setAttribute("points",points);
              polyline.setAttribute("fill",windowColours2[windex]);
              polyline.setAttribute("opacity","0.3");
              polyline.setAttribute("stroke",windowColours[windex]);
              // polyline.setAttribute("stroke-dasharray","5,5");
              polyline.setAttribute("fill-rule","evenodd");
              polyline.setAttribute("stroke-width","3px");
              polyline.polyID = polyID;
              polyline.style.pointerEvents = "all";
              polyline.addEventListener('touchend',function(event) {
                // mdebug("touchend poly " +  event.target.polyID + " |");
                removePoly(event.target.polyID);                
              });
              a_svgs[windex].appendChild(polyline);

              //Line
              line = document.createElementNS("http://www.w3.org/2000/svg", 'line'); //Create a path in SVG's namespace
              line.setAttribute("x1",windowTouches[id].xPoints[0]);
              line.setAttribute("y1",windowTouches[id].yPoints[0]);
              line.setAttribute("x2",pos[0]);
              line.setAttribute("y2",pos[1]);
              line.setAttribute("fill","none");
              line.setAttribute("stroke",windowColours[windex]);
              line.setAttribute("stroke-dasharray","5,10");
              a_svgs[windex].appendChild(line);

              windowTouches[id].line = line;
              windowTouches[id].polyline = polyline;
            } else {
              polyline = polys[polyID].p;
              line = polys[polyID].l;
              polyline.setAttribute("points",points);
              line.setAttribute("x2",pos[0]);
              line.setAttribute("y2",pos[1]);
            }

            polys[polyID] = {p:polyline,l:line,w:windex,i:id,x:windowTouches[id].xPoints,y:windowTouches[id].yPoints,x2:pos[0],y2:pos[1],x3:codearea2[windex].scrollLeft,y3:codearea2[windex].scrollTop};

            //Select Tiles
            var v = [];
            for (var j = 0; j < windowTouches[id].xPoints.length; j++) {
              v.push({x:windowTouches[id].xPoints[j]+codearea2[windex].scrollLeft,y:windowTouches[id].yPoints[j]+codearea2[windex].scrollTop});
            }
            v.push(v[0]);

            var count = 0;
            for (var j = 0; j < tiles2[windex].length; j++) {
              if (tiles2[windex][j].parentNode != codearea2[windex]) { continue; }
              if (tiles2[windex][j].highlight != null && tiles2[windex][j].highlight.length != 0 && tiles2[windex][j].highlight.includes(polyID)) { continue; }
              var xy = findOffsetTopLeft(tiles2[windex][j]);
              xy.top = xy.top + tiles2[windex][j].offsetHeight * .5;
              xy.left = xy.left + tiles2[windex][j].offsetWidth * .5;

              if (inPoly({x:xy.left,y:xy.top},v) != 0) {
                //In poly
                if (tiles2[windex][j].highlight == null || tiles2[windex][j].highlight.length == 0) {
                  tiles2[windex][j].highlight = [polyID];
                  tiles2[windex][j].classList.add(highlight);
                } else {
                  if (!tiles2[windex][j].highlight.includes(polyID)) {
                    tiles2[windex][j].highlight.push(polyID);
                  }
                }

                count++;
              } else {
                if (tiles2[windex][j].highlight != null) {
                  tiles2[windex][j].highlight.remove(polyID);
                  if (tiles2[windex][j].highlight.length == 0) {
                    tiles2[windex][j].classList.remove(highlight);
                  }
                }
              }
            }
          }
          windowTouches[id].counter++;
        }

      } else if (system_mode == 1) {
        if (drag_mode == 0) {
          // mdebug("Drag " + (lastUpdate2 == null));
          var t1 = event.changedTouches[id];
          if (lastUpdate2 != null) {
            var dir1 = [t1.clientX - lastUpdate2.t1[0], t1.clientY - lastUpdate2.t1[1]];
            // mdebug((dir1[0].toFixed(1)) + " " + (dir1[1].toFixed(1)));
            // mdebug(codearea2[0].scrollLeft + " " + codearea2[0].scrollTop);
            codearea2[0].scrollLeft -= dir1[0];
            codearea2[0].scrollTop -= dir1[1];
          }
          lastUpdate2 = {t1:[t1.clientX,t1.clientY]};
        } else {
          var windex = windowTouches[id].windex;
          if (windowTouches[id].type == 0) {           
            windowTouches[id].type = 2;
            var pos = null;            
            pos = positionCorrection([windowTouches[id].x,windowTouches[id].y],windex);            
            windowTouches[id].xPoints = [pos[0]];
            windowTouches[id].yPoints = [pos[1]];
            // mdebug("L: " + windowTouches[id].xPoints.length);
            continue;
          }
          // mdebug(windex + " " + (!event.changedTouches[id]) + " " + windowTouches[id].counter);
          if (!event.changedTouches[id]) { continue; }
          // mdebug((windowTouches[id].counter % windowTouchPolyUpdateTimer));

          if (windowTouches[id].counter % windowTouchPolyUpdateTimer == 0) {            
            var pos = null;
            pos = positionCorrection([event.changedTouches[id].clientX,event.changedTouches[id].clientY],windex);            
            windowTouches[id].xPoints.push(pos[0]);
            windowTouches[id].yPoints.push(pos[1]);          
            var points = "";
            for (var j = 0; j < windowTouches[id].xPoints.length; j++) {
              if (j != 0) { points += ","; }
              points += windowTouches[id].xPoints[j] + " " + windowTouches[id].yPoints[j];
            }
          
            var polyID;
            var polyline;
            var line;
            if (windowTouches[id].polyID != undefined) {
              polyID = windowTouches[id].polyID;
            } else {
              polyID = polyCounter;
              windowTouches[id].polyID = polyID;
              polyCounter++;
            }

            if (!polys[polyID]) {
              //Polyline
              polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline'); //Create a path in SVG's namespace
              polyline.setAttribute("points",points);
              polyline.setAttribute("fill",windowColours2[windex]);
              polyline.setAttribute("opacity","0.3");
              polyline.setAttribute("stroke",windowColours[windex]);
              // polyline.setAttribute("stroke-dasharray","5,5");
              polyline.setAttribute("fill-rule","evenodd");
              polyline.setAttribute("stroke-width","3px");
              a_svgs[windex].appendChild(polyline);
              polyline.polyID = polyID;
              polyline.style.pointerEvents = "all";
              polyline.addEventListener('touchend',function(event) {
                // mdebug("touchend poly " +  event.target.polyID + " |");
                removePoly(event.target.polyID);                
              });

              //Line
              line = document.createElementNS("http://www.w3.org/2000/svg", 'line'); //Create a path in SVG's namespace
              line.setAttribute("x1",windowTouches[id].xPoints[0]);
              line.setAttribute("y1",windowTouches[id].yPoints[0]);
              line.setAttribute("x2",pos[0]);
              line.setAttribute("y2",pos[1]);
              line.setAttribute("fill","none");
              line.setAttribute("stroke",windowColours[windex]);
              line.setAttribute("stroke-dasharray","5,10");
              a_svgs[windex].appendChild(line);

              windowTouches[id].line = line;
              windowTouches[id].polyline = polyline;
            } else {
              polyline = polys[polyID].p;
              line = polys[polyID].l;
              polyline.setAttribute("points",points);
              line.setAttribute("x2",pos[0]);
              line.setAttribute("y2",pos[1]);
            }

            polys[polyID] = {p:polyline,l:line,w:windex,i:id,x:windowTouches[id].xPoints,y:windowTouches[id].yPoints,x2:pos[0],y2:pos[1],x3:codearea2[windex].scrollLeft,y3:codearea2[windex].scrollTop};

            //Select Tiles
            var v = [];
            for (var j = 0; j < windowTouches[id].xPoints.length; j++) {
              v.push({x:windowTouches[id].xPoints[j]+codearea2[windex].scrollLeft,y:windowTouches[id].yPoints[j]+codearea2[windex].scrollTop});
            }
            v.push(v[0]);

            var count = 0;
            for (var j = 0; j < tiles2[windex].length; j++) {
              if (tiles2[windex][j].parentNode != codearea2[windex]) { continue; }
              if (tiles2[windex][j].highlight != null && tiles2[windex][j].highlight.length != 0 && tiles2[windex][j].highlight.includes(polyID)) { continue; }
              var xy = findOffsetTopLeft(tiles2[windex][j]);
              xy.top = xy.top + tiles2[windex][j].offsetHeight * .5;
              xy.left = xy.left + tiles2[windex][j].offsetWidth * .5;

              if (inPoly({x:xy.left,y:xy.top},v) != 0) {
                //In poly
                if (tiles2[windex][j].highlight == null || tiles2[windex][j].highlight.length == 0) {
                  tiles2[windex][j].highlight = [polyID];
                  tiles2[windex][j].classList.add(highlight);
                } else {
                  if (!tiles2[windex][j].highlight.includes(polyID)) {
                    tiles2[windex][j].highlight.push(polyID);
                  }
                }

                count++;
              } else {
                if (tiles2[windex][j].highlight != null) {
                  tiles2[windex][j].highlight.remove(polyID);
                  if (tiles2[windex][j].highlight.length == 0) {
                    tiles2[windex][j].classList.remove(highlight);
                  }
                }
              }
            }
            // console.log(count + " tiles highlighted.");

          }
          windowTouches[id].counter++;
          // mdebug(windowTouches[id].counter + " |");
        }
      }
    }
  }
  // console.log("Move:" + ii);
}

var tileGroup;
var others;
function pieTouchEnd(event) {
  if (event.target.style.display == "none") { return; }
  if (!event.target.classList.contains('codearea') && !event.target.classList.contains('ace_content')) { return; }
  var ii = "";
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    ii += " (" + i + " " + id + ")";
    var windex;
    if (id in pieMenuTouches) {
      if (pieMenuTouches[id].dying) {
        continue;
      }
      pieMenuTouches[id].dying = 1;
      window.setTimeout(pieTouchDelayedEnd, pieMenuEndDelay, id, (event.target.classList.contains('ace_content')));
      windex = pieMenuTouches[id].windex;
      // continue;
    } else if (id in windowTouches) {
      if (system_mode == 0 || (system_mode == 1 && drag_mode == 1)) {
        if (windowTouches[id].ignore) { windowTouches[id].type = -1; }
        windex = windowTouches[id].windex;
        if (windowTouches[id].type == 1 && system_mode == 0) {
          //End Drag
          windowTouches[codearea2[windex].t1].ignore = true;
          windowTouches[codearea2[windex].t2].ignore = true;
          codearea2[windex].t1 = codearea2[windex].t2 = null;
          lastUpdate = null;
        } else if (windowTouches[id].type == 2) {
          //End select
          //Show Menu
          var polyID = windowTouches[id].polyID;
          tileGroup = [];
          others = [];
          for (var j = 0; j < tiles2[windex].length; j++) {
            if (tiles2[windex][j].parentNode != codearea2[windex]) { continue; }
            if (tiles2[windex][j].highlight != null && tiles2[windex][j].highlight.includes(polyID)) { tileGroup.push(tiles2[windex][j]); }
            else { others.push(tiles2[windex][j]); }
          }

          // console.log("PolyID: " + polyID + ", Tiles: " + tileGroup.length + ", others: " + others.length);
          if (tileGroup.length != 0) {
            polys[polyID].m = showTileMenu(windowTouches[id].x,windowTouches[id].y,{windex:windex,id:polyID},tileGroup, true);
          } else if (others.length != 0) {
            Array.prototype.forEach.call(others,function(e) {
              if (e.highlight == null || e.highlight.length == 0) {
                e.highlight = [polyID];
                e.classList.add(highlight);
              } else {
                if (!e.highlight.includes(polyID)) {
                  e.highlight.push(polyID);
                }
              }
            });
            polys[polyID].m = showTileMenu(windowTouches[id].x,windowTouches[id].y,{windex:windex,id:polyID},others, true);
          } else {
            removePoly(polyID);
          }
        }
      }
      // if (windowTouches[id].polyID && !polys[windowTouches[id].polyID].m) { removePoly(windowTouches[id].polyID); }
      delete windowTouches[id];
    }
  }
  event.preventDefault();
  // console.log("End:" + ii);
}

function pieTouchDelayedEnd(id,t) {
  if (!(id in pieMenuTouches)) { return; }
  if (pieMenuTouches[id].done) { delete pieMenuTouches[id]; return; }
  var windex = pieMenuTouches[id].windex;
  var p1 = [pieMenuTouches[id].x,pieMenuTouches[id].y];
  //Sec menu
  var count = 0;
  for (var i in pieMenuTouches) {
    var p2 = [pieMenuTouches[i].x,pieMenuTouches[i].y];

    if (pieMenuTouches[i].id == id) { continue; }
    if (pieMenuTouches[i].done) { continue; }
    if (!pieMenuTouches[i].dying) { continue; }
    if (pieMenuTouches[i].windex != windex) { continue; }

    var dist = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
    if (dist < secMenuDistance) {
      showSecMenu(p1[0] + (p2[0] - p1[0]) * .5,p1[1] + (p2[1] - p1[1]) * .5, windex);
      delete pieMenuTouches[id];
      delete pieMenuTouches[i];
      return;
    }
    count++;
  }

  //Pie menu
  if (t) {
    if (system_mode == 0) {
      showKeyboard(pieMenuTouches[id].target, 1, windex);
    }
  } else {
    if (system_mode == 1 && Date.now() - pieMenuTouches[id].time > longPressPie) {
      showSecMenu(p1[0],p1[1],windex);
    } else {
      showPieMenu(p1[0],p1[1],windex);
    }
  }

  delete pieMenuTouches[id];
}

function removePoly(id) {
  mdebug("Remove Poly: " + id);
  // console.trace();
  if (!polys[id]) { return; }
  var windex = polys[id].w;
  a_svgs[windex].removeChild(polys[id].p);
  a_svgs[windex].removeChild(polys[id].l);
  for (var i = 0; i < tiles2[windex].length; i++) {
    if (tiles2[windex][i].parentNode != codearea2[windex]) { continue; }
    if (tiles2[windex][i].highlight != null && tiles2[windex][i].highlight.includes(id)) {
      tiles2[windex][i].highlight.remove(id);
      if (tiles2[windex][i].highlight.length == 0) {
        tiles2[windex][i].classList.remove(highlight);
      }
    }
  }
  
  if (polys[id].m) {
    closeMenu(null,polys[id].m,true);
  }
  
  delete polys[id];
}

function isLeft(p0, p1, p2) {
  return (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y);
}

function inPoly(p, v) {
  var wn = 0;
  for (var i = 0; i < v.length-1; i++) {
    var v2 = v[i+1];
    if (v[i].y <= p.y && v2.y > p.y && isLeft(v[i],v2,p) > 0) {
      wn++;
    } else if (v[i].y > p.y && v2.y <= p.y && isLeft(v[i],v2,p) < 0) {
      wn--;
    }
  }
  return wn;
}


function addInputEventsToTile(tile) {
  input = tile.getElementsByTagName('input');
  for (var i = 0; i < input.length; i++) {
    attachInputEvents(input);
  }
}

function addWidgetTouch(widget, tile) {
    widget.addEventListener('touchstart', tileTouchStart);
    widget.addEventListener('touchmove', tileTouchMove);
    widget.addEventListener('touchend', tileTouchEnd);
}

/* function widgetTest(event) {
  // console.log("Widget: " + event.target.tile);
} */

function addTileTouchToTile(tile) {
    tile.addEventListener('touchstart', tileTouchStart);
    tile.addEventListener('touchmove', tileTouchMove);
    tile.addEventListener('touchend', tileTouchEnd);
    setTilesZIndex(tile.windex);
}

function addTileTouch(id) {
  //Adds touch listeners for touch start, move and end
  var tiles = codearea2[id].getElementsByClassName('tile');
  for (var i = 0; i < tiles.length; i++) {
    tiles[i].windex = id;
    addTileTouchToTile(tiles[i]);
  }
  // console.log(id + " Added touch to tiles " + tiles.length);
  holes2[id] = codearea2[id].getElementsByClassName("hole");
}

function tileTouchStart(event) {
  event.stopPropagation();
  event.preventDefault();
  for (var i = 0; i < event.targetTouches.length; i++) {
    var target = event.targetTouches[i].target;
    var id = event.targetTouches[i].identifier;

    var tileTarget = target;
    var rl = tileTarget.offsetLeft;
    var rt = tileTarget.offsetTop;
    while (!tileTarget.classList.contains("tile")) {
      tileTarget = tileTarget.parentNode;
    }
    var windex = tileTarget.windex;


    tileBringToFront(tileTarget);

    //New Touch Event
    if (!(id in touches)) {
      var xy = findOffsetTopLeft(tileTarget);
      var x = event.targetTouches[i].clientX - xy.left;
      var y = event.targetTouches[i].clientY - xy.top;
      var pos = positionCorrection([x,y],windex);
      var x2 = xy.left - pos[0];
      var y2 = xy.top - pos[1];
      // console.log("TTS: " + xy.left + ", " + xy.top + ", " + x2 + ", " + y2 + ", " + x + ", " + y);
    // console.log("TileTouchStart: " + id + ", " + event.targetTouches[i].clientX + ", " + event.targetTouches[i].clientY + " | " + xy.left + ", " + xy.top);


      touches[id] = {x:(event.targetTouches[i].clientX - xy.left), y:(event.targetTouches[i].clientY - xy.top),
          target:target, hasContinue:0, windex:windex, xy: xy, ts:Date.now(), tile:tileTarget, ox: event.targetTouches[i].clientX, oy: event.targetTouches[i].clientY  };


      // console.log("New Touch: " + id + ", " + touches[id].x + ", " + touches[id].y + ", " + touches[id].target + ", " + touches[id].hasContinue
        // + ", " + touches[id].xy  + ", " + touches[id].ts + ", " + touches[id].tile);
    }
  }
}

function tileTouchMove(event) {
  event.stopPropagation();
  event.preventDefault();
  for (var i = 0; i < event.targetTouches.length; i++) {
    var target = event.targetTouches[i].target;
    var id = event.targetTouches[i].identifier;
    // console.log("TileTouchMove: " + id);
    if (!(id in touches)) { continue; }
    var windex = touches[id].windex;
    if (!touches[id].hasContinue) {
      //Moves check - Number of updates since this touch began
      var timeDif = Date.now() - touches[id].ts;

      //Distance check
      var x = event.targetTouches[i].clientX;
      var y = event.targetTouches[i].clientY;
      var dist = Math.sqrt(Math.pow(x - touches[id].ox, 2) + Math.pow(y - touches[id].oy, 2));
      if (dist > tileMenuMoveThresholdDistance) {
        touches[id].hasContinue = 1;
        // console.log(">distance: " + dist);
      }
    }

    target = touches[id].tile;
    var parent = target.parentNode;
    var origTarget = target;

    if (touches[id].hasContinue == 1) {
      //Start Drag

      //If tile is in another tile
      var originalHole = null;
      if (parent != codearea2[windex]) {
          originalHole = parent;
          originalHole.style.width = originalHole.offsetWidth + 'px';
          originalHole.style.height = originalHole.offsetHeight + 'px';
      }
      var xy = touches[id].xy;
      target.style.position = 'absolute';
      // target.style.top = xy.top + 'px';
      // target.style.left = xy.left + 'px';

      var tmp = target;
      var runningTop = xy.top;
      if (event.shiftKey) {
          //#TODO make some alternative to shift key for touch,
          //      this bit lets you drag a single block out of a stack
          // if (tmp.prev)
              // tmp.prev.next = tmp.next;
          // if (tmp.next)
              // tmp.next.prev = tmp.prev;
          // tmp.next = false;
          // tmp.prev = false;
      } else if (tmp.prev) {
          tmp.prev.next = false;
      }
      while (tmp && parent != codearea2[windex]) {
          parent.removeChild(tmp);
          codearea2[windex].appendChild(tmp);
          tiles2[windex].push(tmp);
          tmp.style.position = 'absolute';
          tmp.style.top = runningTop + 'px';
          tmp.style.left = xy.left + 'px';
          runningTop += tmp.offsetHeight;
          tmp = tmp.next;
      }
      touches[id].originalHole = originalHole;


      //Start dragging
      if (!target.collapsed) {
        addPointer(target);
      }
      target.classList.add('selected');
      target.classList.add('dragging');
      var ch = target.getElementsByClassName('tile');
      for (var j = 0; j < ch.length; j++) {
        ch[j].classList.add('dragging');
      }
      var tmp = target;
      while (typeof tmp.next != "undefined" && tmp.next) {
        tmp = tmp.next;
        tmp.classList.add('selected');
        tmp.classList.add('dragging');
        var ch2 = tmp.getElementsByClassName('tile');
        if (!ch2) { continue; }
        for (var j = 0; j < ch.length; j++) {
          if (!ch2[j]) { continue; }
          ch2[j].classList.add('dragging');
        }
      }
      if (typeof target.prev != "undefined" && target.prev) {
        target.prev.next = false;
        target.prev = false;
      }
      touches[id].hasContinue = 2;
    }

    if (touches[id].hasContinue == 2) {
      //Continue Drag
      var left, top;

      //Tile moving fix for rotated windows
      var lt = rotateTileTouch(id,windex,event.targetTouches[i]);

      left = lt[0];
      top = lt[1];

      target.style.top = top + 'px';
      target.style.left = left + 'px';
      if (windex == 0) {
        top += codearea2[windex].scrollTop;
        left += codearea2[windex].scrollLeft;
      }

      var l2 = target.offsetLeft + target.offsetWidth * .5;
      var r2 = l2;
      var t2 = target.offsetTop - markerHeight * .9;
      var b2 = t2;
      if (!target.collapsed) {
        var bestHole = findHole(target, l2, t2, r2, b2, true, windex);
        if (bestHole != null && bestHole.children.length == 0) {
            bestHole.style.background = 'yellow';
            var reason = {};
            if (!holeCanHoldTile(bestHole, target, reason)) {
                bestHole.style.background = 'pink';
                overlayError(reason.error, bestHole, windex);
            }
        }
      }

      var tmp = target;
      while (typeof tmp.next != "undefined" && tmp.next) {
        var last = tmp;
        tmp = tmp.next;
        tmp.style.top = (last.offsetTop + last.offsetHeight) + 'px';
        tmp.style.left = last.offsetLeft + 'px';
      }

      if (!target.collapsed) {
        for (var i=0; i<tiles2[windex].length; i++) {
          // console.log("IsBottomTarget Call: " + ch + ", " + target);
          var ch = tiles2[windex][i];
          if (ch.classList.contains('dragging')) { continue; }
          if (ch == target)
              continue;
          if (ch.parentNode == toolbox) { continue; }
          if (isBottomTarget(ch, target)) {
              ch.classList.add('bottom-join-target');
          } else {
              ch.classList.remove('bottom-join-target');
          }
        }
      }
    }
  }
}



function tileTouchEnd(event) {
  //For touch end only changed touches show up,
  event.preventDefault();
  event.stopPropagation();
  for (var i = 0; i < event.changedTouches.length; i++) {
    var id = event.changedTouches[i].identifier;
    if (!(id in touches)) { continue; }
    var windex = touches[id].windex;
    // console.log("TileTouchEnd: " + id + ", hasContinue: " + touches[id].hasContinue);
    var target = touches[id].target;
    var top = (event.changedTouches[i].clientY - touches[id].y);
    var left = (event.changedTouches[i].clientX - touches[id].x);
    if (touches[id].hasContinue == 0) {
      var classTile = touches[id].target.classList.contains('tile');
      var varTile = touches[id].target.classList.contains('var') || touches[id].target.classList.contains('var-name');
      var timeDif = Date.now() - touches[id].ts;
      var inputTile, paramTile, argTile;
      // console.log("Tile classname: " + touches[id].target.classList + ", contains var: " + varTile);
      if (!classTile && !varTile) {
        // varTile = touches[id].tile.classList.contains('var');
        inputTile = touches[id].target.tagName.toUpperCase() == "INPUT";
        if (!inputTile) paramTile = touches[id].target.classList.contains('parameter-adder');
        if (!paramTile) argTile = touches[id].target.classList.contains('argument-adder');
      }




      //'Click' Events
      // console.log("TileTouchEnd: " + id + ", timeDif: " + timeDif + ", var: " + varTile + ", input: " + inputTile + ", tile: "
        // + touches[id].tile.classList.contains("tile") + ", class: " + touches[id].tile.classList);
      if (timeDif < shortPress) {
        if (varTile) {
          popupVarMenu(event);
          delete touches[id];
          continue;
        } else if (inputTile) {
          //Start input
          target.focus();
          currentFocus = target;
          hasFocus = true;
          // target.value = target.value;
          target.selectionStart = target.selectionEnd = target.value.length;
          if (system_mode == 0) {
            showKeyboard(target,0,windex);
          }
          delete touches[id];
          continue;
        } else if (paramTile) {
          var newParam = addParameterToMethod(touches[id].target, "");
        } else if (argTile) {
          addArgumentToRequest(touches[id].target);
          updateTileIndicator(windex);
          generateCode(windex);
          checkpointSave(windex);
        } else if (touches[id].tile.classList.contains('tile')) {
          //Show Tile Menu
          showTileMenu(left + touches[id].x, top + touches[id].y, touches[id].tile, null, true);
          delete touches[id];
          continue;
        }
      } else {
        showTileMenu(left + touches[id].x, top + touches[id].y, touches[id].tile, null, true);
        delete touches[id];
        continue;
      }
      // delete touches[id];
      // continue;
    }



    target = touches[id].tile;
    var x,y;
    // console.log("TouchEnd: " + id + ", " + target.classList);

    var hadDragContinue = touches[id].hasContinue;
    overlaidError.style.display = 'none';

    var lt = rotateTileTouch(id,windex,event.changedTouches[i],1);

    left = lt[0];
    top = lt[1];

    target.style.top = top + 'px';
    target.style.left = left + 'px';

    // if (windex == 0) {
    top += codearea2[windex].scrollTop;
    left += codearea2[windex].scrollLeft;
    // }
    target.classList.remove('selected');
    target.classList.remove('dragging');
    removePointer(target);
    var ch = target.getElementsByClassName('tile');
    for (var j = 0; j < ch.length; j++) {
      ch[j].classList.remove('dragging');
    }

    var tmp = target;
    while (typeof tmp.next != "undefined" && tmp.next) {
        tmp = tmp.next;
        tmp.classList.remove('selected');
        tmp.classList.remove('dragging');
        var ch2 = tmp.getElementsByClassName('tile');
        for (var j = 0; j < ch2.length; j++) {
          ch2[j].classList.remove('dragging');
        }
    }
    var l2 = target.offsetLeft + target.offsetWidth * .5;
    var r2 = l2;
    var t2 = target.offsetTop - markerHeight * .9;
    var b2 = t2;
      // var r2 = target.offsetLeft + target.offsetWidth * .5;
      // var b2 = target.offsetTop + markerHeight * 0.2;
    var bestHole = findHole(target, l2, t2, r2, b2,false,windex);

    // console.log("End - Best: " + bestHole + ", " + touches[id].x + "," + touches[id].y + " - " + left + "," + top);
    // console.log("End get: " + touches[id].x + "," + touches[id].y + "," + touches[id].target + "," + touches[id].hasContinue);
    if (bestHole != null) {
      bestHole.style.background = '';
      if (bestHole.children.length == 0
              && holeCanHoldTile(bestHole, target)) {
        var tmp = target;
        while (tmp) {
          tmp.style.top = 0;
          tmp.style.left = 0;
          tmp.style.position = 'static';
          bestHole.appendChild(tmp);
          tmp = tmp.next;
        }
      } else {
        bestHole = null;
      }
    }
    for (var i=0; i<tiles2[windex].length; i++) {
      var ch = tiles2[windex][i];
      if (!ch) { continue; }
      ch.classList.remove('bottom-join-target');
      // console.log("IsBottomTarget Call:" + ch + ", " + target);
      if (bestHole) { continue; }
      if (ch == target) { continue; }
      if (ch.parentNode == toolbox) { continue; }
      var t = ch.offsetTop + ch.offsetHeight;
      if (isBottomTarget(ch, target)) {
        if (ch.next) {
            var tmp = target;
            while (tmp.next)
                tmp = tmp.next;
            tmp.next = ch.next;
            ch.next.prev = tmp;
        }
        ch.next = target;
        target.prev = ch;
        var pe = ch.parentElement;
        var tmp = ch;
        var after = ch.nextSibling;
        while (tmp.next) {
          var last = tmp;
          tmp = tmp.next;
          if (tmp == after)
            break;
          tmp.parentElement.removeChild(tmp);
          pe.insertBefore(tmp, after);
          if (pe.classList.contains('multi')) {
            tmp.style.position = "static";
            tmp.style.left = "";
            tmp.style.top = "";
          }
          tmp.style.top = (last.offsetTop + last.offsetHeight) + 'px';
          tmp.style.left = last.offsetLeft + 'px';
        }
        if (after && pe != codearea2[windex]) {
          last.next = after;
          after.prev = last;
        }
        break;
      }
    }
    if (touches[id].originalHole != null) {
      touches[id].originalHole.style.width = 'auto';
      touches[id].originalHole.style.height = 'auto';
    }
    runOnDrop(target);
    reflow(windex);
    updateTileIndicator(windex);
    generateCode(windex);
    checkpointSave(windex);
    delete touches[id];
  }
}

function rotateTileTouch(id, windex, touchEvent, b) {
  var left, top, eventTouchXY;
  if (windows[windex].rid == 1) {
    var tileXY = [touches[id].xy.left,touches[id].xy.top];
    var tileTouchXY = reverseRotateXY(windex, windows[windex].rid, tileXY[0], tileXY[1]);
    var startEventTouchXY = [touches[id].ox, touches[id].oy];
    var dx = tileTouchXY[0] - startEventTouchXY[0];
    var dy = startEventTouchXY[1] - tileTouchXY[1];
    if (b) {
      eventTouchXY = [touchEvent.clientX,touchEvent.clientY];
    } else {
      eventTouchXY = [touchEvent.clientX,touchEvent.clientY];
    }
    var dx2 = tileTouchXY[0] - eventTouchXY[0];
    var dy2 = eventTouchXY[1] - tileTouchXY[1];
    var dx3 = dx2 - dx;
    var dy3 = dy2 - dy;
    left = tileXY[0] + dy3;
    top = tileXY[1] + dx3;
  } else if (windows[windex].rid == 2) {
    var tileXY = [touches[id].xy.left,touches[id].xy.top];
    var tileTouchXY = reverseRotateXY(windex, windows[windex].rid, tileXY[0], tileXY[1]);
    var startEventTouchXY = [touches[id].ox, touches[id].oy];
    var dx = startEventTouchXY[0] - tileTouchXY[0];
    var dy = tileTouchXY[1] - startEventTouchXY[1];
    if (b) {
      eventTouchXY = [touchEvent.clientX,touchEvent.clientY];
    } else {
      eventTouchXY = [touchEvent.clientX,touchEvent.clientY];
    }
    var dx2 = eventTouchXY[0] - tileTouchXY[0];
    var dy2 = tileTouchXY[1] - eventTouchXY[1];
    var dx3 = dx - dx2;
    var dy3 = dy - dy2;
    left = tileXY[0] - dy3;
    top = tileXY[1] - dx3;
  } else if (windows[windex].rid == 3) {
    var tileXY = [touches[id].xy.left,touches[id].xy.top];
    var tileTouchXY = reverseRotateXY(windex, windows[windex].rid, tileXY[0], tileXY[1]);
    var startEventTouchXY = [touches[id].ox, touches[id].oy];
    var dx = tileTouchXY[0] - startEventTouchXY[0];
    var dy = tileTouchXY[1] - startEventTouchXY[1];
    if (b) {
      eventTouchXY = [touchEvent.clientX,touchEvent.clientY];
    } else {
      eventTouchXY = [touchEvent.clientX,touchEvent.clientY];
    }
    var dx2 = tileTouchXY[0] - eventTouchXY[0];
    var dy2 = tileTouchXY[1] - eventTouchXY[1];
    var dx3 = dx - dx2;
    var dy3 = dy - dy2;
    left = tileXY[0] - dx3;
    top = tileXY[1] - dy3;
  } else {
    left = touchEvent.clientX - touches[id].x;
    top = touchEvent.clientY - touches[id].y;
  }

  return [left,top];
}


// function findHole(target,x,y,left,top,b) {
function findHole(target, left, top, right, bottom, b, windex) {
  var holeSize = 1000000;
  var bestHole = null;
  var bestIdx = -1;
  // var holes = codearea2[windex].getElementByClassName('hole');


  for (var i=holes2[windex].length - 1; i>=0; i--) {
    var h = holes2[windex][i];
    if (h.childNodes.length) { continue; }
    if (b) {
      h.style.background = '';
    }
    if (h.offsetParent == target)
      continue;
    var xy = findOffsetTopLeft(h);
    xy.top = xy.top + codearea2[windex].offsetTop;
    xy.left = xy.left + codearea2[windex].offsetLeft;
    // console.log("Tile: " + left + ", " + top + ", " + right + ", " + bottom);
    // console.log("Hole: " + xy.left + ", " + xy.top + ", " + (xy.left + h.offsetWidth) + ", " + (xy.top + h.offsetHeight));

    if (left < xy.left || right > xy.left + h.offsetWidth) { continue; }
    if (top < xy.top - h.offsetHeight * .3 || bottom > xy.top + h.offsetHeight * .9) { continue; }
    // if (left + x < xy.left
    //         || left + x > xy.left + h.offsetWidth) {
    //   continue;
    // }
    // if (top + y < xy.top
    //         || top + y > xy.top + h.offsetHeight) {
    //   continue;
    // }
    if (h.offsetWidth * h.offsetHeight < holeSize) {
      holeSize = h.offsetWidth * h.offsetHeight;
      bestHole = h;
      bestIdx = i;
    }
  }
  var name = "null";
  if (bestHole != null) {
    name = bestHole.parentNode.classList;
  }
  // console.log("Returning Best Hole: " + bestHole + " - " + name + "," + bestIdx);
  return bestHole;
}
