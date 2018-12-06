const Strategy = require("./stategy")
// const { getRandomOption, State } from './util'
const R = require('ramda')


class BFSStrategy extends Strategy {
    constructor(currentState, bars, finalState) {
        super(currentState, bars, finalState)
        this.potentialMoves = this.generateMoves(this.currentState);
        // console.log("INITIAL POTENTIAL: " + this.potentialMoves)
        this.previousStates = [this.currentState, ...this.potentialMoves]
        this.minMovable = this.currentState.movable
    }
   
    

    isDone() {
        this.currentState = this.potentialMoves.find((move) => move.movable == -1);
        if (this.currentState) return true;
        // this.currentState = this.potentialMoves.some(move => move.equals(this.finalState))
        // if (this.currentState) return true;
    }

    run() {
        // console.log(this.potentialMoves.length)
        let nextMoves = []
        for (let parent of this.potentialMoves) {
            const children = this.generateMovesClean(parent).filter((child) => !this.existedBefore(child))
            this.totalStates += children.length
            const bestChild = R.find((child) => child.movable < this.minMovable, children)
            if(bestChild){
                    this.minMovable = bestChild.movable
                    this.potentialMoves = [bestChild]
                    this.previousStates = [bestChild.hash()]
                    console.log("SHORTCUT")
                    return
                }
            this.previousStates = this.previousStates.concat(...children.map((c) => c.hash()))
            nextMoves = nextMoves.concat(...children)
        }
        this.potentialMoves = nextMoves
    }

    // run2(){
    //     var newStack = []
    //     do{

    //         const state = this.potentialMoves.pop()
    //         const children = this.generateMovesClean(state).filter((child)=>!this.existedBefore(child))

    //         const bestChild = R.find((child) => child.movable < this.minMovable, children)
    //         if(bestChild){ 
    //             this.minMovable = bestChild.movable
    //             this.previousStates = [bestChild.hash()]
    //             return [bestChild]
    //         }

    //         this.previousStates = R.concat(this.previousStates, children.map((c)=>c.hash()))
    //         newStack = R.concat(newStack, children)
    //     }while(this.potentialMoves.length > 0);
    //     this.potentialMoves = newStack

    // }

    report() {
        let path = []
        let state = this.currentState
        console.log("A STATE" + state.parent)
        while (state.parent !== null) {
            state = state.parent
            path.push(state)
        }
        return {
            stepCount: path.length,
            steps: path,
            totalStates: this.totalStates
        }
    }
}

module.exports = BFSStrategy