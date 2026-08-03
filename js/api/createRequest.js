/**
 * Основная функция для совершения запросов по Yandex API.
 * */
const createRequest = (options = {}) => {
  const { method = 'GET', url = '', headers = {}, data = {}, callback = () => {} } = options;

  const xhr = new XMLHttpRequest;
  xhr.responseType = 'json';

  const params = new URLSearchParams(data).toString();
  const requestUrl = params ? `${url}?${params}` : url;

  xhr.addEventListener('load', () => callback(null, xhr.response));
  xhr.addEventListener('error', () => callback(xhr.statusText, null));

  try {
    xhr.open(method, requestUrl);

    for (const [name, value] of Object.entries(headers)) {
      xhr.setRequestHeader(name, value);
    }

    xhr.send();
  }
  catch (err) {
    console.error(err);
  }
};
