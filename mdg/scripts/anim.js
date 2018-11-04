
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


var a_svgs = [];
for (var i = 0; i < windowMax; i++) {
  a_svgs.push(document.getElementById('a_svg' + i));  
}

var a_svg;
function showAnim(windex,polyID,tile) {  
  if (windowMax != 1 || a_svg == null) {
    a_svg = a_svgs[windex];
  }

  createAnim(a_svg,windows[windex].offsetLeft + windows[windex].offsetWidth / 2,0,200,30,windex,polyID,tile);
}

// createAnim(document.getElementById("a_svg0"),300,0,200,30);

var a_e;
var a_cx;
var a_cy;
var a_anim = 0;

function a_remove() {
  a_e.parentNode.removeChild(a_e); a_e = null; a_p = false;
  a_cx = null;
  a_cy = null;
}

function createAnim(svg,cx,cy,rx,ry,windex,polyID,tile) {
  // createAnim = function(svg,cx,cy,rx,ry) {
  // if (a_p) { return; }
  // a_p = true;
  a_cx = cx;
  a_cy = cy;
  var extraDepth = 50;

  var zz = 0;
  var clonedTiles = [];
  if (!tile) {
    Array.prototype.forEach.call(tiles2[windex],function(e) {
      if (e.classList && e.classList.contains(highlight) && ((polyID == -2) ||
          (polyID != -2 && e.highlight != null && e.highlight.includes(polyID)))) {
        var t = e.cloneNode(true);
        t.style.zIndex = "1200";
        t.classList.remove(highlight);
        t.style.opacity = ".4";
        t.style.transition = "top 0.3s";
        windows[windex].appendChild(t);
        zz++;
        clonedTiles.push(t);
      }
    });    
  } else {
    var t = tile.cloneNode(true);
    t.style.zIndex = "1200";
    t.classList.remove(highlight);
    t.style.opacity = ".4";
    t.style.transition = "top 0.3s";
    windows[windex].appendChild(t);
    zz++;
    clonedTiles.push(t);
  }
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
        }, false);
      }, false);
    });
  },10);
  
  window.setTimeout(function() {    
    clonedTiles.forEach(function(e) {
      if (e && e.parentNode) {
        e.parentNode.removeChild(e);
      }
    });    
  },1200);

}

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