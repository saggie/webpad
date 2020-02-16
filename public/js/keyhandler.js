const keyHandler = (() => {
  const KV_CTRL = 17;
  const KV_S = 83;

  let isCtrlKeyPressed = false;
  let isSKeyPressed = false;
  let callback = () => { };

  const clearState = () => {
    isCtrlKeyPressed = false;
    isSKeyPressed = false;
  };

  const onKeyDown = e => {
    switch (e.keyCode) {
      case KV_CTRL: isCtrlKeyPressed = true; break;
      case KV_S: isSKeyPressed = true; break;
    }

    if (isCtrlKeyPressed && isSKeyPressed) {
      e.preventDefault();
      clearState();
      callback();
    }
  };

  const onKeyUp = e => {
    switch (e.keyCode) {
      case KV_CTRL: isCtrlKeyPressed = false; break;
      case KV_S: isSKeyPressed = false; break;
    }
  };

  const addCallback = newCallback => {
    callback = newCallback;
  };

  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('keyup', onKeyUp, false);

  return {
    addCallback: addCallback
  };
})();
