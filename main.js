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
for(var i=0; i<100; i++){
    var coolStrat = new RandomStrategy(initialState, bars, finalState) 
    coolStrat.execute()

    var steps = coolStrat.report().stepCount
    totalSteps += steps
    if(max==-1 || steps > max)
        max = steps
    if(min == -1 || steps < min)
        min = steps

}
var average = totalSteps / 100
console.log("Average = " + average)
console.log("Min = " + min)
console.log("Max = " + max)

// fs.writeFileSync('output.json', JSON.stringify({
//     coolStrat
// }, null, 2))