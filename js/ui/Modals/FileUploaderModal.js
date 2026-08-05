/**
 * Класс FileUploaderModal
 * Используется как всплывающее окно для загрузки изображений
 */
class FileUploaderModal extends BaseModal {

  static FORBIDDEN_SYMBOLS = /[\\/:*?"<>|]/;

  /**
   * @param {JQuery} element семантик элемент всплывающего окна
   */
  constructor( element ) {
    super(element);
    this.contentElement = this.element.querySelector('.content');
    this.imageContainers = this.contentElement.getElementsByClassName('image-preview-container');
    this.folders = null;
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
   * @returns {void}
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
   * Список папок загружается один раз и сохраняется в свойстве folders
   * @param {string[]} images ссылки на выбранные изображения
   * @returns {void}
   */
  showImages(images) {
    if (this.folders) {
      this.renderImages(images);
      return;
    }

    this.contentElement.innerHTML = '<i class="asterisk loading icon massive"></i>';

    Yandex.getFolders((err, response) => {
      if (err) {
        this.contentElement.innerHTML = '<div class="empty-folder">Не удалось получить список папок</div>';
        return;
      }

      this.folders = ['/'].concat(
        response._embedded.items
          .filter(item => item.type === 'dir')
          .map(item => item.path.replace(/^disk:/, ''))
      );

      this.renderImages(images);
    });
  }

  /**
   * Отрисовывает выбор папки и полученные изображения
   * @param {string[]} images ссылки на выбранные изображения
   * @returns {void}
   */
  renderImages(images) {
    this.contentElement.innerHTML = this.getFolderSelectHTML() + images.reverse().map(image => this.getImageHTML(image)).join('');
  }

  /**
   * Формирует HTML разметку выбора папки, в которую загружаются все изображения
   * @returns {string} разметка блока выбора папки
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
   * @param {string} item ссылка на изображение
   * @returns {string} разметка блока контейнера изображения
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
   * @param {string} url ссылка на изображение, из которой берётся расширение
   * @returns {string} имя файла вида 'a1b2c3d4.jpg'
   */
  getFileName(url) {
    const extension = (new URL(url).pathname.match(/\.(\w+)$/) || [null, 'jpg'])[1];
    const id = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(16).slice(2, 10);

    return `${id}.${extension}`;
  }

  /**
   * Отправляет все изображения в облако
   * @returns {void}
   */
  sendAllImages() {
    [...this.imageContainers].forEach(container => this.sendImage(container));
  }

  /**
   * Валидирует изображение и отправляет его на сервер
   * @param {HTMLElement} imageContainer блок контейнер изображения
   * @returns {void}
   */
  sendImage(imageContainer) {
    const inputElement = imageContainer.querySelector('.ui.input');
    const folder = this.contentElement.querySelector('.folder-select').value;
    const name = inputElement.querySelector('.file-name').value.trim();

    if (!name) {
      inputElement.classList.add('error');
      return;
    }

    if (FileUploaderModal.FORBIDDEN_SYMBOLS.test(name)) {
      inputElement.classList.add('error');
      alert('Имя файла не должно содержать символы \\ / : * ? " < > |');
      return;
    }

    const path = `${folder === '/' ? '' : folder}/${name}`;

    inputElement.classList.add('disabled');

    const url = imageContainer.querySelector('img').src;

    Yandex.uploadFile(path, url, err => {
      if (err) {
        inputElement.classList.remove('disabled');
        inputElement.classList.add('error');
        return;
      }

      imageContainer.remove();

      if (!this.imageContainers.length) {
        this.close();
      }
    });
  }
}
