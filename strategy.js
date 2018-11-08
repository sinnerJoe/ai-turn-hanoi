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

function range(min, max) {
    var res = []
    for (var i = min; i < max; i++) res.push(i)
    return res
}   

function hash(arr, bars){
    var hash=0
    for (var i = 0; i < arr.length; i++) {
        hash += arr[i] * Math.pow(bars, i)
    }
    return hash
}

class State{
    constructor(current, bars, movable){
        this.current = current 
        this.hash = hash(current, bars)
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
        this.currentHash = hash(currentState, bars)
        this.finalState = finalState
        this.bars = bars
        this.movable = currentState.length-1
        this.previousStates = [new State(this.currentState, bars, this.movable)]
        this.stepsCount = 0;
        this.rollBacks = []
    }


    run(){}

    execute(){
        // var key = setInterval(()=>{
        //     this.run()
        //     if(this.isDone()){

        //         clearInterval(key)
        //         console.log("DONE")
        //     }
        // }, 0)

        do{
            this.run()
        }while(!this.isDone())
        console.log("DONE")

    }

    rollBack(steps){
        steps = steps < this.previousStates.length? steps : this.previousStates.length - 1
        var fallBack = this.previousStates.length - 1 - steps;
        // console.log("Fallback: " + fallBack)
        this.currentState = this.previousStates[fallBack].current
        this.invalidGuesses = 0;
        this.previousStates = this.previousStates.slice(0, fallBack)
        // console.log("Fallback to " + this.currentState)
    }

    move(fromIndex, to){
        this.hypothethis = this.currentState.slice(0)
        this.hypothethis[fromIndex] = to;
        this.hypoteticHash = hash(this.hypothethis)
        var valid = this.validate(fromIndex, to);
        if(valid){
            this.stepsCount ++
            // console.log(`old state = ${this.currentState} -> ${this.hypothethis}`)
            this.currentState = this.hypothethis
            this.checkFreeze()
            this.previousStates.push(new State(this.currentState,  this.bars, this.movable))
            // console.log(`${this.currentState} curr[${fromIndex}] -> ${to}`)
        } 
        // else if(this.invalidGuesses == this.bars*3){
        //     var i = 0;
            
        //     while (i < this.previousStates.length && this.previousStates[this.previousStates.length-i-1].movable == this.movable ){
                
        //         i++;
        //         console.log("rollback " + i)
        //     }
        //     this.rollBack(i)
        // }
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
        
        for(var prevState of this.previousStates)
            if(this.hypoteticHash == prevState.hash)
                return false;
        // console.log("after prev states")

        // console.log("reach for")
        for(var i=0; i<fromIndex; i++){
            if(this.currentState[i] == this.currentState[fromIndex] || to == this.currentState[i])
                return false
        }
                
        return true;
    }

    equalLists(list1, list2){
        for(var i in list1) 
            if(list1[i] != list2[i]) return false;
        return true;
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
            stepCount: this.previousStates.length,
                // steps: coolStrat.previousStates.map((state) => state.current)
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
        
        // if(iterations > 100){
        //     fs.writeFileSync('output.json', JSON.stringify(this.previousStates))
        // }
        
    }
}

module.exports = { RandomStrategy: RandomStrategy}