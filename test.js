var strat = require('./strategy')
var R = require('ramda')
var fs = require('fs')
var discs = 11
var start = R.repeat(0, discs)
var end = R.repeat(1, discs)
var bars = 3
var randStrat = new strat.RandomStrategy(start, bars, end)


function test1(){
    console.log("_____________________TEST1_______________-")
    for(var i=0; i< 1000; i++){
        randStrat.run();
    }
    
    // console.log([...randStrat.previousStates, randStrat.currentState].map(x => x.state))
}

function test2(){
    var randStrat = new strat.RandomStrategy(start, bars, end)
    console.log("_____________________TEST2________________")
    var testObj = new strat.State([1, 0, 0, 0, 0], 5)
    randStrat.generateMoves(testObj)
    console.log(testObj)
}

function test3(){
    var randStrat = new strat.RandomStrategy(start, bars, end)
    console.log("_____________________TEST3________________")
    var saveCons = console.log
    // console.log = function(){}
    randStrat.execute()
    // console.log = saveCons
    console.log("TOTAL STEPS:" + randStrat.previousStates.length)
    var steps = randStrat.report().steps 
    validateSteps(steps)
    fs.writeFileSync('output.json', JSON.stringify({
        steps: steps
    }, null, 2))

}

function test4(){
    var sum =0 
    for(var i=0; i<100; i++){
        var options = [1, 2, 3, 4, 5, 6, 7, 8].map((v, i) => [v, i * 10 + 50])
        var expectedSum = R.sum(options.map((v)=>v[1]))
        console.log("expected max=" + expectedSum)
        var rand = strat.getRandomWeightedOption(options);
        sum += rand
        console.log(rand)
    }
    console.log("Mean roll: " + (sum / 100))
}

function validateSteps(steps){
    for(var i=0; i<steps.length-1; i++){
        var count = 0
        for(var j in steps[i]){
            if(steps[i][j] != steps[i+1][j]){
                count++
            }
        }

        if(count > 1){
            console.log(`DIFFERENCES ${i}-${i+1}: ` + count);
            console.log(steps[i])
            console.log(steps[i+1])
        }
    }
}

function createBFS(){
    return new strat.BFSStrategy(start, bars, end);
}

function test5(){
    var strategy = createBFS()
    strategy.execute()
    const report = strategy.report()
    console.log(report.stepCount)
    console.log(report.steps.map(step=> step.state))
    // console.log(report.steps);
}

// test1()
// test2()
// test3()
// test4()
test5();