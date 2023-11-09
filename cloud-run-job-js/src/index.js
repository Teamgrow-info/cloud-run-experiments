'use strict';

const {GoogleAuth} = require('google-auth-library');
const {JobsClient} = require('@google-cloud/run').v2;

const projectId = 'cloudrun-experiments-401514';
const location  = 'europe-west1'

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
  projectId: projectId,
});

console.log(auth);

const parent = 'projects/' + projectId + '/locations/'  + location
const database = projectId + ':' + location + ':instance-id'

const job = {
  template: {
    template: {
      containers: [{
        name: "tralala-container",
        image: "hello-world",
        volumeMounts: [
          {
            name: "cloudsql",
            mountPath: '/cloudsql'  // !!!!! DON'T CHANGE
          }
        ],
      }],
      volumes: [
        {
          name: "cloudsql",
          cloudSqlInstance: {
            instances: [
              database
            ]
          },
        }
      ],
    },
  },
}

const jobId = 'abc123'

const name = parent + '/jobs/' + jobId

const validateOnly = true

// Instantiates a client
const runClient = new JobsClient();

async function callCreateJob() {
  const request = {
    parent,
    job,
    jobId,
  };

  const [operation] = await runClient.createJob(request);
  const [response] = await operation.promise();
  console.log(response);
  
}

async function callRunJob() {
  // Construct request
  const request = {
    name
  };

  // Run request
  const [operation] = await runClient.runJob(request);
  const [response] = await operation.promise();
  console.log(response);
}

async function main() {
  await callCreateJob();
  await callRunJob();
}

main()