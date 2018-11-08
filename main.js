var fs = require('fs')
var process =require('process')
var RandomStrategy =  require('./strategy').RandomStrategy

if(process.argv.length < 3) {
    console.log("no input file path")   
    process.exit(0)
}
var input = String(fs.readFileSync(process.argv[2]))
var inputObj = JSON.parse(input)





var initialState = inputObj.initialState
var finalState = inputObj.finalState
var bars = inputObj.bars;


var totalSteps = 0;
var min = -1
var max = -1

var min_no_roll = -1
var max_no_roll = -1
var totalRolls = 0
var totalRollAmount = 0
var minSteps = []
var tests = 10
var start = new Date().getTime()
for(var i=0; i<tests; i++){
    var coolStrat = new RandomStrategy(initialState.slice(0), bars, finalState) 
    coolStrat.execute()
    var report = coolStrat.report()
    var steps = report.stepCount 
    totalSteps += steps
    
    totalRollAmount += report.rollsAmount
    totalRolls += report.rollsCount
    var cleanSteps = steps - report.rollsAmount
    if(min_no_roll == -1 || cleanSteps < min_no_roll){
        min_no_roll = cleanSteps
    }
    if(max_no_roll == -1 || cleanSteps > max_no_roll){
        max_no_roll = cleanSteps
    }
    if(max==-1 || steps > max)
        max = steps
    if(min == -1 || steps < min){
        min = steps
        minSteps = coolStrat.report().steps
    }
    
}
var average = totalSteps / tests
var avg_no_rolls = (totalSteps - totalRollAmount) / tests
var avg_dead_end = totalRolls / tests
var averageTime = (new Date().getTime() - start) / tests
console.log("Average steps = " + average)
console.log("Average steps (without rollbacks) = " + avg_no_rolls)
console.log("Average dead ends = " + avg_dead_end)

console.log("Min = " + min)
console.log("Max = " + max) 
console.log("Min (steps without rolls) = " + min_no_roll)
console.log("Max (steps without rolls) = " + max_no_roll) 
console.log("Average time = " + (averageTime / 1000) + " seconds") 

fs.writeFileSync('output.json', JSON.stringify({
    steps: minSteps
}, null, 2))