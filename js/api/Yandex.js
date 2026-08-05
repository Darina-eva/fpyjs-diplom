/**
 * Класс Yandex
 * Используется для управления облаком.
 * Имеет свойство HOST
 * */
class Yandex {
  static HOST = 'https://cloud-api.yandex.net/v1/disk';

  /**
   * Метод формирования и сохранения токена для Yandex API
   * @returns {string|null} токен из локального хранилища или null, если пользователь его не ввёл
   */
  static getToken(){
    let token = localStorage.getItem('yandexToken');

    if (!token) {
      token = prompt('Введите токен для доступа к Yandex API');

      if (!token) {
        return null;
      }

      localStorage.setItem('yandexToken', token);
    }

    return token;
  }

  /**
   * Оборачивает колбек для вывода ошибок запроса
   * @param {string} message текст, который выводится перед описанием ошибки
   * @param {Function} callback колбек, вызываемый после вывода сообщения
   * @returns {Function} обработчик ответа для передачи в createRequest
   */
  static handleErrors(message, callback){
    return (err, response) => {
      if (err) {
        alert(`${message}: ${err}`);
      }

      callback(err, response);
    };
  }

  /**
   * Метод загрузки файла в облако
   * @param {string} path путь на диске, по которому сохраняется файл
   * @param {string} url ссылка на загружаемое изображение
   * @param {Function} callback вызывается с аргументами (err, response)
   * @returns {void}
   */
  static uploadFile(path, url, callback){
    const token = this.getToken();

    if (!token) {
      callback('Токен не получен', null);
      return;
    }

    createRequest({
      method: 'POST',
      url: `${this.HOST}/resources/upload`,
      headers: {
        Authorization: `OAuth ${token}`,
      },
      data: { path, url },
      callback: this.handleErrors('Ошибка загрузки файла', callback),
    });
  }

  /**
   * Метод удаления файла из облака
   * @param {string} path путь к удаляемому файлу на диске
   * @param {Function} callback вызывается с аргументами (err, response), при успехе response равен null
   * @returns {void}
   */
  static removeFile(path, callback){
    const token = this.getToken();

    if (!token) {
      callback('Токен не получен', null);
      return;
    }

    createRequest({
      method: 'DELETE',
      url: `${this.HOST}/resources`,
      headers: {
        Authorization: `OAuth ${token}`,
      },
      data: { path },
      callback: this.handleErrors('Ошибка удаления файла', callback),
    });
  }

  /**
   * Метод получения всех загруженных файлов в облаке
   * @param {Function} callback вызывается с аргументами (err, response), где response содержит массив items
   * @returns {void}
   */
  static getUploadedFiles(callback){
    const token = this.getToken();

    if (!token) {
      callback('Токен не получен', null);
      return;
    }

    createRequest({
      method: 'GET',
      url: `${this.HOST}/resources/files`,
      headers: {
        Authorization: `OAuth ${token}`,
      },
      callback: this.handleErrors('Ошибка получения файлов', callback),
    });
  }

  /**
   * Метод получения содержимого папки в облаке
   * @param {string} path путь к папке, например 'disk:/' или 'disk:/TESTING'
   * @param {Function} callback вызывается с аргументами (err, response), содержимое папки лежит в response._embedded.items
   * @returns {void}
   */
  static getResources(path, callback){
    const token = this.getToken();

    if (!token) {
      callback('Токен не получен', null);
      return;
    }

    createRequest({
      method: 'GET',
      url: `${this.HOST}/resources`,
      headers: {
        Authorization: `OAuth ${token}`,
      },
      data: { path, limit: 1000 },
      callback: this.handleErrors('Ошибка получения содержимого папки', callback),
    });
  }

  /**
   * Метод получения всех папок в корне облака
   * @param {Function} callback вызывается с аргументами (err, response)
   * @returns {void}
   */
  static getFolders(callback){
    this.getResources('disk:/', callback);
  }

  /**
   * Метод скачивания файлов
   * @param {string} url ссылка на скачиваемый файл
   * @returns {void}
   */
  static downloadFileByUrl(url){
    const link = document.createElement('a');
    link.href = url;
    link.click();
  }
}
