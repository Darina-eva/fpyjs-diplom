/**
 * Класс PreviewModal
 * Используется как обозреватель загруженный файлов в облако
 */
class PreviewModal extends BaseModal {
  constructor( element ) {
    super(element);
    this.contentElement = this.element.querySelector('.content');
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по контроллерам изображения:
   * Отправляет запрос на удаление изображения, если клик был на кнопке delete
   * Скачивает изображение, если клик был на кнопке download
   */
  registerEvents() {
    this.element.querySelector('.header .x.icon').addEventListener('click', () => this.close());

    this.contentElement.addEventListener('click', event => {
      const removeButton = event.target.closest('.button.delete');

      if (removeButton) {
        removeButton.querySelector('i').className = 'icon spinner loading';
        removeButton.classList.add('disabled');

        Yandex.removeFile(removeButton.dataset.path, (err, response) => {
          if (err) {
            removeButton.querySelector('i').className = 'trash icon';
            removeButton.classList.remove('disabled');
            return;
          }

          if (response === null) {
            removeButton.closest('.image-preview-container').remove();
          }
        });

        return;
      }

      const downloadButton = event.target.closest('.button.download');

      if (downloadButton) {
        Yandex.downloadFileByUrl(downloadButton.dataset.file);
        return;
      }

      const folderHeader = event.target.closest('.folder-header');

      if (folderHeader) {
        this.toggleFolder(folderHeader);
      }
    });
  }

  /**
   * Загружает и отрисовывает список папок облака
   */
  showFolders() {
    this.contentElement.innerHTML = '<i class="asterisk loading icon massive"></i>';

    Yandex.getFolders((err, response) => {
      if (err) {
        this.contentElement.innerHTML = '<div class="empty-folder">Не удалось получить список папок</div>';
        return;
      }

      const folders = ['/'].concat(
        response._embedded.items
          .filter(item => item.type === 'dir')
          .map(item => item.path.replace(/^disk:/, ''))
      );

      this.contentElement.innerHTML = folders.map(folder => this.getFolderHTML(folder)).join('');
      this.toggleFolder(this.contentElement.querySelector('.folder-header'));
    });
  }

  /**
   * Разворачивает и сворачивает папку, загружая её содержимое при первом открытии
   */
  toggleFolder(folderHeader) {
    const folderContent = folderHeader.nextElementSibling;

    folderHeader.classList.toggle('collapsed');
    folderContent.classList.toggle('collapsed');

    if (folderContent.dataset.loaded || folderContent.classList.contains('collapsed')) {
      return;
    }

    folderContent.dataset.loaded = 'true';
    folderContent.innerHTML = '<i class="asterisk loading icon"></i>';

    Yandex.getResources(folderHeader.dataset.folder, (err, response) => {
      if (err) {
        delete folderContent.dataset.loaded;
        folderContent.innerHTML = '<div class="empty-folder">Не удалось получить файлы папки</div>';
        return;
      }

      const files = response._embedded.items.filter(item => item.type === 'file');

      if (files.length) {
        this.showImages(files, folderContent);
        return;
      }

      folderContent.innerHTML = '<div class="empty-folder">Файлов нет</div>';
    });
  }

  /**
   * Отрисовывает изображения в блоке всплывающего окна
   */
  showImages(data, container = this.contentElement) {
    container.innerHTML = data.reverse().map(item => this.getImageInfo(item)).join('');
  }

  /**
   * Возвращает разметку папки с блоком для её содержимого
   */
  getFolderHTML(folder) {
    return `<div class="ui header folder-header collapsed" data-folder='disk:${folder}'>
      <i class="dropdown icon"></i>
      <i class="folder icon"></i>
      ${folder}
    </div>
    <div class="folder-content collapsed"></div>`;
  }

  /**
   * Форматирует дату в формате 2021-12-30T20:40:02+00:00(строка)
   * в формат «30 декабря 2021 г. в 23:40» (учитывая временной пояс)
   * */
  formatDate(date) {
    const value = new Date(date);

    const day = value.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = value.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    return `${day} в ${time}`;
  }

  /**
   * Возвращает разметку из изображения, таблицы с описанием данных изображения и кнопок контроллеров (удаления и скачивания)
   */
  getImageInfo(item) {
    return `<div class="image-preview-container">
      <img src='${item.file}' />
      <table class="ui celled table">
      <thead>
        <tr><th>Имя</th><th>Создано</th><th>Размер</th></tr>
      </thead>
      <tbody>
        <tr><td>${item.name}</td><td>${this.formatDate(item.created)}</td><td>${Math.round(item.size / 1024)}Кб</td></tr>
      </tbody>
      </table>
      <div class="buttons-wrapper">
        <button class="ui labeled icon red basic button delete" data-path='${item.path}'>
          Удалить
          <i class="trash icon"></i>
        </button>
        <button class="ui labeled icon violet basic button download" data-file='${item.file}'>
          Скачать
          <i class="download icon"></i>
        </button>
      </div>
    </div>`;
  }
}
