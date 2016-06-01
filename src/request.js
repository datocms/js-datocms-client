import ApiException from './ApiException';

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const request = function request(url, options = {}) {
  const fullHeaders = Object.assign({}, defaultHeaders, options.headers);
  const fullOptions = Object.assign({}, options, { headers: fullHeaders });

  return fetch(url, fullOptions)
    .then(res => {
      if (res.status !== 204) {
        return res.json().then(body => [res, body]);
      }
      return Promise.resolve([res, null]);
    })
    .then(([res, body]) => {
      if (res.status >= 200 && res.status < 300) {
        return Promise.resolve(body);
      }
      return Promise.reject(new ApiException(res, body));
    });
};

export const get = function get(url, options = {}) {
  return request(url, options);
};

export const post = function post(url, body, options = {}) {
  return request(
    url,
    Object.assign(
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      options
    )
  );
};

export const put = function put(url, body, options = {}) {
  return request(
    url,
    Object.assign(
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      options
    )
  );
};

export const destroy = function destroy(url, options = {}) {
  return request(
    url,
    Object.assign({ method: 'DELETE' }, options)
  );
};
