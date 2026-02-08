const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

const options = {
  cert: fs.readFileSync('cert name'),
  key: fs.readFileSync('cert key')
};

app.use(express.static('public'));

https.createServer(options, app).listen(3000, () => {
  console.log('HTTPS server running on https://localhost:3000');
});
