/**
 * Класс SearchBlock
 * Используется для взаимодействием со строкой ввода и поиска изображений
 * */
class SearchBlock {
  /**
   * @param {HTMLElement} element блок с полем ввода id, выбором альбома и кнопками поиска
   */
  constructor( element ) {
    this.element = element;
    this.registerEvents();
  }

  /**
   * Выполняет подписку на кнопки "Заменить" и "Добавить"
   * Клик по кнопкам выполняет запрос на получение изображений и отрисовывает их,
   * только клик по кнопке "Заменить" перед отрисовкой очищает все отрисованные ранее изображения
   * @returns {void}
   */
  registerEvents(){
    this.element.addEventListener('click', event => {
      const button = event.target.closest('.replace, .add');

      if (!button) {
        return;
      }

      const input = this.element.querySelector('input');
      const id = input.value.trim();

      if (!id) {
        return;
      }

      const isReplace = button.classList.contains('replace');
      const album = this.element.querySelector('.album-select').value;

      VK.get(id, images => {
        if (isReplace) {
          App.imageViewer.clear();
        }

        App.imageViewer.drawImages(images);
      }, album);
    });
  }

}
