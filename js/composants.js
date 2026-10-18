/* Composants interactifs de la trame : plan de l'installation, zoom panneau, quiz des pièces,
   chaîne d'énergie à remettre dans l'ordre, panneau virtuel (séance 1.2, question 12). */
(function () {
  "use strict";
  var V = window.VIVANT;
  var TOURNESOL = "images/tournesol-tete.jpg";
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function melange(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bulle(txt) {
    return '<div class="bulle-l petite"><img class="portrait" src="' + TOURNESOL + '" alt="Professeur Tournesol"><div class="bulle">' + txt + "</div></div>";
  }
  window.melange = melange;
  var CHEVRON_HAUT = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 8l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>';
  var CHEVRON_BAS = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>';

  /* ---------------- Plan de l'installation ---------------- */
  var DC = "#1f5f99", AC = "#c0392b", PE = "#3a9d4a";
  var PLAN_SVG =
    '<svg viewBox="0 0 1000 520" role="group" aria-label="Plan de l\'installation photovoltaïque de Tintin">' +
    '<rect class="ciel" width="1000" height="520" fill="#cfe7f5"/>' +
    '<circle class="astre-soleil" cx="70" cy="70" r="30" fill="#f4c430" stroke="#1b1a17" stroke-width="3"/>' +
    '<g class="astre-lune"><circle cx="70" cy="70" r="26" fill="#f3efd9" stroke="#1b1a17" stroke-width="3"/><circle cx="84" cy="62" r="22" fill="#24365c"/></g>' +
    '<rect y="420" width="1000" height="100" fill="#9cc77a" stroke="#1b1a17" stroke-width="3"/>' +
    '<rect y="455" width="1000" height="65" fill="#c8b48a"/>' +
    '<line x1="340" y1="20" x2="340" y2="500" stroke="#1b1a17" stroke-width="2" stroke-dasharray="8 8" opacity=".35"/>' +
    '<line x1="655" y1="20" x2="655" y2="500" stroke="#1b1a17" stroke-width="2" stroke-dasharray="8 8" opacity=".35"/>' +
    '<g class="zones-t" font-family="Arial Black,Arial,sans-serif" font-size="15" fill="#1b1a17" text-anchor="middle">' +
    '<text x="190" y="38">CHAMP PHOTOVOLTAÏQUE</text><text x="497" y="38">LOCAL TECHNIQUE</text><text x="828" y="38">MAISON DE TINTIN</text></g>' +
    /* bâtiments */
    '<rect x="360" y="200" width="280" height="220" fill="#efe6cf" stroke="#1b1a17" stroke-width="3"/>' +
    '<polygon points="350,200 650,200 640,180 360,180" fill="#8d6e4c" stroke="#1b1a17" stroke-width="3"/>' +
    '<rect x="680" y="200" width="270" height="220" fill="#f7efe0" stroke="#1b1a17" stroke-width="3"/>' +
    '<polygon points="665,205 815,110 965,205" fill="#b5523b" stroke="#1b1a17" stroke-width="3"/>' +
    '<rect x="790" y="345" width="42" height="75" fill="#8d6e4c" stroke="#1b1a17" stroke-width="3"/>' +
    /* support des panneaux */
    '<g stroke="#1b1a17" stroke-width="5" stroke-linecap="round"><line x1="70" y1="330" x2="70" y2="420"/><line x1="270" y1="330" x2="270" y2="420"/><line x1="110" y1="245" x2="110" y2="420"/><line x1="300" y1="245" x2="300" y2="300"/></g>' +
    /* câblage */
    '<g fill="none" stroke-width="4" stroke-linecap="round">' +
    '<path d="M300 300 L300 335" stroke="' + DC + '"/>' +
    '<path d="M300 395 L300 405 L372 405 L372 285 L382 285" stroke="' + DC + '"/>' +
    '<path d="M415 315 L415 350" stroke="' + DC + '"/>' +
    '<path d="M450 375 L480 375 L480 335" stroke="' + DC + '"/>' +
    '<path d="M505 320 L505 290 L545 290" stroke="' + DC + '"/>' +
    '<path d="M620 280 L700 280 L700 275 L712 275" stroke="' + AC + '"/>' +
    '<path d="M760 265 L840 265 L840 280" stroke="' + AC + '"/>' +
    '<path d="M760 300 L905 300 L905 315" stroke="' + AC + '"/>' +
    '<path d="M735 330 L735 470" stroke="' + PE + '" stroke-dasharray="10 5"/>' +
    "</g>" +
    /* trajet animé de l'énergie (boutons Le jour / La nuit) */
    '<g class="flux" fill="none" stroke-width="9" stroke-linecap="round">' +
    '<path class="jour-seul" d="M300 300 L300 335" stroke="' + DC + '"/>' +
    '<path class="jour-seul" d="M300 395 L300 405 L372 405 L372 285 L382 285" stroke="' + DC + '"/>' +
    '<path class="jour-seul" d="M415 315 L415 350" stroke="' + DC + '"/>' +
    '<path d="M450 375 L480 375 L480 335" stroke="' + DC + '"/>' +
    '<path d="M505 320 L505 290 L545 290" stroke="' + DC + '"/>' +
    '<path d="M620 280 L700 280 L700 275 L712 275" stroke="' + AC + '"/>' +
    '<path d="M760 265 L840 265 L840 280" stroke="' + AC + '"/>' +
    '<path d="M760 300 L905 300 L905 315" stroke="' + AC + '"/>' +
    "</g>" +
    /* pièces */
    piece("panneaux", 1, '<rect class="halo" x="30" y="225" width="300" height="115" rx="8"/>',
      '<polygon points="40,330 280,330 320,245 80,245" fill="#1f3f78" stroke="#1b1a17" stroke-width="4"/>' +
      '<g stroke="#8fb6e6" stroke-width="2"><line x1="120" y1="330" x2="160" y2="245"/><line x1="200" y1="330" x2="240" y2="245"/><line x1="60" y1="288" x2="300" y2="288"/></g>', 330, 240) +
    piece("cables-pv", 2, '<rect class="halo" x="285" y="292" width="32" height="50" rx="6"/>',
      '<path d="M300 300 L300 335" stroke="' + DC + '" stroke-width="7" fill="none"/><rect x="292" y="312" width="16" height="10" fill="#1b1a17"/>', 322, 300) +
    piece("coffret-dc", 3, '<rect class="halo" x="270" y="330" width="62" height="72" rx="6"/>',
      '<rect x="278" y="337" width="46" height="58" fill="#e9e4d6" stroke="#1b1a17" stroke-width="3"/><rect x="286" y="347" width="10" height="16" fill="#1b1a17"/><rect x="304" y="347" width="10" height="16" fill="#c0392b"/><line x1="286" y1="378" x2="314" y2="378" stroke="#1b1a17" stroke-width="3"/>', 332, 334) +
    piece("regulateur", 4, '<rect class="halo" x="376" y="248" width="80" height="74" rx="6"/>',
      '<rect x="382" y="254" width="68" height="62" fill="#2b2b2b" stroke="#1b1a17" stroke-width="3"/><rect x="392" y="264" width="48" height="16" fill="#9fd3a8"/><text x="416" y="303" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">MPPT</text>', 452, 250) +
    piece("batterie", 5, '<rect class="halo" x="374" y="344" width="84" height="72" rx="6"/>',
      '<rect x="380" y="350" width="72" height="60" fill="#3d6fb0" stroke="#1b1a17" stroke-width="3"/><g stroke="#1b1a17" stroke-width="2"><line x1="398" y1="350" x2="398" y2="410"/><line x1="416" y1="350" x2="416" y2="410"/><line x1="434" y1="350" x2="434" y2="410"/></g><rect x="386" y="344" width="8" height="6" fill="#1b1a17"/><rect x="438" y="344" width="8" height="6" fill="#c0392b"/>', 454, 346) +
    piece("protection-batt", 6, '<rect class="halo" x="464" y="316" width="36" height="44" rx="6"/>',
      '<rect x="470" y="322" width="24" height="32" fill="#f4c430" stroke="#1b1a17" stroke-width="3"/><line x1="476" y1="338" x2="488" y2="338" stroke="#1b1a17" stroke-width="3"/>', 500, 318) +
    piece("onduleur", 7, '<rect class="halo" x="538" y="236" width="90" height="96" rx="6"/>',
      '<rect x="545" y="243" width="76" height="82" fill="#f2f2f2" stroke="#1b1a17" stroke-width="3"/><path d="M558 275 h16 M582 275 q7 -10 14 0 t14 0" stroke="#1b1a17" stroke-width="3" fill="none"/><text x="583" y="310" font-size="11" font-weight="800" text-anchor="middle" font-family="Arial">DC/AC</text>', 625, 240) +
    piece("tableau", 8, '<rect class="halo" x="704" y="244" width="62" height="92" rx="6"/>',
      '<rect x="710" y="250" width="50" height="80" fill="#fff" stroke="#1b1a17" stroke-width="3"/><g fill="#1b1a17"><rect x="717" y="260" width="8" height="18"/><rect x="730" y="260" width="8" height="18"/><rect x="743" y="260" width="8" height="18"/></g><rect x="717" y="292" width="34" height="20" fill="#5b8fd6" stroke="#1b1a17" stroke-width="2"/>', 765, 248) +
    piece("eclairage", 9, '<rect class="halo" x="818" y="268" width="44" height="52" rx="6"/>',
      '<line x1="840" y1="280" x2="840" y2="290" stroke="#1b1a17" stroke-width="3"/><circle cx="840" cy="302" r="13" fill="#fff6c2" stroke="#1b1a17" stroke-width="3"/>', 862, 270) +
    piece("froid", 10, '<rect class="halo" x="876" y="308" width="58" height="108" rx="6"/>',
      '<rect x="882" y="315" width="46" height="98" rx="4" fill="#e8eef5" stroke="#1b1a17" stroke-width="3"/><line x1="882" y1="350" x2="928" y2="350" stroke="#1b1a17" stroke-width="3"/><line x1="920" y1="325" x2="920" y2="340" stroke="#1b1a17" stroke-width="3"/>', 932, 312) +
    piece("terre", 11, '<rect class="halo" x="718" y="455" width="36" height="58" rx="6"/>',
      '<line x1="735" y1="462" x2="735" y2="505" stroke="#6b665c" stroke-width="7"/><path d="M724 470 h22 M727 478 h16 M730 486 h10" stroke="' + PE + '" stroke-width="3"/>', 756, 462) +
    /* légende */
    '<g font-family="Arial" font-size="13" font-weight="700"><rect x="16" y="470" width="290" height="40" fill="#fff" stroke="#1b1a17" stroke-width="2"/>' +
    '<line x1="28" y1="490" x2="56" y2="490" stroke="' + DC + '" stroke-width="5"/><text x="62" y="494">continu</text>' +
    '<line x1="122" y1="490" x2="150" y2="490" stroke="' + AC + '" stroke-width="5"/><text x="156" y="494">alternatif</text>' +
    '<line x1="230" y1="490" x2="258" y2="490" stroke="' + PE + '" stroke-width="5" stroke-dasharray="8 4"/><text x="264" y="494">terre</text></g>' +
    "</svg>";
  function piece(id, n, halo, corps, px, py) {
    var p = V.pieces.filter(function (x) { return x.id === id; })[0];
    return '<g class="piece" data-id="' + id + '" data-zone="' + p.zone + '" tabindex="0" role="button" aria-label="' + esc(p.nom) + '">' + halo + corps +
      '<circle class="pastille" cx="' + px + '" cy="' + py + '" r="21"/><text class="pastille-t" x="' + px + '" y="' + (py + 8) + '" text-anchor="middle" font-size="23" font-weight="800" font-family="Arial, Helvetica, sans-serif" fill="#1b1a17">' + n + "</text></g>";
  }
  function panneauEclateSVG() {
    var h = '<svg viewBox="0 0 640 520" role="group" aria-label="Panneau photovoltaïque en vue éclatée"><rect width="640" height="520" fill="#f6f1e4"/>';
    var styles = {
      verre: ['#d8f0fa', 0.85], eva1: ['#fbfbf3', 0.9], cellules: ['#1f3f78', 1], eva2: ['#fbfbf3', 0.9],
      arriere: ['#ffffff', 1], cadre: ['#b8bec7', 1]
    };
    var couches = V.couches;
    couches.forEach(function (c, i) {
      if (c.id === "boite" || c.id === "mc4") return;
      var y = 70 + i * 58, x = 60;
      var pts = [x, y + 40, x + 300, y + 40, x + 360, y, x + 60, y].join(",");
      h += '<g class="piece" data-id="' + c.id + '" tabindex="0" role="button" aria-label="' + esc(c.nom) + '">' +
        '<polygon class="halo" points="' + pts + '"/>' +
        '<polygon points="' + pts + '" fill="' + styles[c.id][0] + '" fill-opacity="' + styles[c.id][1] + '" stroke="#1b1a17" stroke-width="3"/>';
      if (c.id === "cellules") {
        for (var k = 1; k < 6; k++) h += '<line x1="' + (x + k * 50) + '" y1="' + (y + 40) + '" x2="' + (x + 60 + k * 50) + '" y2="' + y + '" stroke="#8fb6e6" stroke-width="2"/>';
        h += '<line x1="' + (x + 30) + '" y1="' + (y + 20) + '" x2="' + (x + 330) + '" y2="' + (y + 20) + '" stroke="#8fb6e6" stroke-width="2"/>';
      }
      if (c.id === "cadre") h += '<polygon points="' + [x + 14, y + 33, x + 290, y + 33, x + 338, y + 7, x + 62, y + 7].join(",") + '" fill="#f6f1e4" stroke="#1b1a17" stroke-width="2"/>';
      h += '<line x1="' + (x + 362) + '" y1="' + (y + 20) + '" x2="470" y2="' + (y + 20) + '" stroke="#1b1a17" stroke-width="1.5" stroke-dasharray="4 3"/>' +
        '<text x="476" y="' + (y + 25) + '" font-family="Arial" font-size="14" font-weight="700">' + esc(c.nom.replace(/ \(EVA\)/, "")) + "</text></g>";
    });
    var yb = 70 + 6 * 58 + 10;
    h += '<g class="piece" data-id="boite" tabindex="0" role="button" aria-label="Boîte de jonction et diodes bypass"><rect class="halo" x="150" y="' + yb + '" width="120" height="56" rx="6"/>' +
      '<rect x="160" y="' + (yb + 8) + '" width="100" height="40" fill="#2b2b2b" stroke="#1b1a17" stroke-width="3"/>' +
      '<path d="M178 ' + (yb + 28) + ' l14 -8 v16 z M192 ' + (yb + 20) + ' v16" stroke="#f4c430" stroke-width="2.5" fill="#f4c430"/>' +
      '<path d="M218 ' + (yb + 28) + ' l14 -8 v16 z M232 ' + (yb + 20) + ' v16" stroke="#f4c430" stroke-width="2.5" fill="#f4c430"/>' +
      '<text x="476" y="' + (yb + 33) + '" font-family="Arial" font-size="14" font-weight="700">Boîte de jonction + diodes</text>' +
      '<line x1="262" y1="' + (yb + 28) + '" x2="470" y2="' + (yb + 28) + '" stroke="#1b1a17" stroke-width="1.5" stroke-dasharray="4 3"/></g>';
    h += '<g class="piece" data-id="mc4" tabindex="0" role="button" aria-label="Câbles et connecteurs"><rect class="halo" x="270" y="' + (yb + 50) + '" width="190" height="44" rx="6"/>' +
      '<path d="M200 ' + (yb + 48) + ' q30 40 90 30 h60" stroke="#1b1a17" stroke-width="4" fill="none"/><path d="M240 ' + (yb + 48) + ' q20 26 70 30 h60" stroke="#c0392b" stroke-width="4" fill="none"/>' +
      '<rect x="350" y="' + (yb + 70) + '" width="24" height="12" fill="#1b1a17"/><rect x="370" y="' + (yb + 70) + '" width="24" height="12" fill="#1b1a17"/></g>';
    return h + "</svg>";
  }

  function plan(el) {
    var vues = {};
    var total = V.pieces.length;
    el.innerHTML = '<div style="display:grid;gap:12px">' +
      bulleIntro() +
      '<div class="plan-zones" role="group" aria-label="Choisir une vue"><button type="button" data-vue="tout" aria-pressed="true">Toute l\'installation</button>' +
      V.zones.map(function (z) { return '<button type="button" data-vue="' + z.id + '" aria-pressed="false">' + esc(z.nom) + "</button>"; }).join("") +
      '<button type="button" data-vue="panneau" aria-pressed="false">Zoom sur un panneau</button></div>' +
      '<div class="plan-zones" role="group" aria-label="Trajet de l\'énergie"><span class="plan-label">Trajet de l\'énergie :</span>' +
      '<button type="button" data-flux="jour" aria-pressed="false">Le jour</button><button type="button" data-flux="nuit" aria-pressed="false">La nuit</button></div>' +
      '<div class="plan-grille"><div class="plan-scene" data-scene>' + PLAN_SVG + '</div><aside class="fiche" aria-live="polite" data-fiche></aside></div>' +
      '<div data-flux-texte></div><p class="compteur">Pièces découvertes : <b data-compte>0</b> / ' + total + ' · <a href="#s1-1-quiz">Passer au quiz</a></p></div>';
    function bulleIntro() {
      return bulle("Voici l'installation complète de Tintin, en trois zones. <strong>Cliquez sur chaque pièce numérotée</strong> : elle s'allume et sa fiche s'ouvre. Les pastilles jaunes deviennent vertes quand vous les avez vues.");
    }
    var scene = el.querySelector("[data-scene]"), fiche = el.querySelector("[data-fiche]");
    function ficheVide() {
      fiche.innerHTML = '<span class="zone-nom">Fiche de la pièce</span><h4>Cliquez sur une pièce</h4><p>Commencez par les panneaux (n° 1), puis suivez les numéros jusqu\'à la prise de terre (n° 11).</p>';
    }
    var SANS_PHOTO = ["tableau", "terre", "eclairage", "froid", "panneaux", "cables-pv", "batterie", "onduleur", "protection-batt", "regulateur", "coffret-dc"];
    function photo(id) {
      if (SANS_PHOTO.indexOf(id) >= 0) return "";
      return '<div class="photo"><img src="images/pieces/' + id + '.jpg" alt="Photo réelle" onerror="this.parentNode.innerHTML=\'Photo réelle à ajouter :<br><code>images/pieces/' + id + '.jpg</code>\'"></div>';
    }
    function montrer(id) {
      var p = V.pieces.filter(function (x) { return x.id === id; })[0];
      var c = V.couches.filter(function (x) { return x.id === id; })[0];
      scene.querySelectorAll(".piece").forEach(function (g) { g.classList.toggle("choisie", g.getAttribute("data-id") === id); });
      if (p) {
        vues[id] = true;
        var g = scene.querySelector('[data-id="' + id + '"]'); if (g) g.classList.add("vue");
        var z = V.zones.filter(function (x) { return x.id === p.zone; })[0];
        fiche.innerHTML = '<span class="zone-nom">' + esc(z.nom) + " · " + esc(z.courant) + "</span><h4>" + esc(p.nom) + "</h4><dl><dt>Définition</dt><dd>" + esc(p.definition) +
          "</dd><dt>À quoi ça sert</dt><dd>" + esc(p.role) + "</dd></dl>" + (p.astuce ? bulle(esc(p.astuce)) : "") + photo(id);
        el.querySelector("[data-compte]").textContent = Object.keys(vues).length;
      } else if (c) {
        fiche.innerHTML = '<span class="zone-nom">Intérieur du panneau</span><h4>' + esc(c.nom) + "</h4><dl><dt>À quoi ça sert</dt><dd>" + esc(c.role) + "</dd></dl>" + photo(id);
      }
    }
    function brancher() {
      scene.querySelectorAll(".piece").forEach(function (g) {
        g.addEventListener("click", function () { montrer(g.getAttribute("data-id")); });
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); montrer(g.getAttribute("data-id")); } });
        if (vues[g.getAttribute("data-id")]) g.classList.add("vue");
      });
    }
    var TEXTES_FLUX = {
      jour: "<strong>Le jour</strong> : les panneaux produisent du courant continu. Le régulateur charge la batterie, et l'onduleur transforme le continu en alternatif pour la maison.",
      nuit: "<strong>La nuit</strong> : les panneaux ne produisent plus. La batterie fournit du courant continu à l'onduleur, qui alimente toujours la maison en alternatif."
    };
    function flux(mode) {
      scene.classList.remove("jour", "nuit");
      if (mode) scene.classList.add(mode);
      el.querySelectorAll("[data-flux]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-flux") === mode)); });
      el.querySelector("[data-flux-texte]").innerHTML = mode ? bulle(TEXTES_FLUX[mode] + " En bleu le continu, en rouge l'alternatif.") : "";
    }
    el.querySelectorAll("[data-flux]").forEach(function (b) {
      b.addEventListener("click", function () {
        var m = b.getAttribute("data-flux");
        if (!scene.querySelector('[data-id="onduleur"]')) el.querySelector('[data-vue="tout"]').click();
        flux(scene.classList.contains(m) ? null : m);
      });
    });
    el.querySelectorAll("[data-vue]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-vue");
        el.querySelectorAll("[data-vue]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        if (v === "panneau") { flux(null); scene.innerHTML = panneauEclateSVG(); brancher(); fiche.innerHTML = '<span class="zone-nom">Zoom sur un panneau</span><h4>Un panneau, couche par couche</h4><p>Cliquez sur chaque couche pour découvrir son rôle.</p>'; return; }
        if (!scene.querySelector('[data-id="onduleur"]')) { scene.innerHTML = PLAN_SVG; brancher(); ficheVide(); }
        scene.querySelectorAll(".piece").forEach(function (g) { g.classList.toggle("attenue", v !== "tout" && g.getAttribute("data-zone") !== v); });
      });
    });
    brancher(); ficheVide();
  }

  /* ---------------- Quiz des pièces ---------------- */
  function quizPieces(el) {
    var qs = V.quizPieces, i = 0, score = 0;
    function afficher() {
      if (i >= qs.length) {
        var msg = score === qs.length ? "Parfait ! Vous connaissez toutes les pièces. Tintin est entre de bonnes mains." :
          score >= qs.length / 2 ? "Bien joué ! Revoyez les pièces où vous avez hésité dans le plan." : "Pas de panique : retournez explorer le plan, puis retentez le quiz.";
        el.innerHTML = '<div class="quiz"><div class="progression"><i style="width:100%"></i></div>' + bulle("<strong>" + score + " / " + qs.length + "</strong>. " + msg) +
          '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="button" data-rejouer>Recommencer</button><a class="btn leger" href="#s1-1-plan">Revoir le plan</a></div></div>';
        el.querySelector("[data-rejouer]").onclick = function () { i = 0; score = 0; afficher(); };
        return;
      }
      var q = qs[i];
      el.innerHTML = '<div class="quiz"><div class="progression" aria-hidden="true"><i style="width:' + (i / qs.length * 100) + '%"></i></div><p class="compteur">Question ' + (i + 1) + " / " + qs.length + '</p><p class="quiz-q">' + esc(q.q) + '</p><div class="choix">' +
        q.choix.map(function (c, k) { return '<button type="button" data-k="' + k + '">' + esc(c) + "</button>"; }).join("") + '</div><div data-retour></div></div>';
      el.querySelectorAll("[data-k]").forEach(function (b) {
        b.onclick = function () {
          var k = +b.getAttribute("data-k");
          el.querySelectorAll("[data-k]").forEach(function (x) { x.disabled = true; if (+x.getAttribute("data-k") === q.bon) x.classList.add("bon"); });
          if (k === q.bon) score++; else b.classList.add("faux");
          el.querySelector("[data-retour]").innerHTML = bulle((k === q.bon ? "<strong>Exact !</strong> " : "<strong>Pas tout à fait.</strong> ") + esc(q.expl)) +
            '<div style="margin-top:10px"><button class="btn" type="button" data-suite>' + (i < qs.length - 1 ? "Question suivante" : "Voir mon score") + "</button></div>";
          el.querySelector("[data-suite]").onclick = function () { i++; afficher(); };
        };
      });
    }
    afficher();
  }

  /* ---------------- Remettre dans l'ordre ---------------- */
  function ordre(el) {
    var O = V.ordreChaine, items;
    function init() { do { items = melange(O.elements); } while (items.every(function (x, k) { return x === O.elements[k]; })); dessiner(false); }
    function dessiner(ok) {
      el.innerHTML = '<div class="case" style="border-style:dashed"><h2><span class="etiquette">Jeu</span>Remettre la chaîne d\'énergie dans l\'ordre</h2>' + bulle(esc(O.consigne)) +
        '<ol class="ordre' + (ok ? " reussi" : "") + '">' + items.map(function (x, k) {
          return '<li draggable="' + !ok + '" data-k="' + k + '"><span class="poignee" aria-hidden="true">⋮⋮</span><span class="etiq">' + (k + 1) + ". " + esc(x.nom) + "</span>" +
            (ok ? '<span class="courant" style="background:' + (x.courant === "AC" ? "#f8d7d3" : x.courant === "DC" ? "#dcebf7" : "#fff3b8") + '">' + x.courant + "</span>" :
              '<button type="button" class="monte" aria-label="Monter" data-m="' + k + '">' + CHEVRON_HAUT + '</button><button type="button" class="descend" aria-label="Descendre" data-d="' + k + '">' + CHEVRON_BAS + '</button>') + "</li>";
        }).join("") + "</ol>" +
        (ok ? bulle("<strong>" + esc(O.bravo) + "</strong>") : '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn" type="button" data-verif>Vérifier</button><span class="retour" data-ret></span></div>') + "</div>";
      if (ok) return;
      var src = null;
      el.querySelectorAll("li").forEach(function (li) {
        li.addEventListener("dragstart", function () { src = +li.getAttribute("data-k"); li.classList.add("glisse"); });
        li.addEventListener("dragend", function () { li.classList.remove("glisse"); });
        li.addEventListener("dragover", function (e) { e.preventDefault(); });
        li.addEventListener("drop", function (e) { e.preventDefault(); var dst = +li.getAttribute("data-k"); if (src === null || src === dst) return; var x = items.splice(src, 1)[0]; items.splice(dst, 0, x); dessiner(false); });
      });
      el.querySelectorAll("[data-m]").forEach(function (b) { b.onclick = function () { var k = +b.getAttribute("data-m"); if (k > 0) { var t = items[k - 1]; items[k - 1] = items[k]; items[k] = t; dessiner(false); } }; });
      el.querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { var k = +b.getAttribute("data-d"); if (k < items.length - 1) { var t = items[k + 1]; items[k + 1] = items[k]; items[k] = t; dessiner(false); } }; });
      el.querySelector("[data-verif]").onclick = function () {
        var bons = items.filter(function (x, k) { return x === O.elements[k]; }).length;
        if (bons === items.length) dessiner(true);
        else { var r = el.querySelector("[data-ret]"); r.className = "retour ko"; r.textContent = bons + " étiquette" + (bons > 1 ? "s" : "") + " sur " + items.length + " à la bonne place. Réessayez !"; }
      };
    }
    init();
  }

  /* ---------------- Panneau virtuel (S1.2, Q12) ---------------- */
  function panneauVirtuel(el) {
    var herbe = (function () {
      var s = "", seed = 7; function r() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
      var d1 = "", d2 = "";
      for (var k = 0; k < 140; k++) {
        var x = 4 + r() * 792, y = 286 + r() * 50, h = (5 + r() * 6) * (0.7 + 0.6 * (y - 280) / 60), l = (r() - 0.5) * 8, dark = r() < 0.55;
        for (var dx = -3; dx <= 3; dx += 3) { var p = "M" + (x + dx).toFixed(1) + " " + y.toFixed(1) + "q" + (l / 2).toFixed(1) + " " + (-h / 2).toFixed(1) + " " + (l + dx * 0.8).toFixed(1) + " " + (-h).toFixed(1); if (dark) d1 += p; else d2 += p; }
      }
      s += '<path d="' + d1 + '" fill="none" stroke="#3f7a2e" stroke-width="1.6" stroke-linecap="round"/><path d="' + d2 + '" fill="none" stroke="#b9dc8f" stroke-width="1.4" stroke-linecap="round"/>';
      return s;
    })();
    el.innerHTML = '<div class="case" style="border-style:dashed;background:var(--papier)"><h2><span class="etiquette">Interactif</span>Le panneau virtuel de Tournesol</h2>' +
      bulle("<strong>Attrapez le soleil et faites-le glisser dans le ciel.</strong> Observez le voltmètre et l'ampèremètre, notez deux essais, puis recopiez-les dans le tableau de votre feuille.") +
      '<div class="pv-case"><div class="pv-astuce">☀ Faites glisser le soleil</div><button class="btn pv-reset" type="button" data-reset>Remettre le soleil</button><svg viewBox="0 0 800 340" data-svg role="img" aria-label="Soleil déplaçable au-dessus d\'un panneau photovoltaïque">' +
      '<rect data-ciel width="800" height="340" fill="#bfe1f2"/><path d="M60 280 Q400 -120 740 280" fill="none" stroke="#1b1a17" stroke-width="2" stroke-dasharray="6 8" opacity=".35"/>' +
      // Soleil dessiné avant le sol et le panneau : il passe derrière eux
      '<g data-rayons stroke="#e39b00" stroke-width="5" stroke-linecap="round"></g>' +
      '<g class="soleil" data-soleil tabindex="0" role="slider" aria-label="Position du soleil" aria-valuemin="50" aria-valuemax="1000"><circle data-disque r="34" fill="#f4c430" stroke="#1b1a17" stroke-width="4"/></g>' +
      '<rect y="280" width="800" height="60" fill="#8fbf6a"/><rect y="300" width="800" height="40" fill="#7fb05c"/><rect y="320" width="800" height="20" fill="#6fa04f"/>' + herbe +
      '<line x1="0" y1="280" x2="800" y2="280" stroke="#1b1a17" stroke-width="3"/>' +
      '<ellipse cx="610" cy="304" rx="150" ry="12" fill="#1b1a17" opacity=".18"/><g stroke="#1b1a17" stroke-width="6" stroke-linecap="round"><line x1="530" y1="178" x2="530" y2="300"/><line x1="720" y1="178" x2="720" y2="300"/><line x1="495" y1="248" x2="495" y2="302"/><line x1="680" y1="248" x2="680" y2="302"/><line x1="495" y1="290" x2="530" y2="290"/><line x1="680" y1="290" x2="720" y2="290"/></g>' +
      '<g fill="#6b665c" stroke="#1b1a17" stroke-width="2"><rect x="484" y="299" width="22" height="7"/><rect x="669" y="299" width="22" height="7"/><rect x="519" y="297" width="22" height="7"/><rect x="709" y="297" width="22" height="7"/></g>' +
      '<polygon points="470,250 700,250 740,170 510,170" fill="#1f3f78" stroke="#1b1a17" stroke-width="4" stroke-linejoin="round"/>' +
      '<g stroke="#8fb6e6" stroke-width="2"><line x1="516" y1="250" x2="556" y2="170"/><line x1="562" y1="250" x2="602" y2="170"/><line x1="608" y1="250" x2="648" y2="170"/><line x1="654" y1="250" x2="694" y2="170"/><line x1="483.3" y1="223.3" x2="713.3" y2="223.3"/><line x1="496.7" y1="196.7" x2="726.7" y2="196.7"/></g>' +
      '<polygon data-reflet points="470,250 700,250 740,170 510,170" fill="#fff" opacity="0"/><polygon points="470,250 700,250 700,258 470,258" fill="#c9ced6" stroke="#1b1a17" stroke-width="3"/>' +
      '<path d="M600 258 Q610 290 640 300" fill="none" stroke="#1b1a17" stroke-width="3"/>' +
      '<rect data-ombre width="800" height="340" fill="#1b1a17" opacity="0" pointer-events="none"/>' +
      '</svg></div>' +
      '<div class="mesures"><div class="app-mesure"><span>Éclairement</span><b data-g style="font-size:20px">—</b></div><div class="app-mesure"><span>Voltmètre</span><b data-u>—</b><span>V</span></div><div class="app-mesure"><span>Ampèremètre</span><b data-i>—</b><span>A</span></div></div>' +
      '<p style="font-size:13px;color:var(--gris)">Simulation simplifiée d\'un panneau de 300 Wc (Vmp 30,5 V ; Imp 9,82 A à 1 000 W/m²). P = U × I reste à calculer sur la feuille.</p></div>';
    var q = function (s) { return el.querySelector(s); };
    var svg = q("[data-svg]"), soleil = q("[data-soleil]"), t = 0.35, drag = false;
    function fr(n, d) { return n.toFixed(d).replace(".", ","); }
    function mix(a, b, k) { var pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)], pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)]; return "rgb(" + pa.map(function (v, j) { return Math.round(v + (pb[j] - v) * k); }).join(",") + ")"; }
    function maj() {
      var x = 60 + 680 * t, y = 280 - 800 * t * (1 - t), h = Math.sin(Math.PI * t);
      var G = Math.max(50, Math.round(1000 * Math.pow(h, 1.3) / 10) * 10), u = 30.5 + 1.6 * Math.log(G / 1000), i = 9.82 * G / 1000;
      soleil.setAttribute("transform", "translate(" + x + "," + y + ")"); soleil.setAttribute("aria-valuenow", G);
      q("[data-disque]").setAttribute("r", (22 + 14 * h).toFixed(1));
      q("[data-ombre]").setAttribute("opacity", (0.32 * (1 - G / 1000)).toFixed(2));
      q("[data-reflet]").setAttribute("opacity", (0.18 * G / 1000).toFixed(2));
      q("[data-ciel]").setAttribute("fill", mix("#f2c9a0", "#bfe1f2", h));
      var s = "", r1 = 30 + 14 * h, r2 = r1 + 8 + 12 * G / 1000;
      for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; s += '<line x1="' + (x + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (y + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (x + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (y + r2 * Math.sin(a)).toFixed(1) + '"/>'; }
      q("[data-rayons]").innerHTML = s;
      q("[data-g]").textContent = G + " W/m²"; q("[data-u]").textContent = fr(u, 1); q("[data-i]").textContent = fr(i, 2);
    }
    function versT(e) { var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; var l = pt.matrixTransform(svg.getScreenCTM().inverse()); t = Math.min(1, Math.max(0, (l.x - 60) / 680)); maj(); }
    soleil.addEventListener("pointerdown", function (e) { drag = true; try { svg.setPointerCapture(e.pointerId); } catch (_) {} versT(e); e.preventDefault(); });
    // Un clic n'importe où (même sur le panneau, quand le soleil est derrière) attrape le soleil
    svg.addEventListener("pointerdown", function (e) { if (drag) return; drag = true; try { svg.setPointerCapture(e.pointerId); } catch (_) {} versT(e); e.preventDefault(); });
    q("[data-reset]").addEventListener("click", function () { t = 0.35; maj(); });
    svg.addEventListener("pointermove", function (e) { if (drag) versT(e); });
    window.addEventListener("pointerup", function () { drag = false; });
    soleil.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { t = Math.min(1, t + 0.02); maj(); e.preventDefault(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { t = Math.max(0, t - 0.02); maj(); e.preventDefault(); }
    });
    maj();
  }


  /* ---------------- Simulateur Modbus TCP (séance 3.3, complément V3B) ----------------
     Faux client Modbus : rien ne sort sur le réseau, tout est simulé dans la page.
     Les valeurs sont celles de la fiche fictive du support : serveur 192.168.10.20, port 502,
     identifiant 1, fonction 03, adresse protocole 100, valeur 512 (échelle 0,1 V). */
  function modbus(el) {
    var REGISTRES = { 98: 0, 99: 23, 100: 512, 101: 0, 102: 41 };
    function champ(id, label, val, aide) {
      return '<label class="mb-champ"><span>' + label + '</span><input data-mb="' + id + '" value="' + val + '" autocomplete="off" spellcheck="false">' + (aide ? "<small>" + aide + "</small>" : "") + "</label>";
    }
    el.innerHTML = '<div class="case" style="border-style:dashed;background:var(--papier)"><h2><span class="etiquette">Interactif</span>Le simulateur Modbus de Tournesol</h2>' +
      bulle("<strong>Rien ne part sur un vrai réseau : tout est simulé.</strong> Recopiez les paramètres de la fiche dans le logiciel, puis cliquez sur <strong>Lire</strong>. Notez la valeur brute et calculez la tension sur votre feuille.") +
      '<div class="mb-fenetre"><div class="mb-barre"><span class="mb-points"><i></i><i></i><i></i></span>Client Modbus TCP · poste 192.168.10.10</div>' +
      '<div class="mb-corps"><div class="mb-form">' +
      '<fieldset><legend>Connexion</legend>' + champ("ip", "Adresse IP du serveur", "", "") + champ("port", "Port", "", "") + champ("id", "Identifiant (Unit ID)", "", "") + "</fieldset>" +
      '<fieldset><legend>Requête</legend><label class="mb-champ"><span>Fonction</span><select data-mb="fct">' +
      '<option value="">Choisir…</option><option value="01">01 · Lire des bobines</option><option value="03">03 · Lire des registres de maintien</option><option value="04">04 · Lire des registres d\'entrée</option><option value="06">06 · Écrire un registre</option></select></label>' +
      champ("adr", "Adresse du registre", "", "") +
      '<label class="mb-champ"><span>Numérotation des registres</span><select data-mb="base"><option value="0">À partir de 0 (adresse protocole)</option><option value="1">À partir de 1</option></select></label>' +
      "</fieldset>" +
      '<div class="mb-actions"><button class="btn" type="button" data-mb-lire>Lire</button><button class="btn leger" type="button" data-mb-effacer>Effacer le journal</button></div></div>' +
      '<div class="mb-resultat"><div class="mb-valeur"><span>Valeur brute lue</span><b data-mb-val>—</b></div>' +
      '<div class="mb-journal" data-mb-journal aria-live="polite"><p class="mb-gris">Journal des échanges : rien pour l\'instant.</p></div></div></div></div>' +
      '<p style="font-size:13px;color:var(--gris)">Simulateur pédagogique : il ne se connecte à aucun appareil. La carte de registres est fictive, comme dans le support.</p></div>';
    var q = function (x) { return el.querySelector(x); };
    function v(id) { return q('[data-mb="' + id + '"]').value.trim(); }
    function log(txt, cls) {
      var j = q("[data-mb-journal]"), g = j.querySelector(".mb-gris");
      if (g) g.remove();
      var heure = new Date().toTimeString().slice(0, 8);
      j.insertAdjacentHTML("beforeend", '<p class="' + (cls || "") + '"><span class="mb-heure">' + heure + "</span> " + txt + "</p>");
      j.scrollTop = j.scrollHeight;
    }
    q("[data-mb-effacer]").addEventListener("click", function () {
      q("[data-mb-journal]").innerHTML = '<p class="mb-gris">Journal des échanges : rien pour l\'instant.</p>'; q("[data-mb-val]").textContent = "—";
    });
    q("[data-mb-lire]").addEventListener("click", function () {
      var ip = v("ip"), port = v("port"), id = v("id"), fct = v("fct"), adr = v("adr"), base = +v("base");
      var val = q("[data-mb-val]"); val.textContent = "—";
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip) || ip.split(".").some(function (n) { return +n > 255; })) { log("Adresse IP incomplète ou mal écrite : « " + esc(ip) + " ». Il faut 4 nombres de 0 à 255 séparés par des points.", "mb-ko"); return; }
      if (!port || !id || !fct || adr === "") { log("Paramètres incomplets : remplissez le port, l'identifiant, la fonction et l'adresse.", "mb-ko"); return; }
      log("Connexion à " + esc(ip) + " port " + esc(port) + "…");
      if (ip.indexOf("192.168.10.") !== 0) { log("Échec : " + esc(ip) + " n'est pas sur le même réseau que le poste (192.168.10.x, masque 255.255.255.0).", "mb-ko"); return; }
      if (ip === "192.168.10.10") { log("Échec : 192.168.10.10 est l'adresse de ce poste, pas celle de l'automate.", "mb-ko"); return; }
      if (ip !== "192.168.10.20") { log("Pas de réponse (délai dépassé). Aucun appareil ne répond à cette adresse.", "mb-ko"); return; }
      if (port !== "502") { log("Connexion refusée : l'automate n'écoute pas sur le port " + esc(port) + ".", "mb-ko"); return; }
      log("Connecté à l'automate.", "mb-ok");
      if (id !== "1") { log("Pas de réponse de l'identifiant " + esc(id) + ".", "mb-ko"); return; }
      if (fct === "06") { log("Écriture refusée : cet exercice se fait en lecture seule. Ne jamais modifier un réglage sans autorisation.", "mb-ko"); return; }
      if (fct !== "03") { log("Exception 01 : fonction " + fct + " non prise en charge pour cette mesure.", "mb-ko"); return; }
      if (!/^\d+$/.test(adr)) { log("Adresse du registre invalide.", "mb-ko"); return; }
      var proto = +adr - base;
      if (!(proto in REGISTRES)) { log("Exception 02 : l'adresse protocole " + proto + " n'existe pas sur cet automate.", "mb-ko"); return; }
      val.textContent = REGISTRES[proto];
      log("Lecture fonction 03, adresse protocole " + proto + (base ? " (vous avez tapé " + esc(adr) + ", numérotation à partir de 1)" : "") + " : valeur brute <strong>" + REGISTRES[proto] + "</strong>.", "mb-ok");
    });
  }

  /* ---------------- Simulateur de CPI (mise à la terre, activité IT, exercice V3) ----------------
     Repris de la page « Simulation pédagogique du CPI » fournie par l'enseignant : un seuil unique,
     l'alarme s'active si l'isolement est strictement inférieur au seuil. Ne commande aucun appareil. */
  function cpi(el) {
    var n = 0;
    el.innerHTML = '<div class="case" style="border-style:dashed;background:var(--papier)"><h2><span class="etiquette">Interactif</span>Le simulateur de CPI</h2>' +
      '<p>Paramétrez le seuil, puis testez successivement <strong>80, 40 et 18 kΩ</strong>. Expliquez ce que doit faire l\'équipe de maintenance.</p>' +
      '<div class="mb-fenetre"><div class="mb-barre"><span class="mb-points"><i></i><i></i><i></i></span>Contrôleur permanent d\'isolement · simulation</div>' +
      '<div class="mb-corps"><div class="mb-form"><fieldset><legend>Réglage et essai</legend>' +
      '<label class="mb-champ"><span>Seuil d\'alarme (kΩ)</span><input data-cpi="seuil" type="number" min="0.1" step="0.1" inputmode="decimal"></label>' +
      '<label class="mb-champ"><span>Résistance d\'isolement simulée (kΩ)</span><input data-cpi="iso" type="number" min="0" step="0.1" inputmode="decimal"></label></fieldset>' +
      '<div class="mb-actions"><button class="btn" type="button" data-cpi-test>Tester</button><button class="btn leger" type="button" data-cpi-effacer>Effacer le tableau</button></div>' +
      '<div class="cpi-etat" data-cpi-etat role="status" aria-live="polite">Prêt : lancez un essai.</div></div>' +
      '<div class="mb-resultat"><p style="margin:0">L\'alarme s\'active si l\'isolement est <strong>strictement inférieur</strong> au seuil. Le CPI signale le défaut ; dans ce modèle il ne coupe pas l\'alimentation.</p></div></div>' +
      '<div class="cpi-journal"><b>Compte rendu des essais</b><div class="tableau"><table><thead><tr><th>Essai</th><th>Seuil</th><th>Isolement</th><th>État</th></tr></thead><tbody data-cpi-journal></tbody></table></div></div></div>' +
      '<p style="font-size:13px;color:var(--gris)">Modèle pédagogique à seuil unique. Ce simulateur ne commande aucun appareil. Le seuil de 50 kΩ est une consigne d\'exercice, pas un réglage universel. La possibilité de maintenir le fonctionnement au premier défaut dépend aussi de la condition sur la tension de contact et de l\'ensemble des protections. L\'absence d\'alarme ici ne valide pas une installation réelle.</p></div>';
    var q = function (x) { return el.querySelector(x); };
    var etat = q("[data-cpi-etat]");
    q("[data-cpi-test]").addEventListener("click", function () {
      var vs = q('[data-cpi="seuil"]').value.replace(",", "."), vr = q('[data-cpi="iso"]').value.replace(",", ".");
      var s = Number(vs), r = Number(vr);
      if (!vs || !vr || !isFinite(s) || !isFinite(r) || s <= 0 || r < 0) { etat.className = "cpi-etat"; etat.textContent = "Saisissez un seuil positif et une résistance supérieure ou égale à zéro."; return; }
      var alarme = r < s, lib = alarme ? "ALARME : rechercher le défaut" : "Pas d'alarme au seuil choisi";
      etat.className = "cpi-etat " + (alarme ? "alarme" : "ok"); etat.textContent = lib;
      q("[data-cpi-journal]").insertAdjacentHTML("beforeend", "<tr><td>" + (++n) + "</td><td>" + s + " kΩ</td><td>" + r + " kΩ</td><td>" + lib + "</td></tr>");
    });
    q("[data-cpi-effacer]").addEventListener("click", function () { q("[data-cpi-journal]").innerHTML = ""; n = 0; etat.className = "cpi-etat"; etat.textContent = "Prêt : lancez un essai."; });
  }

  window.COMPOSANTS = { plan: plan, "quiz-pieces": quizPieces, ordre: ordre, "panneau-virtuel": panneauVirtuel, modbus: modbus, cpi: cpi };
})();
