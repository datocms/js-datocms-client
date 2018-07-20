import fetch from 'isomorphic-fetch';
import HttpsProxyAgent from 'https-proxy-agent';

export default function fetchWithProxy(url, options) {
  const instanceOptions = Object.assign({}, options);

  if (!instanceOptions.agent && process.env.HTTPS_PROXY) {
    instanceOptions.agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
  }

  return fetch(url, instanceOptions);
}
