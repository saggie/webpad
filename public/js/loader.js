const loader = (() => {
  const contents = document.getElementById('contents');

  const clearContents = () => {
    while (contents.firstChild) {
      contents.removeChild(contents.firstChild);
    };
  };

  const loadText = async id => {
    return fetch('__articles/' + id)
      .then(res => res.text());
  };

  const buildHeading = text => {
    const heading = document.createElement('h1');
    heading.appendChild(document.createTextNode(text));
    return heading;
  };

  const buildParagraph = line => {
    const paragraph = document.createElement('div');
    paragraph.appendChild(document.createTextNode(line));
    if (line == '') {
      paragraph.appendChild(document.createElement('br'));
    }
    return paragraph;
  };

  const buildContents = text => {
    const lines = text.replace('\r', '').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i == 0) {
        contents.appendChild(buildHeading(line));
      } else {
        contents.appendChild(buildParagraph(line));
      }
    }
  };

  const load = async id => {
    clearContents();
    const text = await loadText(id);
    buildContents(text);
    contents.focus();
  };

  return {
    load: load
  };
})();
