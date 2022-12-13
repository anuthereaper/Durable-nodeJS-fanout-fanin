/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 * 
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your 
 *    function app in Kudu
 */

const df = require("durable-functions");
//const fs = require('fs')

module.exports = df.orchestrator(function* (context) {
    

    //const xmldata = context.df.getInput();
    //console.log("Here I am : ");
    //console.log(xmldata);
    var xmldata = yield context.df.callActivity("DurablegetblobJS1","");
    //console.log('Data from Orchestrator :' + xmldata);
    const outputs = [];
    var no_of_docs = 0
    for (const file of xmldata) {
        outputs.push(yield context.df.callActivity("Durableactivityjs1", file));
        no_of_docs = no_of_docs + 1;
    }
    console.log(no_of_docs);
    // Replace "Hello" with the name of your Durable Activity Function.
    //outputs.push(yield context.df.callActivity("Durableactivityjs1", "Tokyo"));
    //outputs.push(yield context.df.callActivity("Durableactivityjs1", "Seattle"));
    //outputs.push(yield context.df.callActivity("Durableactivityjs1", "London"));

    // returns ["Hello Tokyo!", "Hello Seattle!", "Hello London!"]
    return outputs;
});