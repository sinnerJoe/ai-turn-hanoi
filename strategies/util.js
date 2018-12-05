var R = require("ramda")

function* reverse(arr) {
    for (let i = arr.length - 1; i >= 0; i--)
        yield arr[i];
}

function getRandomOption(options) {
    if (options.length == 1) {
        var res = options[0]
        options.splice(0, 1)
        return res
    }

    var r = Math.random()
    var index = Math.trunc(r * options.length - 0.0000001)
    // console.log("Random num=" + res)
    var res = options[index]
    options.splice(index, 1);
    return res
}
function getRandomWeightedOption(options) {
    if (options.length == 1) {
        return options.pop()
    }
    // priority = 50 + 5 * pos
    var max = R.reduce((acc, pos) => acc + 50 + 10 * pos
        , 0, R.range(0, options.length))
    // console.log(max)
    var roll = Math.random() * max
    // console.log(roll)
    var sum = 0
    for (var i = 0; i < options.length - 1; i++) {
        sum += 50 + 10 * i
        if (sum > roll) {
            return options.splice(i, 1)[0]
        }
    }
    // console.log("Random num=" + res)
    return options.pop()
}

function getRandomRollback(maxRollback) {
    var r = Math.random()
    return Math.trunc(r * maxRollback - 0.0000000001)
}

var lastBars = 0;
class State {
    constructor(state, movable, bars) {
        this.state = state
        this.movable = movable
        this.children = [] // states that result in changing this state
        this.parent = null
        this._hash = null
        if (bars) {
            this.bars = lastBars
            lastBars = bars
        } else {
            this.bars = lastBars
        }
    }

    isCalculated() {
        return this.children.length > 0
    }

    hasChildren() {
        return this.children.length > 0
    }

    // equals(otherState){
    //     // return R.equals(otherState.state, this.state)
    //     for(let i =0; i<Math.max(this.movable, otherState.movable); i++)
    //         if(this.state[i] != otherState.state[i])
    //             return false
    //     return true
    // }
    equals(otherState) {
        // console.log(`${otherState.hash()} == ${this.hash()}`)
        return otherState.hash() == this.hash()
    }
    addChild(child) {
        this.children.push(child)
        child.setParent(this)
    }

    getChildren() {
        return this.children
    }

    setParent(parent) {
        this.parent = parent
    }

    hash() {
        // console.log(this.bars)
        if (this._hash !== null) return this._hash
        this._hash = 0;
        for (let i = 0; i < this.movable; i++) {
            // console.log(this._hash)
            this._hash += Math.pow(this.bars + 1, i) * (this.state[i] + 1)
        }
        return this._hash;
    }

}

module.exports = {
    State: State,
    getRandomRollback: getRandomRollback,
    getRandomOption: getRandomOption,
    getRandomWeightedOption: getRandomWeightedOption,
    reverse: reverse
}
