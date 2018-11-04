function createCircle(cx,cy,r,fill,opacity,stroke,s_width,p_event) {
  var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
  if (cx != null) { circle.setAttribute("cx", cx); }
  if (cy != null) { circle.setAttribute("cy", cy); }
  if (r  != null) { circle.setAttribute("r" , r ); }
  setStyle(circle,fill,opacity,stroke,s_width,null,p_event);
  return circle;
}

function createLine(x1,y1,x2,y2,stroke,s_width,s_opacity) {
  var line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
  if (x1 != null) { line.setAttribute("x1", x1); }
  if (y1 != null) { line.setAttribute("y1", y1); }
  if (x2 != null) { line.setAttribute("x2", x2); }
  if (y2 != null) { line.setAttribute("y2", y2); }
  setStyle(line,null,null,stroke,s_width,s_opacity,"none");
  return line;
}

function createRect(x,y,rx,ry,w,h,fill,opacity,stroke,s_width,p_event) {
  var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
  if (x  != null) { rect.setAttribute("x"     ,  x); }
  if (y  != null) { rect.setAttribute("y"     ,  y); }
  if (rx != null) { rect.setAttribute("rx"    , rx); }
  if (ry != null) { rect.setAttribute("ry"    , rx); }
  if (w  != null) { rect.setAttribute("width" ,  w); }
  if (h  != null) { rect.setAttribute("height",  h); }
  setStyle(rect,fill,opacity,stroke,s_width,null,null);
  return rect;
}

function createText(x,y,value,font,fSize,txtA,fill,stroke) {
  var txt = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  if (x      != null) { txt.setAttribute("x",x);              }
  if (y      != null) { txt.setAttribute("y",y);              }
  if (txtA   != null) { txt.setAttribute("text-anchor",txtA); }
  if (value  != null) { txt.textContent      = value;         }
  if (font   != null) { txt.style.fontFamily = font;          }
  if (fSize  != null) { txt.style.fontSize   = fSize;         }  
  if (fill   != null) { txt.style.fill       = fill;          }
  if (stroke != null) { txt.style.stroke     = stroke;        }
  txt.style.pointerEvents = "none";

  if (mobile) {
    //Mobile
    txt.setAttribute("alignment-baseline", "central"); //Chrome
    txt.setAttribute("dominant-baseline", "central");  //Firefox
  } else {
    txt.setAttribute("alignment-baseline", "middle");
    txt.setAttribute("dominant-baseline", "middle");
  }
  return txt;
}


function setStyle(elem,fill,opacity,stroke,s_width,s_opacity,p_event) {
  if (fill      != null) { elem.style.fill            = fill;      }
  if (opacity   != null) { elem.style.fillOpacity     = opacity;   }
  if (stroke    != null) { elem.style.stroke          = stroke;    }
  if (s_width   != null) { elem.style.strokeWidth     = s_width;   }
  if (s_opacity != null) { elem.style.strokeOpacity   = s_opacity; }
  if (p_event   != null) { elem.style.pointerEvents   = p_event;   }
}

function applyStyle(elem, id) {
  if (id == 0) {
    //#constatus
    elem.style.margin = "0px 0px 1px 0px";
    elem.style.background = "darkgrey";
    elem.style.textAlign = "center";
    // elem.style.bottom = "-0.5%";
    elem.style.position = "absolute";
    elem.style.width = "100%";
  } else if (id == 1) {
    //.conmenuentry
    elem.style.color = "black";
    elem.style.border = "2px groove hsl(90, 100%, 2%)";
    elem.style.background = "#c4c4d7";
    elem.style.margin = "0";
    elem.style.fontSize = "12px";
    elem.style.pointerEvents = "none";    
  } else if (id == 2) {
    //#conmenutitle
    elem.style.fontSize = "18px";
    elem.style.color = "white";
    elem.style.textAlign = "center";
    elem.style.padding = "0px";
    elem.style.margin = "0px";
    elem.style.borderBottom = "5px groove white";
    elem.style.pointerEvents = "none";
  } else if (id == 3) {
    //#conmenu
    elem.style.position = "absolute";
    elem.style.left = "50%";
    elem.style.top = "50%";
    elem.style.width = conWidth + "px";
    elem.style.height = conHeight + "px";
    // elem.style.display = "block";
    elem.style.background = "#000";
    elem.style.zIndex = "5";
    elem.style.opacity = "0.9";
    elem.style.borderRadius = "15px";
    elem.style.border = "5px groove white";
  } else if (id == 4) {
    // status text holder
    elem.style.left = "50px";
    elem.style.height = "40px";
    elem.style.width = "145px";
    elem.style.verticalAlign = "bottom";
    elem.style.lineHeight = "40px";
    elem.style.display = "inline-block";
    elem.style.border = "2.5px groove white";
    elem.style.background = "black none repeat scroll 0% 0%";
    elem.style.color = "white";
  } else if (id == 5) {
    // status button
    elem.style.width = "50px";
    // elem.style.left = "0px";
    elem.style.display = "inline-block";
    elem.style.verticalAlign = "super";
    elem.style.height = "43px";
    elem.setAttribute("type","button");
    elem.style.border = "groove";
    elem.style.borderRadius = "3px";
  } else if (id == 6) {
    // status text
    elem.style.margin = "3px 0px 0px 0px";
    elem.style.display = "inline-block";
    elem.style.pointerEvents = "none";
    elem.style.lineHeight = "normal";
  } else if (id == 7) {
    //con menu window button
    elem.style.border = "groove";
    elem.style.borderRadius = "3px";
  }
}

