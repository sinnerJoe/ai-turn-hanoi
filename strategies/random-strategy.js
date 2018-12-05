const Strategy = require("./stategy")
const  getRandomOption = require('./util').getRandomOption
const R = require('ramda')
class RandomStrategy extends Strategy {

    constructor(currentState, bars, finalState) {
        super(currentState, bars, finalState)
        this.previousStates = []
        this.totalRollback = 0
        this.rollsCount = 0
    }



    validate(option) {
        if (this.currentState.equals(option) || this.existedBefore(option))
            return false

        return true
    }





    rollback() {
        var candidate = this.currentState
        do {
            if (!this.previousStates.length) {
                throw "NO MORE STATES TO ROLL BACK"
            }
            if (this.previousStates[this.previousStates.length - 1].movable != this.currentState.movable)
                break;
            var candidate = this.previousStates.pop()
        } while (!candidate.hasChildren())
        this.currentState = candidate
        this.afterRollback = true

    }

    smartRollback() {
        this.rollsCount += 1
        console.log("BEFORE ROLLBACK " + this.previousStates.length)
        console.log("LAST ROLLBACK " + this.lastRollback)
        this.rollback()
        if (this.rollsCount % 200 == 0) {
            if (this.currentState.state.length == this.currentState.movable) {
                var deletedStates = this.previousStates.splice(2)
                this.currentState = deletedStates[0]
                this.totalRollback += deletedStates.length
            } else {
                var advancedStates = R.takeLastWhile(
                    (state) => state.movable == this.currentState.movable,
                    this.previousStates)
                this.currentState = advancedStates[0]
                this.previousStates.splice(this.previousStates.length - advancedStates.length)
                this.lastRollback = this.previousStates.length
            }

            console.log("_______________________BOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOM----------------")
            return;
        }
        else if (this.lastRollback === this.previousStates.length) {
            // console.log("ROLLBACK BUG")
            var maxRoll = Math.max(this.lastRollback / 25, 5)
            var roll = getRandomOption(R.range(1, maxRoll))
            for (var i = 0; i < roll; i++)
                this.rollback()
            this.totalRollback += roll

        }
        this.totalRollback += 1
        this.lastRollback = this.previousStates.length
        // console.log("AFTER ROLLBACK " + this.previousStates.length)
    }

    run() {
        this.generateMoves(this.currentState)

        do {
            if (!this.currentState.hasChildren()) {
                this.smartRollback()
                return;
            }
            var chosenChild = getRandomOption(this.currentState.children)
            // console.log("CHOSEN " + chosenChild.state)
        }
        while (!this.validate(chosenChild))
        this.previousStates.push(this.currentState)
        // console.log("OLD STATE " + this.currentState.state)
        this.currentState = chosenChild
        // console.log("NEW STATE " + this.currentState.state)
        // console.log(this.previousStates.map(x => x.state))

    }
}

module.exports = RandomStrategy