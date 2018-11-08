var fs = require('fs')
function getRandomPos(options) {
    if(options.length == 1) return options[0]

    var r = Math.random()
    var index = Math.trunc(r * options.length-0.0000001)
    // console.log("Random num=" + res)
    var res = options[index]
    options.splice(index, 1);
    return res
}

function getRandomRollback(maxRollback){
    var r = Math.random()
    return Math.trunc(r * maxRollback - 0.0000000001)
}

function range(min, max) {
    var res = []
    for (var i = min; i < max; i++) res.push(i)
    return res
}   

function hash(arr, bars){
    var hash=0
    bars++
    
    for (var i = 0; i < arr.length; i++) {
        hash += arr[i] * Math.pow(bars, i)
    }

    return hash
}

class State{
    constructor(current, bars, movable, currentHash){
        this.current = current 
        this.hash = currentHash ? currentHash : hash(current, bars)
        this.movable = movable
    }

    equals(other){
        return this.hash == other.hash
    }
}

class Strategy{
    
    constructor(currentState, bars, finalState){
        this.invalidGuesses = 0;
        this.currentState = currentState
        this.hypothethis = currentState.slice(0)
        this.currentHash = hash(currentState, bars)
        this.finalState = finalState
        this.bars = bars
        this.movable = currentState.length-1
        this.previousStates = [new State(this.currentState.slice(0), bars, this.movable, this.currentHash)]
        this.stepsCount = 0;
        this.totalRollback = 0
        this.rollbackCount = 0
    }


    run(){}

    execute(){

        do{
            this.run()
        }while(!this.isDone())
        console.log("DONE")

    }

    rollBack(steps){
        this.totalRollback += steps
        this.rollbackCount ++
        steps = steps < this.previousStates.length? steps : this.previousStates.length - 1
        var fallBack = this.previousStates.length - 1 - steps;
        console.log("Fallback: " + fallBack)
        this.currentState = this.previousStates[fallBack].current
        this.movable = this.previousStates[fallBack].movable
        this.invalidGuesses = 0;
        // this.previousStates = this.previousStates.slice(0, fallBack)
        this.previousStates = this.previousStates.splice(fallBack+1, steps)
        // console.log("Fallback to " + this.currentState)
    }

    move(fromIndex, to){
        this.hypothethis = this.currentState.slice(0)
        // this.hypothethis.forEach((v, i)=>{
        //     this.hypothethis[i] = this.currentState[i]
        // })
        this.hypothethis[fromIndex] = to;
        // this.hypothethis = this.currentState
        this.hypoteticHash = hash(this.hypothethis)
        var valid = this.validate(fromIndex, to);
        if(valid){

            this.stepsCount ++
            this.invalidGuesses = 0;
            // console.log(`old state = ${this.currentState} -> ${this.hypothethis}`)
            this.currentState = this.hypothethis
            this.checkFreeze()
            this.previousStates.push(new State(this.currentState,  this.bars, this.movable, this.hypoteticHash))
            
            // console.log(`${this.currentState} curr[${fromIndex}] -> ${to}`)
        } 
        else if(this.invalidGuesses == 20){
            
            this.invalidGuesses = 0
            var rollDistance = getRandomRollback(Math.min(this.previousStates.length, 300))
            this.rollBack(rollDistance)
        }
        else{
            this.invalidGuesses++;
        }

        return valid;
        
    }

    checkFreeze(){
        while(this.currentState[this.movable] == this.finalState[this.movable] && this.movable >= 0){
            
            this.movable--;
            // console.log("after unshift: " + this.currentState)
        }
    }

    validate(fromIndex, to){ 

        // console.log("fromIndex = " + this.fromIndex)
        
        for(var i=0; i<fromIndex; i++){
            if(this.currentState[i] == this.currentState[fromIndex] || to == this.currentState[i])
                return false
        }
        for(var prevState of this.previousStates)
            // if(this.hypoteticHash == prevState.hash)
            //     return false;
            if(this.currentStateEquals(prevState.current))
                
        return true;
    }

    currentStateEquals(arr){
        for(var i in arr){
            if(this.currentState[i] != arr[i])
                return false
        }
        return true
    }

    isDone(){
        if(this.movable == -1) return true
        for(var i in this.currentState){
            // console.log(`${this.currentState[i]}==${this.finalState[i]}`)
            if(this.currentState[i] != this.finalState[i])
                return false
        }
        // console.log("done true")
        return true
    }

    report(){
        return{
            stepCount: this.previousStates.length ,
            steps: this.previousStates.map((state) => state.current),
            rollsCount: this.rollbackCount,
            rollsAmount: this.totalRollback  
        }
    }
}


var iterations = 0;
class RandomStrategy extends Strategy{
    

    run(){

        var barOptions = range(0, this.bars);
        while(barOptions.length > 1){

            var to = getRandomPos(barOptions)
            var options = range(0, this.movable + 1)
            do{
                // iterations++
                if(options.length == 0)
                throw "OMG we have no options"
                var fromIndex = getRandomPos(options)
                if (to == this.currentState[fromIndex] )
                    continue;
                var moveResult = this.move(fromIndex, to)
                
            } while (!moveResult && options.length > 1)   
            if(moveResult) break;
        }
        // console.log("loop end")
        iterations++;
        if(iterations == 20){
            fs.writeFileSync('output2.json', JSON.stringify(this.previousStates))
        }
        
    }
}

module.exports = { RandomStrategy: RandomStrategy}