
const Strategy = require("./stategy")
const BFSStrategy = require('./bfs-strategy')
const { getRandomOption, State }  =  require('./util')
const R = require('ramda')

class IDDFSStrategy extends BFSStrategy {
    constructor() {
        super(...arguments);
        this.foundFinalState = false
        this.potentialMoves = [this.currentState]
    }

    run() {
        // console.log(this.potentialMoves.map(move=> {return {state: move.state, moveable: move.moveable}}))
        // console.log(this.potentialMoves.map(v => { return { state: v.state, movable: v.movable } }))
        // console.log(this.potentialMoves.length)
        if(this.potentialMoves.length)
        // console.log("RUN")
        this.potentialMoves = this.deepSearch(this.potentialMoves, 10 < this.minMovable? 10 : this.minMovable)


        // console.log("POTENTIAL MOVES:" )

    }

    deepSearch(rootStates, depth){
        // console.log(rootStates)
        if(depth == 1)
            var stacks =[rootStates]
        else 
            var stacks = [rootStates, ...R.repeat([], depth-1)]
        // console.log(stack)
        var finalStack = []
        do{
            for (var i=0 ; i<depth; i++){

                if (stacks[i].length == 0) {
                    const jmpIndex = R.findLastIndex((s) => s.length > 0, stacks)
                    if (jmpIndex == -1)
                        return finalStack
                    i = jmpIndex - 1
                    // console.log("jump to " + i)
                    continue
                }

                const state = stacks[i].pop()
                
                // console.log("state = " + state.state)
                const children = this.generateMovesClean(state).filter((child)=>!this.existedBefore(child))
                // console.log(children.map(c => c.state))
                // console.log("before best child")
                const bestChild = R.find((child) => child.movable < this.minMovable, children)
                // console.log("after best child")
                if(bestChild){ 
                    this.minMovable = bestChild.movable
                    this.previousStates = [bestChild.hash()]
                    return [bestChild]
                }
                
                this.previousStates = R.concat(this.previousStates, children.map((c)=>c.hash()))
                if(i==depth-1){
                    finalStack = R.concat(finalStack, children)
                    // console.log(finalStack.map(f=>f.state))
                    i--;
                }else{

                    stacks[i+1] = children
                    // console.log("ELSE STACKS " + stacks[i+1].length)
                    
                }
                // console.log(stacks.map(s=>s.length))
                // console.log(finalStack.length)
            }
        }while(!R.all((stack)=>stack.length == 0, stacks));
        return finalStack
    }
    // goodBreadth(rootStates, depth){
    //     var stack = rootStates
    //     // console.log(stack)
    //     for (var i=0 ; i<depth; i++){
    //         var newStack = []
    //         do{

    //             const state = stack.pop()
    //             const children = this.generateMovesClean(state).filter((child)=>!this.existedBefore(child))
    //             // console.log(children.map(c => c.state))
                
    //             const bestChild = R.find((child) => child.movable < this.minMovable, children)
    //             if(bestChild){ 
    //                 this.minMovable = bestChild.movable
    //                 this.previousStates = [bestChild.hash()]
    //                 return [bestChild]
    //             }
                
    //             this.previousStates = R.concat(this.previousStates, children.map((c)=>c.hash()))
    //             newStack = R.concat(newStack, children)
    //         }while(stack.length > 0);
    //         stack = newStack
                
    //     }
    //     return stack 
    // }
}

module.exports = IDDFSStrategy