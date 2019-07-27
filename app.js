const express = require('express');
const path = require('path');
const workingDir = path.resolve('../../test/auto_push_test');
const app = express();
const git = require('simple-git')(workingDir);
const dockerCompose = require('docker-compose');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(`Target directory -> ${workingDir}`);

app.use('/github/push', (req, res) => {
  git.pull((err, update) => {
    if (err) {
      return console.error(err);
    }
    if (update && update.summary.changes) {
      dockerCompose.upAll({ cwd: workingDir, log: true })
        .then(() => {
          console.log('done')
        }, console.error)
    }
  });
  res.sendStatus(200);
});

app.listen(8080, () => {
  console.log('docker webhook started.')
});
