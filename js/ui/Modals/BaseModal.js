/**
 * Класс BaseModal
 * Используется как базовый класс всплывающего окна
 */
class BaseModal {
  /**
   * @param {JQuery} element семантик элемент всплывающего окна, DOM элемент находится на нулевой позиции
   */
  constructor( element ) {
    this.semanticElement = element;
    this.element = element[0];
  }

  /**
   * Открывает всплывающее окно
   * @returns {void}
   */
  open() {
    this.semanticElement.modal('show');
  }

  /**
   * Закрывает всплывающее окно
   * @returns {void}
   */
  close() {
    this.semanticElement.modal('hide');
  }
}
