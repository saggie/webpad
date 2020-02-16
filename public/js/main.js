window.lineSeparator = navigator.platform.startsWith('Win') ? '\r\n' : '\n';
window.onbeforeunload = e => e.returnValue = 'Are you sure you want to leave this page？';

// Will run when page finishes loading
window.onload = async () => {
  redirector.redirect(loader.load);
  keyHandler.addCallback(publisher.publish);
};

window.onfocus = () => document.getElementById('contents').focus();
window.onclick = () => document.getElementById('contents').focus();
