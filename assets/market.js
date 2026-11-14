// HordeLedger.com market dashboard: search, filter and sort every item in /data/market.json.
// rows = [id, name, url, category, quality, market, lowest, qty, chg24, soldPerDay, speed, bestHours, icon, spark14]
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var body = $("#mk-body"), q = $("#mk-q"), cat = $("#mk-cat"), spd = $("#mk-speed"), cnt = $("#mk-count"), more = $("#mk-more");
  var rows = [], view = [], shown = 100, sortKey = 9, sortDir = -1;
  function coin(c) {
    if (c == null) return '<span class="muted">-</span>';
    c = Math.round(c); var g = Math.floor(c / 10000), s = Math.floor(c / 100) % 100, k = c % 100, o = [];
    if (g) o.push(g.toLocaleString() + '<span class="u ug">g</span>');
    if (g || s) o.push(s + '<span class="u us">s</span>');
    o.push(k + '<span class="u uc">c</span>');
    return '<span class="coin">' + o.join(" ") + "</span>";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pct(v) { if (v == null) return '<span class="muted">-</span>'; var r = Math.round(v); return '<span class="' + (r > 0 ? "pos" : r < 0 ? "neg" : "") + '">' + (r > 0 ? "+" : "") + r + "%</span>"; }
  function icon(r) {
    var q = esc(r[4] || "");
    return r[12] ? '<img class="ic qb-' + q + '" src="/icons/' + esc(r[12]) + '" width="24" height="24" alt="" loading="lazy" decoding="async">'
                 : '<span class="ic ic-none qb-' + q + '" style="width:24px;height:24px" aria-hidden="true"></span>';
  }
  function spark(v) {   // same drawing as build_site.spark()
    if (!v || v.length < 3) return '<span class="spk-none" aria-hidden="true"></span>';
    var w = 88, h = 26, lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), rg = (hi - lo) || 1;
    var X = function (i) { return (2 + i * (w - 6) / (v.length - 1)).toFixed(1); };
    var Y = function (y) { return (h - 4 - (y - lo) / rg * (h - 8)).toFixed(1); };
    var tr = v[v.length - 1] > v[0] * 1.03 ? "up" : v[v.length - 1] < v[0] * 0.97 ? "down" : "flat";
    return '<svg class="spk ' + tr + '" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" aria-hidden="true" focusable="false"><polyline points="' +
      v.map(function (y, i) { return X(i) + "," + Y(y); }).join(" ") + '"/><circle cx="' + X(v.length - 1) + '" cy="' + Y(v[v.length - 1]) + '" r="2.6"/></svg>';
  }
  function num(v) { return v == null ? '<span class="muted">-</span>' : v >= 10 ? Math.round(v).toLocaleString() : (Math.round(v * 10) / 10).toString(); }
  function apply() {
    var t = q.value.trim().toLowerCase(), c = cat.value, s = spd.value;
    view = rows.filter(function (r) {
      return (!t || r[1].toLowerCase().indexOf(t) >= 0) && (!c || r[3] === c) && (!s || r[10] === s);
    });
    view.sort(function (a, b) {
      var x = a[sortKey], y = b[sortKey];
      if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1;
      return (typeof x === "string" ? x.localeCompare(y) : x - y) * sortDir;
    });
    shown = 100; render();
  }
  function render() {
    var h = [];
    view.slice(0, shown).forEach(function (r) {
      var nm = icon(r) + '<span class="q-' + esc(r[4] || "") + '">' + esc(r[1]) + "</span>";
      h.push('<tr><td class="it">' + (r[2] ? '<a href="' + r[2] + '">' + nm + "</a>" : nm) + '</td><td class="hide-sm">' + esc(r[3] || "") +
        '</td><td class="n">' + coin(r[5]) + '</td><td class="hide-sm sp">' + spark(r[13]) + '</td><td class="n hide-sm">' + coin(r[6]) + '</td><td class="n">' + num(r[7]) +
        '</td><td class="n">' + pct(r[8]) + '</td><td class="n">' + num(r[9]) + '</td><td class="hide-sm">' +
        (r[10] ? '<span class="speed">' + esc(r[10]) + "</span>" : "") + "</td></tr>");
    });
    body.innerHTML = h.join("") || '<tr><td colspan="9" class="muted">No items match.</td></tr>';
    cnt.textContent = view.length.toLocaleString() + " items";
    more.hidden = view.length <= shown;
  }
  document.querySelectorAll("#mk th[data-k]").forEach(function (th) {
    th.querySelector("button").addEventListener("click", function () {
      var k = +th.getAttribute("data-k");
      sortDir = sortKey === k ? -sortDir : (k === 1 || k === 3 ? 1 : -1); sortKey = k;
      document.querySelectorAll("#mk th[data-k]").forEach(function (o) { o.removeAttribute("aria-sort"); });
      th.setAttribute("aria-sort", sortDir > 0 ? "ascending" : "descending");
      apply();
    });
  });
  [q, cat, spd].forEach(function (el) { el.addEventListener("input", apply); });
  more.addEventListener("click", function () { shown += 200; render(); });
  var p = new URLSearchParams(location.search); if (p.get("q")) q.value = p.get("q");
  fetch("/data/market.json").then(function (r) { return r.json(); }).then(function (d) {
    rows = d.rows;
    d.cats.forEach(function (c) { var o = document.createElement("option"); o.value = o.textContent = c; cat.appendChild(o); });
    if (p.get("cat")) cat.value = p.get("cat");
    apply();
  }).catch(function () { body.innerHTML = '<tr><td colspan="9">Could not load the market data. Try reloading the page.</td></tr>'; });
})();
