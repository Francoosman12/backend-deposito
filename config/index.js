const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

const bigQueryClient = new BigQuery({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  projectId: process.env.PROJECT_ID,
  location: 'US'
});

module.exports = {
  bigQueryClient
};
