/**
 * Класс VK
 * Управляет изображениями из VK. С помощью VK API.
 * С помощью этого класса будет выполняться загрузка изображений из vk.
 * Имеет свойства ACCESS_TOKEN и lastCallback
 * */
class VK {

  static ACCESS_TOKEN = '958eb5d439726565e9333aa30e50e0f937ee432e927f0dbd541c541887d919a7c56f95c04217915c32008';
  static lastCallback;

  /**
   * Получает изображения
   * @param {string} [id=''] идентификатор пользователя VK
   * @param {Function} callback вызывается с массивом ссылок на самые крупные изображения
   * @param {string} [album='profile'] идентификатор альбома: 'profile' или 'wall'
   * @returns {void}
   * */
  static get(id = '', callback, album = 'profile'){
    this.lastCallback = callback;

    const params = new URLSearchParams({
      owner_id: id,
      album_id: album,
      extended: 1,
      access_token: this.ACCESS_TOKEN,
      v: '5.131',
      callback: 'VK.processData',
    });

    const script = document.createElement('script');
    script.src = `https://api.vk.com/method/photos.get?${params}`;
    script.id = 'vk-request';

    document.body.appendChild(script);
  }

  /**
   * Передаётся в запрос VK API для обработки ответа.
   * Является обработчиком ответа от сервера.
   * @param {Object} result ответ VK API
   * @param {Object} [result.response] данные ответа со списком фотографий в items
   * @param {Object} [result.error] описание ошибки, если запрос не выполнен
   * @returns {void}
   */
  static processData(result){
    const script = document.getElementById('vk-request');
    if (script) {
      script.remove();
    }

    if (result.error) {
      alert(result.error.error_msg);
      return;
    }

    const images = result.response.items
      .filter(item => item.sizes && item.sizes.length)
      .map(item => {
        const sizes = item.sizes;
        const largest = sizes.reduce((max, size) => size.width > max.width ? size : max, sizes[sizes.length - 1]);

        return largest.url;
      });

    if (!images.length) {
      alert('У пользователя нет доступных фотографий');
    }

    this.lastCallback(images);
    this.lastCallback = () => {};
  }
}
