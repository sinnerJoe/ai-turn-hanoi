
const { State } = require("./util");
const R = require('ramda')
class Strategy {

    constructor(currentState, bars, finalState) {
        this.invalidGuesses = 0;
        this.currentState = new State(currentState, currentState.length, bars)
        this.finalState = new State(finalState, currentState.length, bars)
        this.bars = bars
        this.totalStates = 0
        // this.stepsCount = 0;
        // this.totalRollback = 0
        // this.rollbackCount = 0
    }

    constructPath(state){
        var path = []
        while(state.parent){
            path.push(state)
            state = state.parent
        }
        return path
    }

    generateMovesClean(state) {
        var children = this.generateMoves(state)
        delete state.children
        return children
    }


    run() { }

    execute() {

        do {
            this.run()
        } while (!this.isDone())
        console.log("DONE")

    }

    validate(fromIndex, to) {

        // console.log("fromIndex = " + this.fromIndex)

        for (var i = 0; i < fromIndex; i++) {
            if (this.currentState[i] == this.currentState[fromIndex] || to == this.currentState[i])
                return false
        }

        return true;
    }

    isDone() {
        // console.log(this.currentState.state)
        if (this.currentState.movable == -1) return true
        return this.currentState.equals(this.finalState)
    }

    report() {
        let path = []
        console.log("A STATE" + this.currentState.parent)
        let state = this.currentState
        while (state.parent) {
            state = state.parent
            path.push(state.state)
        }
        return {
            stepCount: path.length,
            steps: path,
            totalStates: this.totalStates
        }
    }

    countMovable(arr, firstUnmovable) {
        // console.log(`countMovable: ${arr} ${firstUnmovable}`)
        for (var i = firstUnmovable - 1; i >= 0; i--)
            if (arr[i] != this.finalState.state[i])
                return i + 1

        return -1;

    }

    // existedBefore(state) {
    //     for (let i = this.previousStates.length - 1; i >= 0; i--) {
    //         if (state.equals(this.previousStates[i])) {
    //             return true
    //         }
    //     }
    //     return false
    // }

    existedBefore(state) {
        for (let i = this.previousStates.length - 1; i >= 0; i--) {
            if (state.hash() === this.previousStates[i]) {
                return true
            }
        }
        return false
    }

    generateMoves(state) {
        
        const upperDiscs = R.repeat(-1, this.bars)
        for (var i = 0; i < state.movable; i++) {
            var bar = state.state[i]
            if (upperDiscs[bar] == -1)
                upperDiscs[bar] = i
        }


        for (var i = 0; i < this.bars; i++) {
            if (upperDiscs[i] != -1)
                for (var j = 0; j < this.bars; j++) {
                    if (upperDiscs[j] == -1 || upperDiscs[i] < upperDiscs[j]) {
                        // console.log(`Move from ${i} to ${j}`)
                        // var arrState = state.state.slice(0)
                        const arrState = R.clone(state.state)
                        arrState[upperDiscs[i]] = j
                        // console.log(arrState)
                        const movable = this.countMovable(arrState, state.movable)
                        const child = new State(arrState, movable)

                        if (child.movable < state.movable) {
                            state.children = [child]
                            child.setParent(state)
                            return state.children
                        }
                        state.addChild(child)

                    }
                }
        }
        // console.log("length:" + state.getChildren().length)
        return state.getChildren() || []
    }
}

module.exports = Strategy