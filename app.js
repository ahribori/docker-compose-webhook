const express = require('express');
const config = require('./config');
const workingDir = config.workingDir;
const app = express();
const git = require('simple-git')(workingDir);
const dockerCompose = require('docker-compose');
const dockerCLI = require('docker-cli-js');
const Docker = dockerCLI.Docker;
const docker = new Docker();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(`Working directory -> ${workingDir}`);

app.post('/github/push', (req, res) => {
  git.pull((err, update) => {
    if (err) {
      return console.error(err);
    }
    if (update && update.summary.changes) {
      dockerCompose.upAll({ cwd: workingDir, log: true, commandOptions: ['--build'] })
        .then(() => {
          console.log('done')
        }, console.error)
    }
  });
  res.sendStatus(200);
});

app.post('/bitbucket/push', (req, res) => {
  git.pull((err, update) => {
    if (err) {
      return console.error(err);
    }
    if (update && update.summary.changes) {
      dockerCompose.upAll({ cwd: workingDir, log: true, commandOptions: ['--build'] })
        .then(() => docker.command('image prune -f'))
        .then(() => {
          console.log('Done')
        })
        .catch(console.error)
    }
  });
  res.sendStatus(200);
});

app.listen(config.port, () => {
  console.log('docker webhook started.', config.port);
});
