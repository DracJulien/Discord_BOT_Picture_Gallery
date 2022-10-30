import { Client } from "discord.js";
const {token} = require('./config.json');
const lGoogleApiCredentials = require('./raccoon.json');
const lGoogleApiScope = ['https://www.googleapis.com/auth/drive'];
const {google} = require('googleapis');
const lAuth = new google.auth.JWT(
    lGoogleApiCredentials.client_email, null,
    lGoogleApiCredentials.private_key, lGoogleApiScope
  );
const lDrive = google.drive({ version: "v3", auth:lAuth});
const lClient = new Client({ 
    intents: 37377 // permissions
});
const lFiles:any[] = [];


fillRaccoonPick(lFiles,lDrive);
setInterval(reloadPick,3600000,lFiles,lDrive);

lClient.once('ready', () => {
    console.log('Ready!');

    lClient.on('messageCreate', lMessage => {
        
        if(!lMessage.reference && lMessage.content == "!raccoon"){
            console.log("console.log",lFiles); 
            const lRandomFile = lFiles[Math.floor(Math.random()*(lFiles.length-1))];
            lMessage.reply("https://drive.google.com/uc?id="+lRandomFile.id);
        }
    });
});

lClient.login(token); //connexion

//yarn add -D @types/node ts-node typescript

function fillRaccoonPick(pFiles:any[], pDrive:any, pNextPageToken?:string){
    pDrive.files.list({q:"mimeType != 'application/vnd.google-apps.folder'",
        pageSize:1000,
        pageToken:pNextPageToken,
        fields: "files/id,files/mimeType"}, (pError:any, pRes:any) => {
        if(pError){
            console.log(pError);
        }else{
            let lData:any = pRes.data;
            const lNextPageToken = lData.nextPageToken;
            const lFiles = lData.files;
            if(lFiles){
                lFiles.forEach((lFile:any)=>{
                    pFiles.push(lFile);
                });
            }
            if(lNextPageToken){
                fillRaccoonPick(pFiles, pDrive, lNextPageToken);
            }
        }
    });
}

function reloadPick(pFiles:any[],pDrive:any){
    pFiles.splice(0, pFiles.length);
    fillRaccoonPick(pFiles, pDrive);
}