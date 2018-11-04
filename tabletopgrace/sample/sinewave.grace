dialect "sniff"
class frame1.m1(x1,y1,xM,yM,l,s) {
    inherits rectangle
    var c := 0
    var i := 0
    width := s
    height := s
    x := x1
    y := y1
    always {
        if (i <= l) then {
            x := x + xM * s
            y := y + yM * s
            if (c == 0) then {
                colour := c1
                c := 1
            } else {
                colour := c2
                c := 0
            }
            stamp
        }
        i := i + 1
    }
}

class wave1.m1(start,idx,size,cc) {
    inherits circle
    radius := size
    x := start
    colour := cc
    always {
        var r := idx + ct
        if (r > 359) then {
            r := r - 360
        }
        if (r > 180) then {
            var dif := r - 180
            r := 180 - dif
        }
        r := r * rad
        var pow2 := r * r
        var pow4 := pow2 * pow2
        var pow6 := pow4 * pow2
        var pow8 := pow6 * pow2
        var p2p := pow2 / p2
        var p4p := pow4 / p4
        var p6p := pow6 / p6
        var p8p := pow8 / p8
        var c := 1 - p2p + p4p - p6p + p8p
        if (c > 1) then {
            c := 1
        }
        if (c < (0 - 1)) then {
            c := 0 - 1
        }
        y := wym + wyr * c
    }
}

class count.m1 {
    var end := 0
    always {
        ct := ct + speed
        if (ct == 360) then {
            ct := 0
        }
        end := end + 1
        if (end > time) then {
            stop
        }
    }
}

class wave.start {
    for (0 .. dots) do {i->
        var col := c4
        if (alt == 0) then {
            alt := 1
            col := c3
        } else {
            alt := 0
        }
        wave1.m1(ws + wm * i,i * inc2,dotSize,col)
    }
    count.m1
}

class frane.make {
    frame1.m1(xLeft,yTop + sqrSize,1,0,width,sqrSize)
    frame1.m1(xLeft,(yTop + sqrSize) + (sqrSize * height),1,0,width,sqrSize)
    frame1.m1(xLeft + sqrSize,yTop,0,1,height,sqrSize)
    frame1.m1((xLeft + sqrSize) + (sqrSize * width),yTop,0,1,height,sqrSize)
}

"Editable:"
var speed := 5
var dots := 50
var dotSize := 20
var time := 300
var sqrSize := 45.45
var width := 10
var height := 10
var xLeft := 0 - 22.725
var yTop := 0 - 22.725
var c1 := "darkorange"
var c2 := "darkorchid"
var c3 := "maroon"
var c4 := "steelblue"
"Not Editable:"
var p2 := 2
var p4 := 24
var p6 := 720
var p8 := 40320
var s22 := dotSize / 2
var ws := sqrSize * 1 + s22
var we := sqrSize * width - s22
var wm0 := we - ws
var wm := wm0 / dots
var inc2 := 360 / dots
var pi := 3.14159
var rad := pi / 180
var ct := 0
var alt := 0
var wyr0 := (sqrSize * height - 5) - (sqrSize * 1 + 5)
var wyr := wyr0 / 2
var wym := sqrSize * 1 + 5 + wyr
frane.make
wave.start

// chunks: 742px,8px 1035px,9px 423px,380px 230px,14px 284px,736px 20px,3px