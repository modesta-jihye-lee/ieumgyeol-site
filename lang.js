// 한국어 / English 전환. <head>에서 동기 로드해 첫 화면이 그려지기 전에 언어를 정한다.
// 본문에서 lang="ko" / lang="en" 이 붙은 요소 중 고른 언어만 보이고,
// [data-set-lang] 링크를 누르면 바뀐다. 고른 언어는 같은 사이트의 모든 페이지에 이어진다.
(function () {
  var KEY = 'ieumgyeol-lang';
  var root = document.documentElement;

  function valid(l) { return l === 'ko' || l === 'en' ? l : null; }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }

  function initial() {
    // 우선순위: ?lang= → #ko/#en → 이전에 고른 언어 → 브라우저 언어
    var q = valid(new URLSearchParams(location.search).get('lang'));
    if (q) { store(q); return q; }
    var h = valid(location.hash.slice(1));
    if (h) return h;
    var s = valid(stored());
    if (s) return s;
    var first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    return /^ko/i.test(first) ? 'ko' : 'en';
  }

  function apply(l) {
    root.setAttribute('data-lang', l);
    root.lang = l;
    var t = root.getAttribute('data-title-' + l);
    if (t) document.title = t;
    var links = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute('aria-current', links[i].getAttribute('data-set-lang') === l ? 'true' : 'false');
    }
    var hrefs = document.querySelectorAll('[data-href-' + l + ']');
    for (var j = 0; j < hrefs.length; j++) hrefs[j].href = hrefs[j].getAttribute('data-href-' + l);
  }

  var style = document.createElement('style');
  style.textContent =
    'html[data-lang="ko"] body [lang="en"], html[data-lang="en"] body [lang="ko"] { display: none !important; }';
  document.head.appendChild(style);

  var current = initial();
  apply(current);

  document.addEventListener('DOMContentLoaded', function () { apply(current); });
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('[data-set-lang]');
    if (!link) return;
    e.preventDefault();
    current = link.getAttribute('data-set-lang');
    store(current);
    apply(current);
    if (valid(location.hash.slice(1))) history.replaceState(null, '', location.pathname + location.search);
  });
})();
