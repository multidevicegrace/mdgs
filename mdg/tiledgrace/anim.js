
//The hole
/* <defs>
    <radialGradient id="gradient">
      <stop offset="80%" stop-color="black"></stop>
      <stop offset="99%" stop-color="indigo"></stop>
    </radialGradient>
  </defs>
    <ellipse fill="url(#gradient)" cx="350" cy="0" rx="200" ry="30">
  <animate attributeName="rx" from="0" to="200" dur="1.5s" repeatCount="1" calcMode="spline" keySplines="0 .75 .25 1"></animate>
  <animate attributeName="ry" from="0" to="30" dur="1.5s" repeatCount="1" calcMode="spline" keySplines="0 .75 .25 1"></animate>
  <animate attributeName="rx" from="200" to="0" begin="5s" dur="1.5s" repeatCount="1" calcMode="spline" keySplines="0 .25 .75 1"></animate>
  <animate attributeName="ry" from="30" to="0" begin="5s" dur="1.5s" repeatCount="1" calcMode="spline" keySplines="0 .25 .75 1"></animate>
</ellipse> */


var a_svg;
function showAnim(windex) {
  windex = 0;
  if (a_svg == null) {
    a_svg = document.getElementById("a_svg" + windex);
  }
  createAnim(a_svg,a_anim_space.offsetLeft + a_anim_space.offsetWidth / 2,0,200,30,windex);
}

// createAnim(document.getElementById("a_svg0"),300,0,200,30);

var a_e;
var a_p;
var a_cx;
var a_cy;

function a_remove() {
  a_e.parentNode.removeChild(a_e); a_e = null; a_p = false;
  a_cx = null;
  a_cy = null;
}

function createAnim(svg,cx,cy,rx,ry,windex) {
  // createAnim = function(svg,cx,cy,rx,ry) {
  if (a_p) { return; }
  a_p = true;
  a_cx = cx;
  a_cy = cy;
  var extraDepth = 50;

  var topWin = a_anim_space;
  var clonedTiles = [];
  var tileList = [];
  var b = selectedTiles.length != 0;
  Array.prototype.forEach.call(codearea.children, function(e) {
    if (e.className.includes("tile") && (!b || (b && e.classList.contains(highlight)))) { tileList.push(e); }
  });

  var zz = 0;
  Array.prototype.forEach.call(tileList,function(e) {
    var t = e.cloneNode(true);
    t.style.zIndex = "900";
    topWin.appendChild(t);
    t.classList.remove(highlight);
    t.style.opacity = ".4";
    t.style.transition = "top 0.3s";
    clonedTiles.push(t);
    zz++;
  });
  console.log(clonedTiles.length + " " + zz);

  //Move Tiles   
  window.setTimeout(function() {
    Array.prototype.forEach.call(clonedTiles,function(e) {    
      e.style.transitionTimingFunction = "ease-out";
      e.style.top = parseInt(e.style.top) - 20 + "px";
      e.addEventListener("transitionend", function(event) {
        e.style.transition = "left 0.7s";
        e.style.transitionTimingFunction = "ease-in";
        e.style.left = "-2000px";
        e.addEventListener("transitionend", function(event) {
          e.parentNode.removeChild(e);
          if (a_p) { a_p = false; }
        }, false);
      }, false);    
    });
  },10);
  
  //In case transition trigger fails
  window.setTimeout(function() {    
    while (a_anim_space.lastChild != null) {
      a_anim_space.removeChild(a_anim_space.lastChild);
    }
    a_p = false;
  },1200);
}
// loadSample("fibonacci",0)

function a_base(cx,cy,rx,ry) {
//Base
  return "<defs> <radialGradient id=\"gradient\"> <stop offset=\"80%\" stop-color=\"black\"></stop> <stop offset=\"99%\" stop-color=\"indigo\"></stop> </radialGradient> </defs> <ellipse fill=\"url(#gradient)\" cx=\""+ cx +"\" cy=\""+cy+"\" rx=\""+rx+"\" ry=\""+ry+"\"> </ellipse>";
}

function a_anim1(rx,ry) {
// a_anim1 = function(rx,ry) {
//Anim 1
  return anim1 = "<animate attributeName=\"rx\" from=\"0\" to=\""+rx+"\" begin=\"0.1s\" dur=\"1.4s\" repeatCount=\"1\" fill=\"freeze\" calcMode=\"spline\" keySplines=\"0 .75 .25 1\"></animate> <animate attributeName=\"ry\" from=\"0\" to=\""+ry+"\" begin=\"0.1s\" dur=\"1.4s\" repeatCount=\"1\" fill=\"freeze\" calcMode=\"spline\" keySplines=\"0 .75 .25 1\"></animate>";
}

function a_anim2(rx,ry) {
//Anim 2
 return anim2 = "<animate attributeName=\"rx\" from=\""+rx+"\" to=\"0\" begin=\"0s\" dur=\"1s\" repeatCount=\"1\" fill=\"freeze\" calcMode=\"spline\" keySplines=\"0 .25 .75 1\"></animate> <animate attributeName=\"ry\" from=\""+ry+"\" to=\"0\" begin=\"0s\" dur=\"1s\" repeatCount=\"1\" fill=\"freeze\" calcMode=\"spline\" keySplines=\"0 .25 .75 1\"></animate>";
}