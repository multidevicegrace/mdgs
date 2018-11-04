dialect "sniff"
class circ.draw(id,rr,xid,yid,yid2) {
    inherits circle
    var rot := rr
    always {
        colour := c1
        "width := ss"
        "height := ss"
        radius := size
        if (rot < 90) then {
            x := (xM + curX1) + (curX1M * xid)
            y := (yM + curY1) + (curY1M * xid) + yid
        } else {
            if (rot < 180) then {
                if (rot > 135) then {
                    if (yid != 0) then {
                        if (xid != 0) then {
                            x := 5000
                            y := 5000
                        } else {
                            x := (xM + curX2) + (curX2M * xid)
                            y := (yM + curY2) + (curY2M * xid) + yid
                        }
                    } else {
                        x := (xM + curX2) + (curX2M * xid)
                        y := (yM + curY2) + (curY2M * xid) + yid
                    }
                } else {
                    x := (xM + curX2) + (curX2M * xid)
                    y := (yM + curY2) + (curY2M * xid) + yid
                }
            } else {
                if (rot < 270) then {
                    if (rot < 225) then {
                        if (yid != 0) then {
                            if (xid != 0) then {
                                x := 5000
                                y := 5000
                            } else {
                                x := (xM + curX3) + (curX3M * xid)
                                y := (yM + curY3) + (curY3M * xid) + yid
                            }
                        } else {
                            x := (xM + curX3) + (curX3M * xid)
                            y := (yM + curY3) + (curY3M * xid) + yid
                        }
                    } else {
                        if (yid != 0) then {
                            x := 5000
                            y := 5000
                        } else {
                            x := (xM + curX3) + (curX3M * xid)
                            y := (yM + curY3) + (curY3M * xid) + yid
                        }
                    }
                } else {
                    if (rot < 360) then {
                        if (rot < 315) then {
                            if (yid != 0) then {
                                x := 5000
                                y := 5000
                            } else {
                                x := (xM + curX4) + (curX4M * xid)
                                y := (yM + curY4) + (curY4M * xid) + yid
                            }
                        } else {
                            x := (xM + curX4) + (curX4M * xid)
                            y := (yM + curY4) + (curY4M * xid) + yid
                        }
                    }
                }
            }
        }
        rot := rot + rInc0
        if (rot >= 360) then {
            rot := 0
        }
    }
}

"Colour Changer (c1)"
class ccc.go {
    inherits rectangle
    x := 0
    y := 0
    colour := "black"
    width := 30
    height := 30
    whenever {touching (mse)} do {
        c1 := hue (random (360)) saturation (random (100)) lightness (random (100))
    }
}

"Change Y Size (yR)"
class left.go {
    inherits rectangle
    x := 75
    y := 400
    colour := "teal"
    width := 40
    height := 40
    whenever {touching (mse)} do {
        yR := yR + 3
    }
}
class right.go {
    inherits rectangle
    x := 125
    y := 400
    colour := "darkgreen"
    width := 40
    height := 40
    whenever {touching (mse)} do {
        yR := yR - 3
    }
}

"CHange X Size (xR)"
class left2.go {
    inherits rectangle
    x := 225
    y := 400
    colour := "darkorchid"
    width := 40
    height := 40
    whenever {touching (mse)} do {
        xR := xR + 3
    }
}
class right2.go {
    inherits rectangle
    x := 275
    y := 400
    colour := "indigo"
    width := 40
    height := 40
    whenever {touching (mse)} do {
        xR := xR - 3
    }
}

"Tracks Mouse"
"Triggers Left/Right/CCC"
object {
    inherits circle
    radius := 25
    colour := "red"
    always {
        jumpTo (mouse)
    }
}
def mse = above

"Change Dot Size (size)"
class left3.go {
    inherits rectangle
    x := 375
    y := 400
    colour := "goldenrod"
    width := 40
    height := 40
    whenever {touching (mse)} do {
        size := size + 1
    }
}
class right3.go {
    inherits rectangle
    x := 425
    y := 400
    colour := "darkorange"
    width := 40
    height := 40
    whenever {touching (mse)} do {
        size := size - 1
    }
}

"Rotates two points around ellipse surface"
" and creates line gradients between them"
class calcer.calc {
    inherits circle
    x := xM
    y := yM
    colour := "black"
    "width := 75"
    "height := 75"
    radius := 15
    crot := 0
    always {
        var r := crot * rad
        var p2 := r * r
        var p3 := r * p2
        var p4 := r * p3
        var p5 := r * p4
        var p6 := r * p5
        var p7 := r * p6
        var p8 := r * p7
        var p9 := r * p8
        curX1 := (((1 - p2 / f2) + (p4 / f4)) - (p6 / f6)) + (p8 / f8)
        curY1 := (((r - p3 / f3) + (p5 / f5)) - (p7 / f7)) + (p9 / f9)
        curX1 := curX1 * xR
        curY1 := curY1 * yR
        r := crot + 90
        r := r * rad
        p2 := r * r
        p3 := r * p2
        p4 := r * p3
        p5 := r * p4
        p6 := r * p5
        p7 := r * p6
        p8 := r * p7
        p9 := r * p8
        curX2 := (((1 - p2 / f2) + (p4 / f4)) - (p6 / f6)) + (p8 / f8)
        curY2 := (((r - p3 / f3) + (p5 / f5)) - (p7 / f7)) + (p9 / f9)
        curX2 := curX2 * xR
        curY2 := curY2 * yR
        curX3 := 0 - curX1
        curY3 := 0 - curY1
        curX4 := 0 - curX2
        curY4 := 0 - curY2
        curX1M := curX2 - curX1
        curX2M := curX3 - curX2
        curX3M := curX4 - curX3
        curX4M := curX1 - curX4
        curY1M := curY2 - curY1
        curY2M := curY3 - curY2
        curY3M := curY4 - curY3
        curY4M := curY1 - curY4
        curX1M := curX1M / wid
        curX2M := curX2M / wid
        curX3M := curX3M / wid
        curX4M := curX4M / wid
        curY1M := curY1M / wid
        curY2M := curY2M / wid
        curY3M := curY3M / wid
        curY4M := curY4M / wid
        crot := crot + rInc0
        if (crot >= 90) then {
            crot := crot - 90
        }
        stamp
    }
    method mousedown {
        stop
    }
}

var size := 7
var wid := 8
var hei := 6
var xR := 100
var yR := 40
var xM := 250
var yM := 150
var rots := 20
var rInc0 := 90 / rots
var pi := 3.14159
var rad := pi / 180
var wid3 := wid - 1
var wid2 := 90 / wid3
var hei2 := hei - 1
var h2 := size * 3
var curX1 := 0
var curY1 := 0
var curX1M := 0
var curY1M := 0
var curX2 := 0
var curY2 := 0
var curX2M := 0
var curY2M := 0
var curX3 := 0
var curY3 := 0
var curX3M := 0
var curY3M := 0
var curX4 := 0
var curY4 := 0
var curX4M := 0
var curY4M := 0
var crot := 0
var f2 := 2
var f3 := 6
var f4 := 24
var f5 := 120
var f6 := 720
var f7 := 5040
var f8 := 40320
var f9 := 362880
var count := 0
var c1 := hue (300) saturation (50) lightness (25)
calcer.calc
for (0 .. hei2) do {i->
    for (0 .. wid3) do {j->
        circ.draw(0,0,j,i * h2,i)
        circ.draw(1,90,j,i * h2,i)
        circ.draw(2,180,j,i * h2,i)
        circ.draw(3,270,j,i * h2,i)
    }
}
left.go
right.go
right2.go
left2.go
left3.go
right3.go
ccc.go
print ("Small squares do +/- on mouse over")
print ("Left to right: Y Size, X Size, Dot Size")

// chunks: 993px,32px 13px,38px 609px,537px 40px,528px 776px,60px 323px,534px 1557px,2px 2373px,40px