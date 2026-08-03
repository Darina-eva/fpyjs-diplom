/**
 * Класс FileUploaderModal
 * Используется как всплывающее окно для загрузки изображений
 */
class FileUploaderModal extends BaseModal {
  constructor( element ) {
    super(element);
    this.contentElement = this.element.querySelector('.content');
    this.imageContainers = this.contentElement.getElementsByClassName('image-preview-container');
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по кнопке "Закрыть" на всплывающем окне, закрывает его
   * 3. Клик по кнопке "Отправить все файлы" на всплывающем окне, вызывает метод sendAllImages
   * 4. Клик по кнопке загрузке по контроллерам изображения:
   * убирает ошибку, если клик был по полю вода
   * отправляет одно изображение, если клик был по кнопке отправки
   */
  registerEvents(){
    this.element.querySelector('.header .x.icon').addEventListener('click', () => this.close());
    this.element.querySelector('.actions .close.button').addEventListener('click', () => this.close());
    this.element.querySelector('.actions .send-all.button').addEventListener('click', () => this.sendAllImages());

    this.contentElement.addEventListener('click', event => {
      const input = event.target.closest('.ui.input');

      if (input) {
        input.classList.remove('error');
      }

      const button = event.target.closest('.ui.input button');

      if (button) {
        this.sendImage(button.closest('.image-preview-container'));
      }
    });
  }

  /**
   * Отображает все полученные изображения в теле всплывающего окна
   */
  showImages(images) {
    this.contentElement.innerHTML = '<i class="asterisk loading icon massive"></i>';

    Yandex.getFolders((err, response) => {
      this.folders = ['/'].concat(
        response._embedded.items
          .filter(item => item.type === 'dir')
          .map(item => item.path.replace(/^disk:/, ''))
      );

      this.contentElement.innerHTML = this.getFolderSelectHTML() + images.reverse().map(image => this.getImageHTML(image)).join('');
    });
  }

  /**
   * Формирует HTML разметку выбора папки, в которую загружаются все изображения
   */
  getFolderSelectHTML() {
    const options = this.folders
      .map(folder => `<option value='${folder}'>${folder}</option>`)
      .join('');

    return `<div class="folder-select-wrapper">
      <div class="ui labeled input">
        <div class="ui label"><i class="folder icon"></i>Папка загрузки</div>
        <select class="ui dropdown folder-select">${options}</select>
      </div>
    </div>`;
  }

  /**
   * Формирует HTML разметку с изображением, именем файла и кнопкной загрузки
   */
  getImageHTML(item) {
    return `<div class="image-preview-container">
      <img src='${item}' />
      <div class="ui action input">
        <input type="text" class="file-name" value="${this.getFileName(item)}" readonly>
        <button class="ui button"><i class="upload icon"></i></button>
      </div>
    </div>`;
  }

  /**
   * Формирует короткое имя файла с расширением исходного изображения
   */
  getFileName(url) {
    const extension = (new URL(url).pathname.match(/\.(\w+)$/) || [null, 'jpg'])[1];
    const id = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(16).slice(2, 10);

    return `${id}.${extension}`;
  }

  /**
   * Отправляет все изображения в облако
   */
  sendAllImages() {
    [...this.imageContainers].forEach(container => this.sendImage(container));
  }

  /**
   * Валидирует изображение и отправляет его на сервер
   */
  sendImage(imageContainer) {
    const inputElement = imageContainer.querySelector('.ui.input');
    const folder = this.contentElement.querySelector('.folder-select').value;
    const name = inputElement.querySelector('.file-name').value.trim();

    if (!name) {
      inputElement.classList.add('error');
      return;
    }

    const path = `${folder === '/' ? '' : folder}/${name}`;

    inputElement.classList.add('disabled');

    const url = imageContainer.querySelector('img').src;

    Yandex.uploadFile(path, url, () => {
      imageContainer.remove();

      if (!this.imageContainers.length) {
        this.close();
      }
    });
  }
}
