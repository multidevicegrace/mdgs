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

class wave1.m1(start,idx,size,xid,cid) {
    inherits circle
    radius := size
    x := start    
    always {
        if (cid == 0) then {
            colour := c3            
        } else {
            colour := c4   
        }
        x := ws + wm * xid
        radius := dotSize
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
        if (ct >= 360) then {
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
        if (alt == 0) then {
            alt := 1            
        } else {
            alt := 0
        }
        wave1.m1(ws + wm * i,i * inc2,dotSize,i,alt)
    }
    count.m1
}

class u1.go {
    inherits circle
    x := 50
    y := 455
    colour := "silver"
    radius := 20    
    whenever {touching (mse)} do {
        dotSize := dotSize + 1
        sqrSize * 1 + dotSize
        ws := sqrSize * 1 + dotSize
        we := sqrSize * wid - dotSize
        wm0 := we - ws
        wm := wm0 / dots
        wyr0 := (sqrSize * hei - dotSize) - (sqrSize * 1 + dotSize)
        wyr := wyr0 / 2
    }    
}
class d1.go {
    inherits circle
    x := 90
    y := 455
    colour := "silver"
    radius := 20
    whenever {touching (mse)} do {
        dotSize := dotSize - 1
        if (dotSize < 1) then {
            dotSize := 1   
        }
        ws := sqrSize * 1 + dotSize
        we := sqrSize * wid - dotSize
        wm0 := we - ws
        wm := wm0 / dots
        wyr0 := (sqrSize * hei - dotSize) - (sqrSize * 1 + dotSize)
        wyr := wyr0 / 2
    }    
}

class u2.go {
    inherits circle
    x := 200
    y := 455
    colour := "silver"
    radius := 20    
    whenever {touching (mse)} do {
        speed := speed + 1
        if (speed > 350) then {
            speed := 350   
        }
    }    
}
class d2.go {
    inherits circle
    x := 240
    y := 455
    colour := "silver"
    radius := 20
    whenever {touching (mse)} do {
        speed := speed - 1
        if (speed < 1) then {
            speed := 1
        }        
    }    
}

class u3.go {
    inherits circle
    x := 350
    y := 455
    colour := "silver"
    radius := 20   
    var t := 0
    whenever {touching (mse)} do {
        if (t < 10) then {
            t := t + 1   
        } else {
            c3 := hue(random(360)) saturation(random(100)) lightness(random(100))     
            t := 0
        }
    }    
}
class d3.go {
    inherits circle
    x := 390
    y := 455
    colour := "silver"
    radius := 20
    var t := 0
    whenever {touching (mse)} do {
        if (t < 10) then {
            t := t + 1   
        } else {
            c4 := hue(random(360)) saturation(random(100)) lightness(random(100))     
            t := 0
        }
    }    
}

class stopper.go {
    inherits rectangle
    x := 0
    y := 0
    colour := "cyan"
    width := 40
    height := 40
    method mousedown {    
        stop
    }        
}



"Tracks Mouse"
"Triggers Left/Right/CCC"
object {
    inherits circle
    radius := 22
    colour := "red"
    always {
        jumpTo (mouse)
    }
}
def mse = above

class frane.make {
    frame1.m1(xLeft,yTop + sqrSize,1,0,wid,sqrSize)
    frame1.m1(xLeft,(yTop + sqrSize) + (sqrSize * hei),1,0,wid,sqrSize)
    frame1.m1(xLeft + sqrSize,yTop,0,1,hei,sqrSize)
    frame1.m1((xLeft + sqrSize) + (sqrSize * wid),yTop,0,1,hei,sqrSize)
}

"Editable:"
var speed := 5
var dots := 100
var dotSize := 20
var time := 5000
var sqrSize := 45.45
var wid := 10
var hei := 10
var xLeft := 0 - 22.725
var yTop := 0 - 22.725
var c1 := "darkred"
var c2 := "black"
var c3 := "pink"
var c4 := "black"
"Not Editable:"
var p2 := 2
var p4 := 24
var p6 := 720
var p8 := 40320
var s22 := dotSize / 2
var ws := sqrSize * 1 + dotSize
var we := sqrSize * wid - dotSize
var wm0 := we - ws
var wm := wm0 / dots
var inc2 := 360 / dots
var pi := 3.14159
var rad := pi / 180
var ct := 0
var alt := 0
var wyr0 := (sqrSize * hei - dotSize) - (sqrSize * 1 + dotSize)
var wyr := wyr0 / 2
var wym := 250
frane.make
wave.start
u1.go
d1.go
u2.go
d2.go
u3.go
d3.go
stopper.go
