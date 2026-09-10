/* eslint-disable no-undef */
// Check for contenteditable support
const isContentEditableSupported = 'contentEditable' in document.documentElement;

if (isContentEditableSupported === true) {
  const Editor = function(textarea) {
    this.textarea = textarea;
    this.container = $(textarea).parent();
    this.createToolbar();
    this.hideDefault();
    this.configureToolbar();
    this.keys = {
      left: 37,
      right: 39,
      up: 38,
      down: 40
    };
    this.container.on('click', '.jui-editor__toolbar-button', $.proxy(this, 'onButtonClick'));
    this.container.on('input', '.jui-editor__content', $.proxy(this, 'updateTextarea'));
    this.toolbar.on('keydown', $.proxy(this, 'onToolbarKeydown'));
  };

  Editor.prototype.onToolbarKeydown = function(e) {
    let focusableButton;
    switch (e.keyCode) {
      case this.keys.right:
      case this.keys.down:
        focusableButton = this.toolbar.find('button[tabindex=0]');
        const nextButton = focusableButton.next('button');
        if (nextButton[0]) {
          nextButton.focus();
          focusableButton.attr('tabindex', '-1');
          nextButton.attr('tabindex', '0');
        }
        break;
      case this.keys.left:
      case this.keys.up:
        focusableButton = this.toolbar.find('button[tabindex=0]');
        const previousButton = focusableButton.prev('button');
        if (previousButton[0]) {
          previousButton.focus();
          focusableButton.attr('tabindex', '-1');
          previousButton.attr('tabindex', '0');
        }
        break;
    }
  };

  Editor.prototype.createToolbarButton = function(modifier, command, label) {
    const button = document.createElement('button');
    const hiddenLabel = document.createElement('span');

    button.className = `jui-editor__toolbar-button jui-editor__toolbar-button--${modifier}`;
    button.type = 'button';
    button.dataset.command = command;
    hiddenLabel.className = 'govuk-visually-hidden';
    hiddenLabel.textContent = label;
    button.appendChild(hiddenLabel);

    return button;
  };

  Editor.prototype.createEnhancedContent = function() {
    const wrapper = document.createElement('div');
    const toolbar = document.createElement('div');
    const content = document.createElement('div');

    wrapper.className = 'jui-editor';
    toolbar.className = 'jui-editor__toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.appendChild(this.createToolbarButton('bold', 'bold', 'Bold'));
    toolbar.appendChild(this.createToolbarButton('italic', 'italic', 'Italic'));
    toolbar.appendChild(this.createToolbarButton('underline', 'underline', 'Underline'));
    toolbar.appendChild(this.createToolbarButton('unordered-list', 'insertUnorderedList', 'Unordered list'));
    toolbar.appendChild(this.createToolbarButton('ordered-list', 'insertOrderedList', 'Ordered list'));
    content.className = 'jui-editor__content';
    content.contentEditable = 'true';
    content.spellcheck = false;
    wrapper.appendChild(toolbar);
    wrapper.appendChild(content);

    return wrapper;
  };

  Editor.prototype.sanitiseContent = function(html) {
    const allowedTags = ['BR', 'EM', 'LI', 'OL', 'STRONG', 'U', 'UL'];
    const documentFragment = document.createDocumentFragment();
    const parsedDocument = new DOMParser().parseFromString(html || '', 'text/html');

    const sanitiseNode = function(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent);
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return document.createTextNode('');
      }

      if (!allowedTags.includes(node.tagName)) {
        const fragment = document.createDocumentFragment();
        node.childNodes.forEach((childNode) => fragment.appendChild(sanitiseNode(childNode)));
        return fragment;
      }

      const element = document.createElement(node.tagName.toLowerCase());
      node.childNodes.forEach((childNode) => element.appendChild(sanitiseNode(childNode)));
      return element;
    };

    parsedDocument.body.childNodes.forEach((node) => documentFragment.appendChild(sanitiseNode(node)));

    return documentFragment;
  };

  Editor.prototype.hideDefault = function() {
    this.label = this.container.find('label')[0];
    this.label.classList.add('govuk-visually-hidden');
    this.label.setAttribute('aria-hidden', true);
    this.textarea = this.container.find('textarea')[0];
    this.textarea.classList.add('govuk-visually-hidden');
    this.textarea.setAttribute('aria-hidden', true);
    this.textarea.setAttribute('tabindex', '-1');
  };

  Editor.prototype.createToolbar = function() {
    this.container.append(this.createEnhancedContent());
    this.toolbar = this.container.find('.jui-editor__toolbar');
    this.container.find('.jui-editor__content')[0].replaceChildren(this.sanitiseContent(this.textarea.val()));
  };

  Editor.prototype.configureToolbar = function() {
    this.buttons = this.container.find('.jui-editor__toolbar-button');
    this.buttons.prop('tabindex', '-1');
    const firstTab = this.buttons.first();
    firstTab.prop('tabindex', '0');
  };

  Editor.prototype.onButtonClick = function(e) {
    document.execCommand($(e.currentTarget).data('command'), false, null);
  };

  Editor.prototype.getContent = function() {
    return this.container.find('.jui-editor__content')[0].innerHTML;
  };

  Editor.prototype.updateTextarea = function() {
    const content = this.getContent();
    const textarea = this.container.find('.js-editor');
    document.execCommand('defaultParagraphSeparator', false, 'p');
    textarea.val(content);
  };
}
