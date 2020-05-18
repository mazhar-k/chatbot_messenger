var express=require('express');
var bodyParser=require('body-parser');
var app=express();
const request=require('request');
app.use(bodyParser.json());

app.get('/',function(req,res){
    const hubchallenge = req.query['hub.challenge'];
    const hubmode = req.query['hub.mode'];
    const VerifyTokenMatches = (req.query['hub.verify_token']==='ChatbotToken');
    if (hubmode && VerifyTokenMatches) {
      res.status(200).send(hubchallenge);
    
    } else {
      res.sendStatus(403).end;      
    }
});

app.post('/',function(req,res){

  let body= req.body;
  console.log(body);
  if(body.object==='page'){
    body.entry.forEach(function(entry){
      let webhook_event= entry.messaging[0];
      console.log(webhook_event);
      let sender_psid=webhook_event.sender.id;
      console.log(sender_psid);
      if(webhook_event.message){
        handleMessage(sender_psid,webhook_event.message);
      }else if(webhook_event.postback){
        handlePostback(sender_psid,webhook_event.postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  }else{
    res.status(404);
  }
 });
 //handles message events
 function handleMessage(sender_psid,received_message){
   let response;
   if(received_message.text){
     response={
       "text":'you sent the message: ' +received_message.text + '. now send me an image!'
     }
    }
   else if(received_message.attachments){
     let attachment_url=received_message.attachments[0].payload.url;
  response = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Is this the right picture?",
          "subtitle": "Tap a button to answer.",
          "image_url": attachment_url,
          "buttons": [
            {
              "type": "postback",
              "title": "Yes!",
              "payload": "yes",
            },
            {
              "type": "postback",
              "title": "No!",
              "payload": "no",
            }
          ],
        }]
      }
    }
  }
}
// Send the response message
   callSendAPI(sender_psid,response);
}
//handles messaging_postback events
function handlePostback(sender_psid,received_postback){
   let response;
   let payload=received_postback.payload;
   if(payload==='yes'){
     response={"text":"thanks!"}
}else if(payload==='no'){
  response={"text":"oops,try sending another image"}
}
callSendAPI(sender_psid,response);
}
//handles response message via send API of facebook
function callSendAPI(sender_psid,response){
   let request_body={
     "recipient":{
       "id":sender_psid
     },
     "message": response
   }
   // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": 'EAAFRByAEf6cBAFfLXZBDgDZALDyZAaOsCJKkFuocOqfJ7hRnqPM6g2elAUZADaaBugHvEu7TIEkZC5qZCYdvjrc7WeBaCzmrJyaxLzeZAiv76fYA25ZBwQEBqwnLfbmDlmtodqBtGZABYxA5sL2Vdb3C5DbAcaeoQZCyxyPHsS6ewTX3xZBQWnFFtNM'},
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log(body);
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}
 
 app.patch('/detailspatch',function(req,res){
    res.send(req.body);
 });
 app.put('/detailsput',function(req,res){
    res.send(req.body);
 });
app.listen(8200,function(){
    console.log('example app listening on port 8200!');
});