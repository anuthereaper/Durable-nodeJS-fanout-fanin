var XmlSplit = require('./xmlsplitter.js')
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
var DomParser = require('dom-parser');
var xmldocs = [];
module.exports = async function (context, req) {
    
    xmldocs.push('A');
    context.log('JavaScript HTTP trigger function processed a request.');

    const { BlobServiceClient } = require("@azure/storage-blob");
    // Load the .env file if it exists
    require("dotenv").config();
    const AZURE_STORAGE_CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING || "";

    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient('test');
    var blobname = '20210127_RETAILER-COMBINED-SETTL-DOC_20220825162152.xml';
    blobname = 'shortxml.xml';
    const blockBlobClient = containerClient.getBlockBlobClient(blobname);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const xmldata = await streamToText(downloadBlockBlobResponse.readableStreamBody);
    //context.log(xmldata)
    var parser = new DomParser();
    xmlDoc = parser.parseFromString(xmldata,"text/xml");

    context.log(xmlDoc.getElementsByTagName("DocumentRequest"))

    //var  el = xmlDoc.getElementsByTagName('Document'),        
    //ch =  el[0].children;
    //for (let e=0; e<ch.length; e++) {           
     //       context.log(ch[e].tagName + ":" + ch[e].getAttribute);
    // }


    var Readable = require('stream').Readable
    var s = new Readable()
    const responseMessage = AZURE_STORAGE_CONNECTION_STRING;

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: xmldocs
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