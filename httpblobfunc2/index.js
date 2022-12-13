var XmlSplit = require('./xmlsplitter.js')
var xmldocs = [];
var no_of_docs = 0;
module.exports = async function (context, req) {
    
    //xmldocs.push('A');
    context.log('JavaScript HTTP trigger function processed a request.');

    const { BlobServiceClient } = require("@azure/storage-blob");
    // Load the .env file if it exists
    require("dotenv").config();
    const AZURE_STORAGE_CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING || "";

    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient('test');
    const blobname = '20210127_RETAILER-COMBINED-SETTL-DOC_20220825162152.xml';
    //const blobname = 'shortxml.xml'
    const blockBlobClient = containerClient.getBlockBlobClient(blobname);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const xmldata = await streamToText(downloadBlockBlobResponse.readableStreamBody);
    var Readable = require('stream').Readable
    var s = new Readable()
    s.push(xmldata)    // the string you want
    s.push(null) 
    
    
    var data = await returnhtml(s);
    console.log('Done');
    //console.log(xmldocs);
    console.log(xmldocs.length);
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = AZURE_STORAGE_CONNECTION_STRING;

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: no_of_docs
    };
}

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
