/**
 * Основная функция для совершения запросов по Yandex API.
 * @param {Object} [options={}] настройки запроса
 * @param {string} [options.method='GET'] HTTP метод запроса
 * @param {string} [options.url=''] адрес запроса
 * @param {Object} [options.headers={}] заголовки запроса
 * @param {Object} [options.data={}] данные, которые передаются в строке адреса
 * @param {Function} [options.callback] обработчик ответа, вызывается с аргументами (err, response)
 * @returns {void}
 * */
const createRequest = (options = {}) => {
  const { method = 'GET', url = '', headers = {}, data = {}, callback = () => {} } = options;

  const xhr = new XMLHttpRequest;
  xhr.responseType = 'json';

  const params = new URLSearchParams(data).toString();
  const requestUrl = params ? `${url}?${params}` : url;

  xhr.addEventListener('load', () => {
    if (xhr.status >= 400) {
      callback(xhr.response && xhr.response.message ? xhr.response.message : xhr.statusText, xhr.response);
      return;
    }

    callback(null, xhr.response);
  });

  xhr.addEventListener('error', () => callback('Ошибка сети', null));

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
