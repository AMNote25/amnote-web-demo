const fetch = require('node-fetch');

exports.handler = async function(event) {
  const url = 'http://118.69.170.50/API' + event.path.replace('/.netlify/functions/proxy', '');
  const method = event.httpMethod;
  const headers = event.headers;
  const body = event.body;

  const response = await fetch(url, {
    method,
    headers,
    body: method === 'GET' ? undefined : body
  });

  const data = await response.text();

  return {
    statusCode: response.status,
    body: data,
    headers: {
      'Content-Type': response.headers.get('content-type')
    }
  };
};