dialect "sniff"
class circ.m1(x0,y0,s) {
    inherits circle
    radius := s
    radius := s
    x := x0
    y := y0
    rng.randC
    colour := rc
    always {
        if (randomise != 0) then {
            rng.randC
            colour := rc
        }
        forward (speed)
        if (random (1) < turnChance) then {
            turn (random (180) - 90)
        }
        if (x < 0) then {
            x := 0
            turn (random (90) - 45)
        }
        if (x > 500) then {
            x := 500
            turn (random (90) - 45)
        }
        if (y < 0) then {
            y := 0
            turn (random (90) - 45)
        }
        if (y > 500) then {
            y := 500
            turn (random (90) - 45)
        }
        stamp
    }
    method mousedown {
        stop
    }
}

class squr.m1(x0,y0,s) {
    inherits rectangle
    width := s
    height := s
    x := x0
    y := y0
    rng.randC
    colour := rc
    always {
        if (randomise != 0) then {
            rng.randC
            colour := rc
        }
        forward (speed)
        if (random (1) < turnChance) then {
            turn (random (180) - 90)
        }
        if (x < 0) then {
            x := 0
            turn (random (90) - 45)
        }
        if (x > 500) then {
            x := 500
            turn (random (90) - 45)
        }
        if (y < 0) then {
            y := 0
            turn (random (90) - 45)
        }
        if (y > 500) then {
            y := 500
            turn (random (90) - 45)
        }
        stamp
    }
    method mousedown {
        stop
    }
}

class eraser.e {
    inherits rectangle
    width := 100
    height := 100
    colour := bg
    x := 5000
    y := 5000
    var moved := 0
    always {
        jumpTo (mouse)
        if ((x + y) == 500) then {
            if (moved == 0) then {
                x := 5000
                y := 5000
            }
        } else {
            moved := 1
        }
        stamp
    }
    method mousedown {
        stop
    }
}

object {
    inherits rectangle
    colour := "white"
    x := 5000
    y := 5000
    method randC {
        rc := hue (random (hueMax - hueMin) + hueMin) saturation (random (satMax - satMin) + satMin) lightness (random (lumMax - lumMin) + lumMin)
    }
    always {
        count := count + 1
        if (count > time) then {
            stop
        }
    }
}
def rng = above
var time := 500
var shapes := 30
var speed := 15
var turnChance := 0.01
var shapeRng := 10
var circleChance := 0.5
var hueMin := 0
var hueMax := 360
var satMin := 25
var satMax := 75
var lumMin := 25
var lumMax := 75
var randomise := 0
var circleR1 := 7.5
var circleR2 := 7.5
var squareS1 := 10
var squareS2 := 10
var count := 0
var rc := 0
for (1 .. shapes) do {ii->
    if (random (shapeRng) > (shapeRng * circleChance)) then {
        squr.m1(random (100) + 50,random (100) + 50,random (squareS1) + squareS2)
    } else {
        circ.m1(random (100) + 50,random (100) + 50,random (circleR1) + circleR2)
    }
}
rng.randC
var bg := rc
background (bg)
eraser.e

// chunks: 1243px,447px 862px,446px 559px,445px 25px,12px