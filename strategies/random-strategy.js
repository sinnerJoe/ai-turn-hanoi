const Strategy = require("./stategy")
const  getRandomOption = require('./util').getRandomOption
const R = require('ramda')
class RandomStrategy extends Strategy {

    constructor(currentState, bars, finalState) {
        super(currentState, bars, finalState)
        this.previousStates = [this.currentState.hash()]
        this.totalRollback = 0
        this.rollsCount = 0
        this.backup = this.currentState
    }








    rollback() {
        var candidate = this.currentState
        // console.log("state = " + this.currentState.state)
        // console.log(this.previousStates.length)
        // console.log(candidate.state)

        do {
            if (!this.previousStates.length) {
                this.currentState = this.backupFirstState
                return
            }
            if (candidate.parent.movable != this.backup.movable)
                break;
            var candidate = candidate.parent
            // this.previousStates.pop()
        } while (!candidate.hasChildren())
        this.currentState = candidate
        this.afterRollback = true

    }

    smartRollback() {
        this.rollsCount += 1
        // console.log("BEFORE ROLLBACK " + this.previousStates.length)
        // console.log("LAST ROLLBACK " + this.lastRollback)
        // if(this.rollsCount % 300 != 0 ){

            this.rollback()
            // if(this.rollsCount % 300 == 0){
            //     this.currentState = this.backup
            // }
        // }else{
            // while(this.currentState.parent && 
            //     this.currentState.parent.movable == this.currentState.movable){
            //         this.previousStates.pop()
            //         this.currentState = this.currentState.parent
            //     }
        // }
        


    }

    run() {
        if(!this.currentState.hadChildren())
            this.currentState.children = this.generateMoves(this.currentState).filter(c => !this.existedBefore(c))
        
            if (!this.currentState.hasChildren()) {
                this.smartRollback()

            }
            var chosenChild = getRandomOption(this.currentState.children)
            // console.log("CHOSEN " + chosenChild.state)
            // this.previousStates.concat(...this.currentState.children.map((c)=>c.hash()))
        if(chosenChild.movable < this.backup.movable){
            this.previousStates = []
            this.backup = chosenChild
            // console.log("______________---BLOCK____________")
        }
        this.previousStates.push(chosenChild.hash())
        // console.log(chosenChild.state)
        // console.log("OLD STATE " + this.currentState.state)
        // console.log("ROLLBACKS " + this.rollsCount)
        
        this.currentState = chosenChild
        this.rollsCount = 0;
        console.log(this.previousStates.length)
        // console.log("NEW STATE " + this.currentState.state)
        // console.log(this.previousStates.map(x => x.state))

    }
}

module.exports = RandomStrategy