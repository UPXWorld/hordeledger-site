// HordeLedger.com: hover layer for the server-drawn price charts (figure.pchart[data-pts]).
// data-pts = [[x, y, "label"], ...] in the SVG's viewBox units, so no scale math is needed here.
(function () {
  document.querySelectorAll("figure.pchart[data-pts]").forEach(function (fig) {
    var pts; try { pts = JSON.parse(fig.getAttribute("data-pts")); } catch (e) { return; }
    var svg = fig.querySelector("svg"); if (!svg || !pts.length) return;
    var NS = "http://www.w3.org/2000/svg", vb = svg.viewBox.baseVal;
    var hx = document.createElementNS(NS, "line"); hx.setAttribute("class", "hx");
    var hd = document.createElementNS(NS, "circle"); hd.setAttribute("class", "hd"); hd.setAttribute("r", "4.5");
    var tip = document.createElement("div"); tip.className = "ctip"; tip.hidden = true; fig.appendChild(tip);
    hx.style.display = hd.style.display = "none"; svg.appendChild(hx); svg.appendChild(hd);
    function show(ev) {
      var r = svg.getBoundingClientRect(); if (!r.width) return;
      var x = (ev.clientX - r.left) / r.width * vb.width + vb.x, best = pts[0];
      for (var i = 1; i < pts.length; i++) if (Math.abs(pts[i][0] - x) < Math.abs(best[0] - x)) best = pts[i];
      hx.setAttribute("x1", best[0]); hx.setAttribute("x2", best[0]);
      hx.setAttribute("y1", fig.getAttribute("data-top") || 10); hx.setAttribute("y2", fig.getAttribute("data-bot") || vb.height - 24);
      hd.setAttribute("cx", best[0]); hd.setAttribute("cy", best[1]);
      hx.style.display = hd.style.display = ""; tip.hidden = false; tip.textContent = best[2];
      var fr = fig.getBoundingClientRect(), px = r.left - fr.left + (best[0] - vb.x) / vb.width * r.width,
          py = r.top - fr.top + (best[1] - vb.y) / vb.height * r.height;
      var left = px + 12; if (left + tip.offsetWidth > fr.width - 4) left = px - tip.offsetWidth - 12;
      tip.style.left = Math.max(4, left) + "px"; tip.style.top = Math.max(4, py - tip.offsetHeight - 8) + "px";
    }
    function hide() { hx.style.display = hd.style.display = "none"; tip.hidden = true; }
    svg.addEventListener("pointermove", show); svg.addEventListener("pointerdown", show); svg.addEventListener("pointerleave", hide);
  });
})();
