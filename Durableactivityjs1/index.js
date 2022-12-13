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
//const { parseMailTemplate } = require("./parseMailTemplate");
var fs = require('fs');
var xml2js       = require('xml2js');
var html_to_pdf = require('html-pdf-node');
var parser       = new xml2js.Parser();
//var pdf = require('html-pdf');
//var html = fs.readFileSync('./files/input/comb_template.html', 'utf8');
//var options = { format: 'Letter' };

module.exports = async function (context) {
    console.log("Hello from activity :")
    var xmldict = {}
    var xmltext = context.bindings.name;
    
    //Extract the nodes and attributes
    metadata(xmltext,xmldict);
    report(xmltext,xmldict);
    context.log(xmldict)
    
    const { BlobServiceClient } = require("@azure/storage-blob");
    // Load the .env file if it exists
    require("dotenv").config();
    const AZURE_STORAGE_CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING || "";
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient('test');
    var blobname = 'comb_template.html';
    const blockBlobClient = containerClient.getBlockBlobClient(blobname);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const html_template = await streamToText(downloadBlockBlobResponse.readableStreamBody);

    let options = { format: 'A4'};
    let file = { content: html_template};
    //const x = await writepdf(file, options,blobServiceClient,xmldict)
    const x = await writepdf1(file, options,blobServiceClient,xmldict)
    //html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
    //    context.log("PDF Buffer start:-", pdfBuffer);
     //   const targetblob = xmldict['OU'] + '_' + xmldict['ReportName'] + '_' + xmldict['DocumentID'] + '_' + '.pdf';
     //   const blockBlobClient_t = containerClient.getBlockBlobClient(targetblob);
     //   const uploadBlobResponse =  blockBlobClient_t.upload(pdfBuffer, pdfBuffer.length);
     // });
    
    

    return `Hello ${context.bindings.name}!`;
   
};

async function writepdf1(file, options,blobServiceClient,xmldict){
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);
    const containerClient = blobServiceClient.getContainerClient('test2');
    const targetblob = xmldict['OU'] + '/' + xmldict['ReportName'] + '/' + xmldict['OU'] + '_' + xmldict['ReportName'] + '_' + xmldict['DocumentID'] + '_' + '.pdf';
    console.log(pdfBuffer);
    console.log('Blob name :' + targetblob);
    console.log('PDF :' + pdfBuffer.length);
    const blockBlobClient_t = containerClient.getBlockBlobClient(targetblob);
    //await blockBlobClient_t.uploadStream(pdfBuffer);
    const uploadBlobResponse =  await blockBlobClient_t.upload(pdfBuffer, pdfBuffer.length);
    console.log(uploadBlobResponse)
}


async function writepdf(file, options,blobServiceClient,xmldict){
    html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
        //context.log("PDF Buffer start:-", pdfBuffer);
        const containerClient = blobServiceClient.getContainerClient('test2');
        const targetblob = xmldict['OU'] + '/' + xmldict['ReportName'] + '/' + xmldict['OU'] + '_' + xmldict['ReportName'] + '_' + xmldict['DocumentID'] + '_' + '.pdf';
        console.log('Blob name :' + targetblob)
        console.log('PDF :' + pdfBuffer.length)
        const blockBlobClient_t = containerClient.getBlockBlobClient(targetblob);
        const uploadBlobResponse =  blockBlobClient_t.upload(pdfBuffer, pdfBuffer.length);
      });
}

//const html = '<html lang="es"><head><meta charset="utf-8"><title>Email Verification</title></head><body><h1>Hey, {{ name }}</h1><p>You have just created an account on <strong>{{ company }}</strong>. Please click the following <a href="{{ link }}" target="_blank">link</a> so you can start using your account.</p></body></html>';
//const data = {
//  name: "Jhon Doe",
//  company: "My awesome company",
//  link: "http://example.com"
//};
//parseMailTemplate(html, xmdict, (error, parsedHtml) => {
//    if (error) console.log(error);
//    console.log(parsedHtml);  
//    // Do whatever you want with your parsed tamplate
//});

//Create PDF
//pdf.create(html, options).toFile('./files/output/output3.pdf', function(err, res) {
//    if (err) return console.log(err);
//    console.log(res); // { filename: '/app/businesscard.pdf' }
//  });
async function streamToText(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
      data += chunk;
    }
    return data;
  }

function metadata(xmltext,xmldict){
    parser.parseString(xmltext, function (err, result) {
        var test1 = result['HPDPSMsg']['DocumentRequest'][0]['MetaData'][0];   //{ root: [ 'Root Element' ] }
        //console.log(test1)
        //console.log(Object.keys(test1).length)
        Object.entries(test1).forEach(([key, value]) => {
            //console.log(key + ':' + value[0]);
            xmldict[key] = value[0];
         });
    });
    }

function report(xmltext,xmldict){
        parser.parseString(xmltext, function (err, result) {
            var test2 = result['HPDPSMsg']['DocumentRequest'][0]['Report'][0]['$'];   
            //console.log(test2)
            //console.log(Object.keys(test1).length)
            Object.entries(test2).forEach(([key, value]) => {
                //console.log(key + ':' + value);
                xmldict[key] = value;
             });
        });
    }