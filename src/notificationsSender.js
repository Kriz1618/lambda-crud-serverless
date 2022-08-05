const AWS = require('aws-sdk');
const middy = require('@middy/core');
const jsonBoddyParser = require('@middy/http-json-body-parser');

const sns = new AWS.SNS();

const sendMessage = async (event) => {
    try {
        const { message } = event.body;
        const topic = process.env.TOPIC_ARN;

        const params = {
            Message: message,
            TopicArn: topic,
        };
        
        await sns.publish(params).promise();
        
        return {
            body: 'Mssage was sent!',
            statusCode: 200,
        };        
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
  sendMessage: middy(sendMessage).use(jsonBoddyParser()),
};
