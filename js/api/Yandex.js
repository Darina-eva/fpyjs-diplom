/**
 * Класс Yandex
 * Используется для управления облаком.
 * Имеет свойство HOST
 * */
class Yandex {
  static HOST = 'https://cloud-api.yandex.net/v1/disk';

  /**
   * Метод формирования и сохранения токена для Yandex API
   */
  static getToken(){
    let token = localStorage.getItem('yandexToken');

    if (!token) {
      token = prompt('Введите токен для доступа к Yandex API');
      localStorage.setItem('yandexToken', token);
    }

    return token;
  }

  /**
   * Метод загрузки файла в облако
   */
  static uploadFile(path, url, callback){
    createRequest({
      method: 'POST',
      url: `${this.HOST}/resources/upload`,
      headers: {
        Authorization: `OAuth ${this.getToken()}`,
      },
      data: { path, url },
      callback,
    });
  }

  /**
   * Метод удаления файла из облака
   */
  static removeFile(path, callback){
    createRequest({
      method: 'DELETE',
      url: `${this.HOST}/resources`,
      headers: {
        Authorization: `OAuth ${this.getToken()}`,
      },
      data: { path },
      callback,
    });
  }

  /**
   * Метод получения всех загруженных файлов в облаке
   */
  static getUploadedFiles(callback){
    createRequest({
      method: 'GET',
      url: `${this.HOST}/resources/files`,
      headers: {
        Authorization: `OAuth ${this.getToken()}`,
      },
      callback,
    });
  }

  /**
   * Метод получения содержимого папки в облаке
   */
  static getResources(path, callback){
    createRequest({
      method: 'GET',
      url: `${this.HOST}/resources`,
      headers: {
        Authorization: `OAuth ${this.getToken()}`,
      },
      data: { path, limit: 1000 },
      callback,
    });
  }

  /**
   * Метод получения всех папок в корне облака
   */
  static getFolders(callback){
    this.getResources('disk:/', callback);
  }

  /**
   * Метод скачивания файлов
   */
  static downloadFileByUrl(url){
    const link = document.createElement('a');
    link.href = url;
    link.click();
  }
}
