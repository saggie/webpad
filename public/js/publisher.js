const publisher = (() => {
  const contents = document.getElementById('contents');

  const chopLastBr = text => {
    if (text.lastIndexOf('\n') == text.length - 1) {
      return text.substring(0, text.length - 1);
    }
    return text;
  };

  const getTextFromNode = node => {
    const text = chopLastBr(node.innerText);
    return text.replace('\n', window.lineSeparator);
  };

  const getId = () => {
    return window.location.pathname.replace('/', '');
  };

  const onPublish = () => {
    const snackbar = document.getElementById('snackbar');
    snackbar.className = 'show';

    // After 1.5 seconds, remove the show class from DIV
    setTimeout(() => {
      snackbar.className = snackbar.className.replace('show', '');
    }, 1500);
  }

  const publish = () => {
    const paragraphs = contents.children;
    const texts = [];
    for (let i = 0; i < paragraphs.length; i++) {
      texts.push(getTextFromNode(paragraphs[i]));
    }
    $.ajax({
      type: 'POST',
      url: '__articles/' + getId(),
      data: texts.join(window.lineSeparator),
      contentType: 'text/plain; charset=UTF-8',
      success: function (data) {
        console.log(data);
        onPublish();
      }
    });
  };

  return {
    publish: publish
  };
})();
