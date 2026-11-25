const canvas = document.getElementById('unity-canvas');
const loadState = document.getElementById('load-state');
const loadMessage = document.getElementById('load-message');
const progressBar = document.getElementById('load-progress');
const retry = document.getElementById('retry');
const standaloneActions = document.getElementById('standalone-actions');
const fullscreen = document.getElementById('game-fullscreen');
const embedded = window.parent !== window;

function fail(message) {
  document.documentElement.dataset.player = 'error';
  loadState.hidden = false;
  loadMessage.textContent = String(message || '游戏未能启动。请检查 WebGL 支持后重试。');
  progressBar.hidden = true;
  retry.hidden = false;
}

retry.addEventListener('click', () => location.reload());
standaloneActions.hidden = embedded;

if (location.protocol === 'file:') {
  fail('请通过 HTTP 或 HTTPS 地址打开游戏。');
} else {
  const loader = document.createElement('script');
  loader.src = './Build/Shooting_Web.loader.js';
  loader.onerror = () => fail('找不到 Unity 加载器，请检查 Build 文件夹。');
  loader.onload = () => {
    const config = {
      dataUrl: './Build/Shooting_Web.data.unityweb',
      frameworkUrl: './Build/Shooting_Web.framework.js.unityweb',
      codeUrl: './Build/Shooting_Web.wasm.unityweb',
      streamingAssetsUrl: './StreamingAssets',
      companyName: 'DefaultCompany',
      productName: 'Shooting',
      productVersion: '0.1.0',
      devicePixelRatio: Math.min(devicePixelRatio || 1, 1.5),
      showBanner(message, type) {
        if (type === 'error') fail(message);
        else console.warn(message);
      },
    };
    createUnityInstance(canvas, config, progress => {
      const percent = Math.min(100, Math.round(progress * 100));
      if (progressBar.value === percent) return;
      progressBar.value = percent;
      loadMessage.textContent = '正在加载游戏资源 · ' + percent + '%';
    }).then(instance => {
      document.documentElement.dataset.player = 'ready';
      loadState.hidden = true;
      if (!embedded && document.fullscreenEnabled) {
        fullscreen.hidden = false;
        fullscreen.addEventListener('click', () => instance.SetFullscreen(1));
      }
      if (embedded) window.parent.postMessage({ source: 'shooting-player', state: 'ready' }, location.origin);
    }).catch(fail);
  };
  document.body.appendChild(loader);
}
