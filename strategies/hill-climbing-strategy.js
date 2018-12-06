
const Strategy = require("./stategy")
const BFSStrategy = require('./bfs-strategy')
const { getRandomOption, State } = require('./util')
const R = require('ramda')


class HillClimbingStrategy extends Strategy {

    constructor(currentState, bars, finalState) {
        super(currentState, bars, finalState)
        this.previousStates = [this.currentState]
        this.failed = false;
    }


    run() {
        var moves = this.generateMovesClean(this.currentState);
        var fitnessList = moves.map((move) => this.calculateFitness(move))
        for (var i = 0; i < fitnessList.length; i++)
            if (fitnessList[i] == -1) {
                fitnessList.splice(i, 1);
                moves.splice(i, 1)
                i--;
            }
        this.totalStates += fitnessList.length

        if (fitnessList.length == 0)
            this.failed = true
        else {
            if (R.all(R.equals(fitnessList[0]), fitnessList)) {
                // console.log("randoming")
                // console.log(fitnessList)
                this.currentState = getRandomOption(moves)
            }
            else {
                // console.log("USING MAX FITNESS")
                var maxIndex = 0;
                var maxFitness = fitnessList[0]
                for (let i = 1; i < fitnessList.length; i++) {
                    if (fitnessList[i] > maxFitness) {
                        maxFitness = fitnessList[i]
                        maxIndex = i
                    }
                }
                this.currentState = moves[maxIndex]
            }

            this.previousStates.push(this.currentState.hash());
        }

    }

    discsOverSource(state) {
        const sourceBar = state.state[state.movable - 1]
        let discsOver = 0
        for (let i = 0; i < state.movable - 1; i++)
            if (state.state[i] == sourceBar)
                discsOver++;
        return discsOver
    }
    discsOnTarget(state) {
        const targetBar = this.finalState.state[state.movable - 1]
        let discs = 0
        for (let i = 0; i < state.movable - 1; i++)
            if (state.state[i] == targetBar)
                discs++;
        return discs
    }

    calculateFitness(state) {

        if (this.existedBefore(state))
            return -1;
        const onTarget = this.discsOnTarget(state)
        const overSource = this.discsOverSource(state)
        if (onTarget + overSource > 0)
            // return 1 / (onTarget + overSource * (1.0001))  //default fitness
            return 1 / (onTarget + overSource * (1 + 1 / this.bars))  //default fitness
        return 1
    }

    isDone() {
        // console.log(this.currentState.state)
        if (this.currentState.movable == -1 || this.failed) return true
        return this.currentState.equals(this.finalState)
    }


    report() {
        
        return {
            // steps: this.previousStates,
            steps: this.constructPath(this.currentState),
            failed: this.failed,
            stepsCount: this.previousStates.length,
            totalStates: this.totalStates
        }
    }


}

module.exports = HillClimbingStrategy