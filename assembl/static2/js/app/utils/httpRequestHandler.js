import urljoin from 'url-join';
import Cookies from 'js-cookie';

import { getCSRFToken } from './csrf';
import { basePathV2 } from './server';

const convertToURLEncodedString = obj =>
  Object.keys(obj)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&');
const getResponseContentType = xhr =>
  // eslint-disable-line no-unused-vars
  xhr.getResponseHeader('Content-Type').split(';')[0];

const useCSRFProtection = document.getElementById('useCSRFProtection') ? document.getElementById('useCSRFProtection').value : 'false';

/*
  A global async method that returns a Promisified ajax call
  @params payload [Object] The object that will be sent
  @params isJson [Boolean] Pass a flag if the object is JSON. Default is form header.
  @retuns [Promise]
*/

export const xmlHttpRequest = obj =>
  new Promise(async (resolve, reject) => {
    let payload = obj.payload;
    obj.headers = obj.headers || {}; // eslint-disable-line

    const xhr = new XMLHttpRequest();

    if (obj.method.toLowerCase() === 'post') {
      // Go and fetch a CSRF token for the POST request if activated
      if (useCSRFProtection === 'true') {
        await getCSRFToken();
        obj.headers['X-XSRF-TOKEN'] = Cookies.get('_csrf'); // eslint-disable-line
      }
    }

    if (obj.isJson && obj.isJson === true) {
      obj.headers['Content-Type'] = 'application/json'; // eslint-disable-line
      payload = JSON.stringify(obj.payload);
    } else {
      obj.headers['Content-Type'] = 'application/x-www-form-urlencoded'; // eslint-disable-line
      if (payload) {
        payload = convertToURLEncodedString(payload);
      }
    }

    const url = urljoin(basePathV2(obj), obj.url);
    xhr.open(obj.method, url);
    if (obj.headers) {
      Object.keys(obj.headers).forEach((key) => {
        xhr.setRequestHeader(key, obj.headers[key]);
      });
    }
    xhr.onload = () => {
      let resp;
      if (xhr.status >= 200 && xhr.status < 300) {
        resp = xhr.response;
        try {
          resp = JSON.parse(resp);
        } catch (e) {
          // TODO: Remove console warn AFTER a successful contract is agreed upon
          console.warn('A successful response did not return JSON. Passing status only.'); // eslint-disable-line
          resp = xhr.status;
        }
        resolve(resp);
      } else {
        // Contract agreed upon. If API is to fail, must respond with
        // JSONError type. Front-end respects this type of response only.
        const respType = getResponseContentType(xhr);
        if (respType === 'application/json') {
          resp = JSON.parse(xhr.responseText);
        } else {
          resp = [{ type: 'nonJson', message: '', status: xhr.status }];
        }
        reject(resp);
      }
    };
    xhr.onerror = () =>
      // Network level failure
      reject(xhr.statusText || xhr.responseText);
    xhr.send(payload);
  });

export const fetchContentType = url =>
  fetch(url, {
    method: 'HEAD'
  }).then(response => response.headers.get('Content-Type'), () => null);