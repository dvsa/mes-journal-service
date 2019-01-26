import { spawn, ChildProcess } from 'child_process';

let slsOfflineProcess: ChildProcess;

export const startSlsOffline = (done: any) => {
  slsOfflineProcess = spawn('npx', ['sls', 'offline', 'start']);

  console.log(`Serverless: Offline started with PID : ${slsOfflineProcess.pid}`);

  slsOfflineProcess.stdout.on('data', (data) => {
    if (data.includes('Offline listening on')) {
      console.log(data.toString().trim());
      done();
    }
  });

  slsOfflineProcess.stderr.on('data', (errData) => {
    console.log(`Error starting Serverless Offline:\n${errData}`);
    done(errData);
  });
};

export const stopSlsOffline = () => {
  slsOfflineProcess.kill();
  console.log('Serverless Offline stopped');
};
