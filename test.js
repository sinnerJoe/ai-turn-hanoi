const RandomStrategy = require('./strategies/random-strategy')
const BFSStrategy = require('./strategies/bfs-strategy')
const IDDFSStrategy  = require('./strategies/iddfs-strategy')
const HillClimbingStrategy = require('./strategies/hill-climbing-strategy')
const AStarStrategy = require("./strategies/a-star-strategy")
const {getRandomWeightedOption, State} = require('./strategies/util')
const R = require('ramda')
var fs = require('fs')
var discs = 12
var start = R.repeat(0, discs)
var end = R.repeat(1, discs)
var bars = 3
var randStrat = new RandomStrategy(start, bars, end)


function measureTime(cb){
    const start = new Date().getTime()
    cb()
    return new Date().getTime() - start
}

function test1(){
    console.log("_____________________TEST1_______________-")
    for(var i=0; i< 1000; i++){
        randStrat.run();
    }
    
    // console.log([...randStrat.previousStates, randStrat.currentState].map(x => x.state))
}

function test2(){
    var randStrat = new RandomStrategy(start, bars, end)
    console.log("_____________________TEST2________________")
    var testObj = new State([1, 0, 0, 0, 0], 5)
    randStrat.generateMoves(testObj)
    console.log(testObj)
}

function test3(){
    var randStrat = new RandomStrategy(start, bars, end)
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
        var rand = getRandomWeightedOption(options);
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
    return new BFSStrategy(start, bars, end);
}

function test5(){
    console.log("________________TEST 5______________________")
    var strategy = createBFS()
    const secs = measureTime(() => strategy.execute())
    console.log("Time elapsed: " + secs)
    const report = strategy.report()
    console.log(report.stepCount)
    console.log("total states: " + report.totalStates)
    console.log(report.steps.map(step => step.state))
    // console.log(report.steps);
}

function test6(){
    console.log("________________TEST 6______________________")
    var strategy = new HillClimbingStrategy(start, bars, end)
    const secs = measureTime(() => strategy.execute())
    console.log("Time elapsed: " + secs)
    const report = strategy.report()
    console.log("Steps: " + report.stepsCount)
    console.log("total states: " + report.totalStates)
    console.log("Failed " + report.failed)
    
    console.log(report.steps.map(step => step.state))
}

function test7(){
    console.log("________________TEST 7______________________")
    var strategy = new IDDFSStrategy (start, bars, end)
    const secs = measureTime(() => strategy.execute())
    console.log("Time elapsed: " + secs)
    const report = strategy.report()
    console.log(report.stepCount)
    console.log(report.steps.map(step => step.state))
    // console.log(report.steps);
}

function test8(){
    console.log("________________TEST 8______________________")
    var strategy = new AStarStrategy(start, bars, end)
    const secs = measureTime(() => strategy.execute())
    console.log("Time elapsed: " + secs)
    const report = strategy.report()
    console.log(report.stepCount)
    // console.log("total states: " + report.totalStates)
    console.log(report.steps.map(step => step.state))
    // console.log(report.steps);
}

// test1()
// test2()
// test3()
// test4()
// test5();
// test6()
// test7()
test8();