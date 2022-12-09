/*
The purpose of this code is to look for a number in the participants of active conversation channels.
In some situations, a conversation session stays active or inactive rather than closed, resulting in the loss of future messages. 
If you are sending a WhatsApp message and it is not being delivered, use this function to see if a channel is still active.

This function is intended for use with conversations; this code will search the first 1000 conversation channels; 
this may be a limitation because it will only fetch the first 1000 elements; 
you can use a date filter to change the order of the conversations that will appear; 
try using the dates using the last time a message was successfully delivered to your Flex Instance.

The conversation sid will be returned in the output of this function. Use the function in line 63 to update the state to close. By default the function is commented.

Update the variable phoneNumber with the number you would like to search
*/
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = 'number';
const client = require('twilio')(accountSid, authToken);
const conversationsList = [];
let counter = 0;
  // a promise
let promise = new Promise(function (resolve, reject) {
    dmin = new Date('2022-01-17 00:00:00.000');
    dmax = new Date('2022-12-09 23:59:59.000');
    resolve(
        client.conversations.v1.conversations
        .list({limit: 1000})
        .then(conversations => conversations.forEach(c => {
            if (c.dateCreated > dmin && c.dateCreated < dmax && c.state == "active"){
                conversationsList[counter] = c.sid;
                counter++;                 
            }           
        })))
});
async function asyncFunc() {
    // wait until the promise resolves 
    let result = await promise; 
    counter = 0;
    conversationsList.forEach(element => {
    client.conversations.v1.conversations(element)
    .participants
    .list({limit: 1000})
    .then(participants => participants.forEach(p => {
        fetchParticipant(element, p.sid);
        counter++;
    }));                 
    })    
}
async function fetchParticipant(channelsid, participantsid){
    const axios = require('axios');
    const response = await axios.get(`https://conversations.twilio.com/v1/Conversations/${channelsid}/Participants/${participantsid}`, {
        auth: {
            username: accountSid,
            password: authToken
        }
    });
    let newData = JSON.stringify(response.data);
    if(newData.indexOf(phoneNumber) > 0){
        console.log('The conversation ', response.data.conversation_sid), " has the number ", phoneNumber, " in their participants and it is also active";
        console.log(response.data);
        async function fetchConversation(conver){
            const axios = require('axios');
            const response = await axios.get(`https://conversations.twilio.com/v1/Conversations/${conver}`, {
                auth: {
                    username: accountSid,
                    password: authToken
                }
            });
        }
        fetchConversation(response.data.conversation_sid);
        //updating conversation state
        /*
        client.conversations.v1.conversations(response.data.conversation_sid)
        .update({state: 'closed'})
        .then(conversation => console.log(conversation));
        */
        }
}
// calling the async function
asyncFunc();
