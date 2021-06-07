// import { PythonShell } from 'python-shell';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 8001;
const { PythonShell } = require('python-shell');

// place holder for the data
const users = [];

app.use(bodyParser.json());

app.get('/api/users', (req, res) => {
  console.log('api/users called!!!!');

  let options = {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
  };

  PythonShell.run('final image.py', options, function (err, result) {
    if (err) throw err;
    console.log('First Result : ', result.toString());
  });
  PythonShell.run('final reader.py', options, function (err, result) {
    if (err) throw err;
    console.log('Second Result: ', result.toString());
  });
  res.send('Done. Tata. Khatam. Bbye');
});

app.post('/api/user', (req, res) => {
  const user = req.body.user;
  console.log('Adding user::::::::', user);
  users.push(user);
  res.json('user addedd');
});

app.get('/', (req, res) => {
  res.send('App Works !!!!');
});

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});
