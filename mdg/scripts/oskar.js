var input;

var DEFAULT_KEYS = {
    0: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', {cap: '\u232b', value: 'backspace'}],
        [' ', {cap:'Close',value:'close'}]
    ],
    1: [
        ['!', '@', '£', '$', '%', '^', '&', '*', '(', ')'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        [{cap: '\u21e7', toLayer: 0, className: 'shift'},
            'Z', 'X', 'C', 'V', 'B', 'N', 'M', {cap: '\u232b', value: 'backspace'}],
        [' ', {cap:'Close',value:'close'}]
    ]
};

var NUM_KEYS = {
    0: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        [{cap: '\u232b', value: 'backspace'}, "-", ".", {cap:'Close',value:'close'}]
    ]
};

/* var TXT_KEYS = {
  0: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '+'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[',']', ],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ':', '{','}', '"'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', '<', '>', '^', {cap: '\u232b', value: 'backspace'}],
      ['←','↑','→','↓'],
      [' ', {cap:'Close',value:'close'}]
  ]  
}; */

function parseKey(key) {
    if (typeof key === 'string') {
        key = {cap: key};
    }
    if (key.cap === ' ' && !key.className) {
        key.className = 'space';
    }
    if (key.cap === 'Close' && !key.className) {
        key.className = "close";
    }    
    if (!key.value) {
        key.value = key.cap;
    }
    return key;
}

function Oskar(elem, b, windex) {

    // opts = opts || {};

    this.keyMap = DEFAULT_KEYS;
    // this.onkeypress = opts.onkeypress || function() {};
    this.layers = {};
    this.activeLayer = null;

    var rootEl = this.el = document.createElement('div');
    rootEl.className = 'osk';
    rootEl.elem = elem;

    var keys = DEFAULT_KEYS, layerIx = 0;
    if (b) {
        keys = NUM_KEYS;
    }

    for (var k in keys) {

        var layerEl = document.createElement('div');
        layerEl.className = 'osk-layer osk-layer-' + k;

        if (layerIx++ === 0) {
            layerEl.style.display = 'block';
            this.activeLayer = k;
        } else {
            layerEl.style.display = 'none';
        }

        keys[k].forEach(function(rowKeys, ix) {

            var rowEl = document.createElement('div');
            rowEl.className = 'osk-row osk-row-' + ix;
            layerEl.appendChild(rowEl);

            rowKeys.forEach(function(key) {
                
                key = parseKey(key);

                var keyEl = document.createElement('a');
                keyEl.href = '#';
                keyEl.className = 'osk-key';
                keyEl.textContent = key.cap;
                keyEl.oskarKey = key;
                if ('className' in key) {
                    keyEl.className += ' ' + key.className;
                }

                rowEl.appendChild(keyEl);
            
            });

            rootEl.appendChild(layerEl);

            return layerEl;

        });

        this.layers[k] = layerEl;

    }

    var self = this;


    rootEl.addEventListener('touchstart', function(evt) {
        // console.log("Keyboard: " + evt.target.oskarKey);
        evt.stopPropagation();
        evt.preventDefault();
    });
    rootEl.addEventListener('touchmove', function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    });
    rootEl.addEventListener('touchend', function(evt) {
        var key = evt.target.oskarKey;
        if (key) { 
            keyPress(key.value,evt);
        }
        evt.stopPropagation();
        evt.preventDefault();
    });

    if (windex == -1) { elem.parentNode.appendChild(rootEl); }
    else { codearea2[windex].appendChild(rootEl); }
    return rootEl;

}

function keyPress(key,event) {    
    var input = getKeyboard(event).elem;
    // console.log("Input: " + getKeyboard(event) + ", " + input);
    if (key == "backspace") {
        input.value = input.value = input.value.substring(0, input.value.length - 1);
    } else if (key === 'close') {
        keyPressAccept(input);
    } else if (key === '-') {
        keyPressMinus(input);
    } else if (key === '.') {
        keyPressDecimal(input);
    } else {
        input.value += key;
    }
    if (input && input.value) {
        // console.log("KeyPress Input: " + input);
        input.size = Math.max(input.value.length, 3);
    }
}

function getKeyboard(event) {
  var target = event.target;
  while (!target.classList.contains("osk")) {
    target = target.parentNode;
  }
  return target;
}

function keyPressDecimal(input) {
    console.log("Decimal: " + input.value);
    if (!input.value.includes(".")) {
        input.value += ".";
    }
}

function keyPressMinus(input) {    
    if (input.value.substring(0,1) != "-") {
        input.value = "-" + input.value;
    } else {
        input.value = input.value.substring(1);
    }
}

function keyPressAccept(input) {
    // input.blur();
    hideKeyboard(input);
    // codearea.focus();    
}

function hideKeyboard(elem) {
    var keyboard = elem.keyboard;
    if (keyboard) {
      keyboard.parentNode.removeChild(keyboard);
      // if (codearea2[keyboard.windex].style.visibility == "hidden") {
        // editor4[keyboard.windex].removeChild(keyboard);
      // } else {
        // codearea2[keyboard.windex].removeChild(keyboard);
      // }
      elem.keyboard = null;
    }    
}

function showKeyboard(elem, textView, windex, num) {
    // if (input) { hideKeyboard; }        
    if (elem.keyboard) { return; }
    // input = elem;
    
    var keyboard;
    var parent = elem.parentNode;
    // console.log("Show Keyboard: " + parent.classList);
    if (num || parent.classList.contains("number")) {
        keyboard = Oskar(elem, 1, windex);
        // keyboard = keyboards[1];
    } else {
        // keyboard = keyboards[0];
        keyboard = Oskar(elem, 0, windex);
    }    
    
    elem.keyboard = keyboard;
    keyboard.windex = windex;
    
    if (!textView) {
      var tile = elem;
      while (tile.parentNode != codearea2[windex]) {
          tile = tile.parentNode;
      }


      // if (!keyboard) { oskar(); }
      keyboard.style.display = "";
      // console.log("Show Keyboard: " + elem + ", " + elem.offsetLeft + ", " + elem.offsetWidth + ", " + keyboard.offsetWidth);
      var t = tile.offsetTop + elem.offsetTop + elem.offsetHeight + 10;

      // // console.log("KB T: " + (t + keyboard.offsetHeight) + ", " + codearea.offsetHeight);


      keyboard.style.position = "absolute";  
      if (windex != -1) {
        keyboard.style.top = tile.offsetTop + elem.offsetTop + elem.offsetHeight + 10 + "px";
        keyboard.style.left = tile.offsetLeft + elem.offsetLeft + (elem.offsetWidth * .5) - (keyboard.offsetWidth * .5) + "px";      
      } else {
        keyboard.style.left = (elem.offsetWidth * .5 - keyboard.offsetWidth * .5) + "px";
        keyboard.style.top = (elem.offsetHeight * .9 - keyboard.offsetHeight) + 150 + "px";
      }
      
      // console.log("Keyboard: " + keyboard + ", windex: " + windex + ", codearea2[windex]: " + codearea2[windex]);
      if (windex != -1) {
        if (t + keyboard.offsetHeight > codearea2[windex].offsetHeight) {
            keyboard.style.top = tile.offsetTop + elem.offsetTop - keyboard.offsetHeight - 10 + "px";
        }
      }
    } else {
      elem.appendChild(keyboard);
      keyboard.style.position = "absolute";
      keyboard.style.left = (elem.offsetWidth * .5 - keyboard.offsetWidth * .5) + "px";
      keyboard.style.top = (elem.offsetHeight * .9 - keyboard.offsetHeight) + "px";
    }


}

Oskar.prototype.appendTo = function(el) {
    el.appendChild(this.el);
}

Oskar.prototype.sendTo = function(input, opts) {

    opts = opts || {};

    if (typeof opts === 'function')
        opts = {oncomplete: opts};
    
    var oncomplete    = opts.oncomplete || function() {},
        clearOnEnter  = !!opts.clearOnEnter;
    
    this.onkeypress = function(key) {
        if (key === 'backspace') {
            input.value = input.value.substring(0, input.value.length - 1);
        } else if (key === 'enter') {
            oncomplete(input.value);
            if (clearOnEnter) {
                input.value = '';
            }
        } else {
            input.value += key;
        }
    }

}

Oskar.prototype.showLayer = function(layer) {
    
    layer = '' + layer;
    
    if (layer === this.activeLayer) {
        return;
    }

    this.layers[this.activeLayer].style.display = 'none';
    this.layers[layer].style.display = 'block';

    this.activeLayer = layer;

}

// module.exports = function(options) {
//     return new Oskar(options);
// };

// module.exports.Oskar = Oskar;