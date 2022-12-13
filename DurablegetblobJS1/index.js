/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 * 
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */
var XmlSplit = require('./xmlsplitter.js')
var xmldocs = [];
module.exports = async function (context) {
    const { BlobServiceClient } = require("@azure/storage-blob");
    // Load the .env file if it exists
    require("dotenv").config();
    const AZURE_STORAGE_CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING || "";

    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient('test');
    const blobname = process.env.BLOB_NAME || "";
    //var blobname = '20210127_RETAILER-COMBINED-SETTL-DOC_20220825162152.xml';
    //blobname = 'shortxml.xml';
    const blockBlobClient = containerClient.getBlockBlobClient(blobname);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const xmldata = await streamToText(downloadBlockBlobResponse.readableStreamBody);
    
    var Readable = require('stream').Readable
    var s = new Readable()
    s.push(xmldata)    // the string you want
    s.push(null) 
    //console.log(xmldata);  
    //return `Hello ${context.bindings.name}!`;
    var data = await returnhtml(s);

          //console.log(xmldocs);
      //no_of_docs = no_of_docs + 1;
      //console.log(no_of_docs);  
//console.log(xmldocs);
//context.done(xmldocs);
return xmldocs;
};

async function streamToText(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
      data += chunk;
    }
    return data;
  }

async function returnhtml(s){
    return new Promise((resolve) =>{
    var xmlsplit = new XmlSplit()
    s.pipe(xmlsplit).on('data', function(data, no_of_docs) {
      var xmlDocument = data.toString()
      xmldocs.push(xmlDocument);
      //console.log(xmldocs);
      //xmldocs.push('B');
      no_of_docs = no_of_docs + 1;
      //console.log(no_of_docs);
      resolve(no_of_docs);
    });  
});}