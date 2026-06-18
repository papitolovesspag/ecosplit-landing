const http = require('http');
http.get('http://127.0.0.1:3000/', res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Includes EcoSplit:', body.includes('EcoSplit'));
    console.log('Includes ecosplit:', body.toLowerCase().includes('ecosplit'));
    console.log('Full body length:', body.length);
    console.log('Title tag:', body.match(/<title>([\s\S]*?)<\/title>/));
  });
}).on('error', err => console.error(err));
