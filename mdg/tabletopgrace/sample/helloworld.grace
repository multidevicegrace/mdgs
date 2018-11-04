dialect "sniff"
class line.draw(xs,ys,xe,ye,c) {
    inherits rectangle
    width := rW
    height := rH
    var xm := xe - xs
    xm := xm / t
    var ym := ye - ys
    ym := ym / t
    var count := 0
    colour := c
    always {
        if (count <= t) then {
            x := xs + xm * count
            y := ys + ym * count
            count := count + 1
            stamp
        }
    }
}
class timer.t(time) {
    inherits rectangle
    x := 50000
    var counter := 0
    always {
        counter := counter + 1
        if (counter >= time) then {
            stop
        }
    }
}

var t := 100
var rW := 25
var rH := 25
timer.t(t + 50)
line.draw(25,50,25,150,"blue")
line.draw(25,100,75,100,"blue")
line.draw(75,50,75,150,"blue")
line.draw(125,50,175,50,"red")
line.draw(125,150,175,150,"red")
line.draw(125,50,125,150,"red")
line.draw(125,100,150,100,"red")
line.draw(225,50,225,150,"green")
line.draw(225,150,275,150,"green")
line.draw(325,50,325,150,"green")
line.draw(325,150,375,150,"green")
line.draw(425,50,425,150,"gold")
line.draw(475,50,475,150,"gold")
line.draw(425,50,475,50,"gold")
line.draw(425,150,475,150,"gold")
line.draw(25,250,25,350,"purple")
line.draw(75,250,75,350,"purple")
line.draw(25,350,40,330,"purple")
line.draw(75,350,60,330,"purple")
line.draw(125,250,125,350,"gold")
line.draw(175,250,175,350,"gold")
line.draw(125,250,175,250,"gold")
line.draw(125,350,175,350,"gold")
line.draw(225,250,225,350,"cyan")
line.draw(225,250,275,250,"cyan")
line.draw(275,250,275,300,"cyan")
line.draw(225,300,275,300,"cyan")
line.draw(225,300,275,350,"cyan")
line.draw(325,250,325,350,"green")
line.draw(325,350,375,350,"green")
line.draw(425,250,425,350,"magenta")
line.draw(425,250,475,280,"magenta")
line.draw(475,280,475,320,"magenta")
line.draw(425,350,475,320,"magenta")

// chunks: 700px,128px 8px,3px