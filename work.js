/* work.html runtime — view switcher + two-layer filter chips.
   v5, 2026-08-13. No frameworks. State lives in the URL so a filtered view is
   linkable and crawlable. Nothing here creates content: every project is in the
   DOM at load and filtering only toggles a class, so an agent or a screen reader
   reads the full set regardless of view or filter.
   (canon: 14-ux-canon/principles/08 "Put it in the DOM, not behind a click") */
(function () {
  var d = document, grid = d.getElementById('wgrid');
  if (!grid) return;

  /* this page never inherits the homepage's stored reading depth */
  d.body.setAttribute('data-depth', 'read');

  var tiles = [].slice.call(grid.querySelectorAll('.tile'));
  var domBtns = [].slice.call(d.querySelectorAll('.wchip[data-dom]'));
  var typeBtns = [].slice.call(d.querySelectorAll('.wchip[data-type]'));
  var viewBtns = [].slice.call(d.querySelectorAll('.viewsw button'));
  var countEl = d.getElementById('wcount');
  var emptyEl = d.getElementById('wempty');
  var resetEl = d.getElementById('wreset');
  var VIEWS = { list: 1, bento: 1, hero: 1 };

  var state = { doms: [], types: [], view: 'bento' };

  function readURL() {
    var p = new URLSearchParams(location.search);
    var dm = p.get('domain'), ty = p.get('type'), vw = p.get('view');
    state.doms = dm ? dm.split(',').filter(Boolean) : [];
    state.types = ty ? ty.split(',').filter(Boolean) : [];
    state.view = VIEWS[vw] ? vw : 'bento';
  }

  function writeURL(push) {
    var p = new URLSearchParams();
    if (state.doms.length) p.set('domain', state.doms.join(','));
    if (state.types.length) p.set('type', state.types.join(','));
    if (state.view !== 'bento') p.set('view', state.view);
    var q = p.toString();
    var url = location.pathname + (q ? '?' + q : '');
    if (push) history.pushState(null, '', url); else history.replaceState(null, '', url);
  }

  function matches(t) {
    var td = (t.getAttribute('data-doms') || '').split(' ');
    var tt = t.getAttribute('data-type') || '';
    /* OR within a layer, AND across layers */
    var okD = !state.doms.length || state.doms.some(function (x) { return td.indexOf(x) > -1 });
    var okT = !state.types.length || state.types.indexOf(tt) > -1;
    return okD && okT;
  }

  function render() {
    var shown = 0;
    tiles.forEach(function (t) {
      var ok = matches(t);
      t.classList.toggle('hidden', !ok);
      if (ok) shown++;
    });

    domBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', state.doms.indexOf(b.dataset.dom) > -1 ? 'true' : 'false');
    });
    typeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', state.types.indexOf(b.dataset.type) > -1 ? 'true' : 'false');
    });
    viewBtns.forEach(function (b) {
      var on = b.dataset.v === state.view;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    grid.setAttribute('data-view', state.view);

    var filtered = state.doms.length || state.types.length;
    countEl.textContent = shown === tiles.length && !filtered
      ? 'Showing all ' + tiles.length + ' projects.'
      : 'Showing ' + shown + ' of ' + tiles.length + ' projects.';

    /* an empty result is never silent */
    emptyEl.hidden = shown !== 0;
    grid.hidden = shown === 0;
  }

  function toggle(list, val) {
    var i = list.indexOf(val);
    if (i > -1) list.splice(i, 1); else list.push(val);
  }

  domBtns.forEach(function (b) {
    b.addEventListener('click', function () { toggle(state.doms, b.dataset.dom); writeURL(true); render() });
  });
  typeBtns.forEach(function (b) {
    b.addEventListener('click', function () { toggle(state.types, b.dataset.type); writeURL(true); render() });
  });
  viewBtns.forEach(function (b) {
    b.addEventListener('click', function () { state.view = b.dataset.v; writeURL(true); render() });
  });
  if (resetEl) resetEl.addEventListener('click', function () {
    state.doms = []; state.types = []; writeURL(true); render();
  });
  window.addEventListener('popstate', function () { readURL(); render() });

  readURL();
  render();
})();
