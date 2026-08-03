/**
 * Класс ImageViewer
 * Используется для взаимодействием блоком изображений
 * */
class ImageViewer {
  constructor( element ) {
    this.element = element;
    this.previewElement = element.querySelector('.column.six.wide img');
    this.imagesContainer = element.querySelector('.images-list .grid .row');
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по изображению меняет класс активности у изображения
   * 2. Двойной клик по изображению отображает изображаения в блоке предпросмотра
   * 3. Клик по кнопке выделения всех изображений проверяет у всех ли изображений есть класс активности?
   * Добавляет или удаляет класс активности у всех изображений
   * 4. Клик по кнопке "Посмотреть загруженные файлы" открывает всплывающее окно просмотра загруженных файлов
   * 5. Клик по кнопке "Отправить на диск" открывает всплывающее окно для загрузки файлов
   */
  registerEvents(){
    this.imagesContainer.addEventListener('dblclick', event => {
      const image = event.target.closest('img');

      if (image) {
        this.previewElement.src = image.src;
      }
    });

    this.imagesContainer.addEventListener('click', event => {
      const image = event.target.closest('img');

      if (image) {
        image.classList.toggle('selected');
        this.checkButtonText();
      }
    });

    this.element.querySelector('.select-all').addEventListener('click', () => {
      const images = this.imagesContainer.querySelectorAll('img');
      const hasSelected = [...images].some(image => image.classList.contains('selected'));

      images.forEach(image => image.classList.toggle('selected', !hasSelected));
      this.checkButtonText();
    });

    this.element.querySelector('.show-uploaded-files').addEventListener('click', () => {
      const modal = App.getModal('filePreviewer');
      modal.contentElement.innerHTML = '<i class="asterisk loading icon massive"></i>';
      modal.open();
      modal.showFolders();
    });

    this.element.querySelector('.send').addEventListener('click', () => {
      const modal = App.getModal('fileUploader');
      const images = [...this.imagesContainer.querySelectorAll('img.selected')].map(image => image.src);

      modal.open();
      modal.showImages(images);
    });
  }

  /**
   * Очищает отрисованные изображения
   */
  clear() {
    this.imagesContainer.innerHTML = '';
  }

  /**
   * Отрисовывает изображения.
  */
  drawImages(images) {
    const selectAllButton = this.element.querySelector('.select-all');
    selectAllButton.classList.toggle('disabled', !images.length);

    this.imagesContainer.innerHTML += images
      .map(image => `<div class='four wide column ui medium image-wrapper'><img src='${image}' /></div>`)
      .join('');
  }

  /**
   * Контроллирует кнопки выделения всех изображений и отправки изображений на диск
   */
  checkButtonText(){
    const images = [...this.imagesContainer.querySelectorAll('img')];
    const selectAllButton = this.element.querySelector('.select-all');
    const sendButton = this.element.querySelector('.send');

    const allSelected = images.length && images.every(image => image.classList.contains('selected'));
    selectAllButton.textContent = allSelected ? 'Снять выделение' : 'Выбрать всё';

    const hasSelected = images.some(image => image.classList.contains('selected'));
    sendButton.classList.toggle('disabled', !hasSelected);
  }

}
