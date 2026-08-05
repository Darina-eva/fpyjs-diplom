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
   * */
  static get(id = '', callback){
    this.lastCallback = callback;

    const params = new URLSearchParams({
      owner_id: id,
      album_id: 'profile',
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

    const images = result.response.items.map(item => {
      const largest = item.sizes.reduce((max, size) => size.width > max.width ? size : max);
      return largest.url;
    });

    this.lastCallback(images);
    this.lastCallback = () => {};
  }
}
