const redirector = (() => {
  const redirect = callback => {
    if (window.location.pathname === '/') {
      fetch('__uuid')
        .then(res => res.text())
        .then(uuid => window.location.href = uuid)
    } else {
      const id = window.location.pathname.replace('/', '');
      callback(id);
    }
  }

  return {
    redirect: redirect,
  };
})();
