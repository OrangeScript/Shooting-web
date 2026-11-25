const stage = document.getElementById('player-stage');
const cover = document.getElementById('player-cover');
const status = document.getElementById('player-status');
const fullscreen = document.getElementById('fullscreen');
const stop = document.getElementById('stop');
let frame;

function launch() {
  if (frame) return;

  if (location.protocol === 'file:') {
    status.textContent = '请通过 HTTP 或 HTTPS 地址打开页面后再试玩。';
    return;
  }

  frame = document.createElement('iframe');
  frame.src = './play.html';
  frame.title = 'SHOOTING 玩家试玩';
  frame.allow = 'fullscreen';
  frame.allowFullscreen = true;
  cover.hidden = true;
  stage.appendChild(frame);
  stop.disabled = false;
}

for (const link of document.querySelectorAll('[data-launch]')) {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.getAttribute('href') !== '#play') event.preventDefault();
    launch();
  });
}

window.addEventListener('message', event => {
  if (!frame || event.origin !== location.origin || event.source !== frame.contentWindow) return;
  if (event.data?.source !== 'shooting-player') return;
  if (event.data.state === 'ready') fullscreen.disabled = !document.fullscreenEnabled;
});

fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement === stage) await document.exitFullscreen();
    else await stage.requestFullscreen();
  } catch (error) {
    console.warn('未能进入全屏', error);
  }
});

stop.addEventListener('click', async () => {
  if (document.fullscreenElement === stage) await document.exitFullscreen().catch(() => {});
  frame?.remove();
  frame = undefined;
  cover.hidden = false;
  fullscreen.disabled = true;
  stop.disabled = true;
  cover.querySelector('a').focus({ preventScroll: true });
});
