import fetch from 'isomorphic-fetch';

export default function fetchWithProxy(url, options) {
  const instanceOptions = { ...options };

  if (!instanceOptions.agent && process.env.HTTPS_PROXY) {
    // eslint-disable-next-line global-require
    const HttpsProxyAgent = require('https-proxy-agent');
    instanceOptions.agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
  }

  return fetch(url, instanceOptions);
}
