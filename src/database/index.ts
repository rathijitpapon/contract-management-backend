import AWS from 'aws-sdk';

const options = {
  region: 'local',
  endpoint: 'http://localhost:8000',
  AWS_ACCESS_KEY_ID: 'rathijit',
  AWS_SECRET_ACCESS_KEY: 'rathijit',
};


const client = new AWS.DynamoDB.DocumentClient(options);

export default client;