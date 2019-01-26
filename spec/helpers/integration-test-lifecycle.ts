import { spawn, ChildProcess } from 'child_process';

let slsOfflineProcess: ChildProcess;

export const startSlsOffline = (done: any) => {
  // Spawn sls as detached so it leads the process group and kills DynamoDB when it gets SIGINT
  slsOfflineProcess = spawn('npm', ['start'], { detached: true });
  slsOfflineProcess.stdout.pipe(process.stdout);

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
  process.kill(-slsOfflineProcess.pid);
  console.log('Serverless Offline stopped');
};
