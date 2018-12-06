const Strategy = require("./stategy")
const HillClimbingStrategy = require("./hill-climbing-strategy")
const { getRandomOption, State } = require('./util')
const R = require('ramda')


class AStarStrategy extends HillClimbingStrategy {
    constructor(currentState, bars, finalState) {
        super(currentState, bars, finalState)
        this.previousStates = {}
        this.minMovable = this.currentState.movable
        this.stepEnd = null
        this.unvisitedNodes = {}
        this.constructedPath = []
        this.totalCreatedNodes = 0;
        this.currentState = this.registerOrGetExisting(this.currentState)
        this.currentState.goalDistance = 0;
        this.currentState.reachCost = 0
        this.visitNeighbors(currentState)
        this.currentState.goalDistance = Infinity
    }

    calculateInverseFitness(state) {
        const onTarget = this.discsOnTarget(state)
        const overSource = this.discsOverSource(state)
        if (onTarget + overSource > 0)
            return 1000 - 1000 / (onTarget + overSource * (1 + 1 / this.bars))  
        return 0 //default fitness
    }

    registerOrGetExisting(node){
        const registeredNode = this.previousStates[node.hash()]
        if(registeredNode)
            return registeredNode
        const calculatedNode = {
            node: node,
            neighbors: {},
            state: node.state,
            movable: node.movable,
            goalDistance: this.calculateInverseFitness(node),
            reachCost: -1,
            hash: node.hash()
        } 
        this.totalCreatedNodes++;

        this.previousStates[calculatedNode.hash] = calculatedNode
        this.unvisitedNodes[calculatedNode.hash] = calculatedNode
        return calculatedNode
    }

    visitNeighbors(node) {
        console.log("___________________")
        console.log(node.state)
        console.log(this.stepEnd)
        console.log("___________________")
        const upperDiscs = R.repeat(-1, this.bars)
        for (var i = 0; i < node.movable; i++) {
            var bar = node.state[i]
            if (upperDiscs[bar] == -1)
                upperDiscs[bar] = i
        }
        for (var i = 0; i < this.bars; i++) {
            if (upperDiscs[i] != -1)
                for (var j = 0; j < this.bars; j++) {
                    if (upperDiscs[j] == -1 || upperDiscs[i] < upperDiscs[j]) {
                        // console.log(`Move from ${i} to ${j}`)
                        // var arrState = state.state.slice(0)
                        const arrState = R.clone(node.state)
                        arrState[upperDiscs[i]] = j
                        // console.log(arrState)
                        const movable = this.countMovable(arrState, node.movable)
                        const neighbor = this.registerOrGetExisting(new State(arrState, movable, this.bars))
                        if(!(neighbor in node.neighbors)){
                            node.neighbors[neighbor.hash] = neighbor
                            const neighborReachCost = node.reachCost + neighbor.goalDistance
                            if (neighbor.reachCost == -1 || neighbor.reachCost > neighborReachCost)
                                neighbor.reachCost = neighborReachCost
                        }

                        if(this.minMovable > neighbor.movable){
                            this.stepEnd = neighbor
                           console.log("_______OMG I FOUND END______" + neighbor.state)
                        }
                            
                    }
                }
        // console.log("length:" + state.getChildren().length)
        }
        console.log("created neighbors")
        // console.log(Object.keys(node.neighbors).map((v) => node.neighbors[v].state))
        return node.neighbors
    }

    isDone() {
        return this.currentState.movable == -1 || this.currentState.hash == this.finalState.hash()
    }
    
    minCostNode(collection){ 
        // console.log("Collection = ") 
        // console.log(collection)
        const keys = Object.keys(collection)
        var node = collection[keys[0]]
        var minCost = node.reachCost
        for (var i=1; i<keys.length; i++){
            const candidate = collection[keys[i]]
            if(candidate.reachCost < minCost){
                node = candidate
                minCost = candidate.reachCost
            }  
        }
        return node
    }

    run() {
        // console.log("Total created nodes = " + this.totalCreatedNodes)
        // console.log(Object.keys(this.unvisitedNodes).length)
        // console.log(Object.keys(this.previousStates).length)
        // console.log(Object.keys(this.unvisitedNodes).map((v) => this.unvisitedNodes[v].state))
        // console.log(Object.keys(this.unvisitedNodes).map((v) => this.unvisitedNodes[v].reachCost))
        // if(this.stepEnd.movable == 1){
        //     this.constructedPath.push(this.stepEnd.state)
        // }
        const cheapestNode = this.minCostNode(this.unvisitedNodes)
        delete this.unvisitedNodes[cheapestNode.hash]
        this.visitNeighbors(cheapestNode)

        if(this.stepEnd){
            console.log("reached partial end")
            console.log(this.stepEnd.state)
            console.log(this.stepEnd.movable)
            if(this.stepEnd.movable == -1){
                console.log("MY OPTIMIZATION WORKS !!!!!!!")
                this.constructedPath.push(this.stepEnd)
                // this.visitNeighbors(stepEnd)
                // this.constructedPath.push(this.stepEnd)
                this.currentState = this.stepEnd
                
                return
            }
            const stepEnd = this.stepEnd
            this.minMovable = stepEnd.movable

            this.minMovable -= 3
            stepEnd.movable++;
            const neighborCollection = this.visitNeighbors(stepEnd)

            Object.keys(neighborCollection).forEach((k) => this.visitNeighbors(neighborCollection[k]))
            if(stepEnd.hash !== this.stepEnd.hash) {
                console.log("STEP END CHANGED")
                console.log("from " + stepEnd.state + " to " + this.stepEnd.state)
            }
            this.minMovable += 3
            stepEnd.movable--;


            var pathNode = stepEnd
            var partialPath = [pathNode]
            console.log("RECONSTRUCTING PATH " + this.minMovable)
            while(!pathNode.neighbors[this.currentState.hash]){
                // if(R.keys(pathNode).length == 0) 
                //     break
                const cheapest = this.minCostNode(pathNode.neighbors)
                delete cheapest.neighbors[pathNode.hash]
                pathNode = cheapest
                partialPath.unshift(pathNode);
                // console.log("SEARCHING for " + this.currentState.state)
                console.log("Current state " + pathNode.state)
                // console.log("Current neighbors: ")
                // for(let v of Object.keys(pathNode.neighbors) ){
                //     console.log(pathNode.neighbors[v].state)
                // }
            }
            console.log("NR of steps added " + partialPath.length)
            console.log(this.stepEnd.movable == 1)
            this.constructedPath = R.concat(this.constructedPath, partialPath)
            // if(this.stepEnd.movable == 1)
            //     this.constructedPath.push(pathNode)
            this.currentState = stepEnd
            // this.resetNode(this.currentState)
            this.stepEnd = null

        }
    }

    resetNode(node){
        node.neighbors = {}
        node.reachCost = 0
        node.goalDistance = 0
        const collection = {}
        collection[node.hash] = node
        this.previousStates = collection
        this.unvisitedNodes = {}
        this.minMovable -= 3
        let neighbors = this.visitNeighbors(node)
        this.minMovable -= 3
        for (let k of Object.keys(neighbors))
            neighbors[k].neighbors[node.hash]= node
        node.reachCost = Infinity
    }

    report() {
        // console.log("before clone")
        // const prelast = { state: R.clone(this.constructedPath[this.constructedPath.length - 2].state)}
        // console.log("after clone")
        // prelast.state[1] = this.constructedPath[this.constructedPath.length - 1].state[1]
        // console.log(R.takeLast(4, this.constructedPath).map(v => v.state))
        // this.constructedPath.splice(this.constructedPath.length-1, 0, prelast)
        return {
            stepCount: this.constructedPath.length,
            steps: this.constructedPath,
            // totalStates: this.totalStates
        }
    }
}

module.exports = AStarStrategy