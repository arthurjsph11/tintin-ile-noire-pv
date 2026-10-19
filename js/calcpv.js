/* Simulateur « CalcPV Autonome » hors ligne (TP 2, séance 2.1, questions 10 à 18).
   Il imite le formulaire du site CalcPV : besoins, lieu, panneaux, période, batterie, puis calcul.
   Données solaires : moyennes mensuelles approchées sur plan horizontal (kWh/m²/jour, ordre de grandeur PVGIS),
   transposées sur le plan des panneaux (modèle isotrope, diffus d'Erbs, albédo 0,2). */
(function () {
  var LIEUX = [
    { id: "ile-or", nom: "Île d'Or (Le Dramont, Saint-Raphaël, France)", lat: 43.41, lon: 6.85, H: [2.0, 2.9, 4.3, 5.5, 6.6, 7.4, 7.5, 6.5, 5.0, 3.4, 2.2, 1.7] },
    { id: "cotonou", nom: "Cotonou (Bénin)", lat: 6.37, lon: 2.43, H: [5.0, 5.3, 5.4, 5.3, 5.0, 4.3, 4.3, 4.4, 4.6, 5.0, 5.2, 4.9] },
    { id: "porto-novo", nom: "Porto-Novo (Bénin)", lat: 6.50, lon: 2.60, H: [5.0, 5.3, 5.4, 5.3, 5.0, 4.4, 4.3, 4.4, 4.6, 5.0, 5.2, 4.9] },
    { id: "parakou", nom: "Parakou (Bénin)", lat: 9.34, lon: 2.63, H: [5.4, 5.8, 5.9, 5.8, 5.6, 5.1, 4.6, 4.4, 4.8, 5.3, 5.5, 5.3] },
    { id: "natitingou", nom: "Natitingou (Bénin)", lat: 10.30, lon: 1.38, H: [5.5, 5.9, 6.0, 5.9, 5.7, 5.2, 4.7, 4.4, 4.8, 5.4, 5.6, 5.4] }
  ];
  var ORIENT = [["Sud", 0], ["Sud-Est", -45], ["Sud-Ouest", 45], ["Est", -90], ["Ouest", 90], ["Nord-Est", -135], ["Nord-Ouest", 135], ["Nord", 180]];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var MODULES = [
    { id: "100", nom: "Module 100 Wc", pc: 100, voc: 22.5, isc: 5.8, vmp: 18.5 },
    { id: "250", nom: "Module 250 Wc", pc: 250, voc: 37.6, isc: 8.6, vmp: 30.2 },
    { id: "300", nom: "Module 300 Wc", pc: 300, voc: 35.5, isc: 11.1, vmp: 30.5 },
    { id: "400", nom: "Module 400 Wc", pc: 400, voc: 49.5, isc: 10.2, vmp: 41.5 },
    { id: "perso", nom: "Module personnalisé", pc: 300, voc: 35.5, isc: 11.1, vmp: 0 }
  ];
  var BATT = { plomb: { nom: "Plomb (réglage par défaut)", dod: 70, rend: 80 }, lithium: { nom: "Lithium", dod: 90, rend: 95 } };

  var R = Math.PI / 180, JOURS = [17, 47, 75, 105, 135, 162, 198, 228, 258, 288, 318, 344];
  // Irradiation journalière moyenne reçue par les panneaux, mois par mois (kWh/m²/j)
  function surPanneaux(lat, H, beta, gamma) {
    var phi = lat * R, b = beta * R, g = gamma * R;
    return H.map(function (Hh, m) {
      var n = JOURS[m], d = 23.45 * R * Math.sin(2 * Math.PI * (284 + n) / 365);
      var ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(d))));
      var H0 = 24 / Math.PI * 1.367 * (1 + 0.033 * Math.cos(2 * Math.PI * n / 365)) * (Math.cos(phi) * Math.cos(d) * Math.sin(ws) + ws * Math.sin(phi) * Math.sin(d));
      var Kt = Math.min(0.8, Hh / H0), fd = Kt < 0.722 ? 1.391 - 3.56 * Kt + 4.189 * Kt * Kt - 2.137 * Kt * Kt * Kt : 0.175, Hd = Hh * fd;
      var a = 0.409 + 0.5016 * Math.sin(ws - 60 * R), bb = 0.6609 - 0.4767 * Math.sin(ws - 60 * R), den = Math.sin(ws) - ws * Math.cos(ws);
      var tot = 0, pas = R;
      for (var w = -ws + pas / 2; w < ws; w += pas) {
        var rd = Math.PI / 24 * (Math.cos(w) - Math.cos(ws)) / den, rt = rd * (a + bb * Math.cos(w));
        var I = rt * Hh, Id = rd * Hd, Ib = Math.max(0, I - Id);
        var cz = Math.sin(d) * Math.sin(phi) + Math.cos(d) * Math.cos(phi) * Math.cos(w);
        var ct = Math.sin(d) * Math.sin(phi) * Math.cos(b) - Math.sin(d) * Math.cos(phi) * Math.sin(b) * Math.cos(g) + Math.cos(d) * Math.cos(phi) * Math.cos(b) * Math.cos(w) +
          Math.cos(d) * Math.sin(phi) * Math.sin(b) * Math.cos(g) * Math.cos(w) + Math.cos(d) * Math.sin(b) * Math.sin(g) * Math.sin(w);
        var rb = cz > 0.087 ? Math.max(0, ct) / cz : 0;
        tot += (Ib * rb + Id * (1 + Math.cos(b)) / 2 + I * 0.2 * (1 - Math.cos(b)) / 2) * (pas / (15 * R));
      }
      return tot;
    });
  }
  function moisPeriode(debut, fin) { var l = [], m = debut; for (var i = 0; i < 12; i++) { l.push(m); if (m === fin) break; m = (m + 1) % 12; } return l; }
  function calculer(p) {
    var lieu = LIEUX.filter(function (l) { return l.id === p.lieu; })[0];
    var Hp = surPanneaux(lieu.lat, lieu.H, p.inclinaison, p.orientation);
    var mois = moisPeriode(p.debut, p.fin), ref = mois[0];
    mois.forEach(function (m) { if (Hp[m] < Hp[ref]) ref = m; });
    var pr = (p.rendBatt / 100) * (1 - p.pertes / 100);
    var pc = p.energie / (Hp[ref] * pr);
    var vmp = p.module.vmp || 0.86 * p.module.voc;
    var serie = Math.max(1, Math.ceil(1.2 * p.tension / vmp));
    var nb = Math.ceil(pc / p.module.pc); nb = Math.ceil(nb / serie) * serie;
    var cap = Math.ceil(p.energie * p.jours / ((p.dod / 100) * p.tension));
    return { lieu: lieu, Hp: Hp, mois: mois, ref: ref, pr: pr, pc: pc, serie: serie, nb: nb, branches: nb / serie, pcInst: nb * p.module.pc, cap: cap, kwh: cap * p.tension / 1000 };
  }

  function fr(x, dec) { return Number(x).toLocaleString("fr-FR", { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); }
  function opt(v, t, sel) { return '<option value="' + v + '"' + (sel ? " selected" : "") + ">" + t + "</option>"; }
  function deg(x, pos, neg) { return fr(Math.abs(x), 2) + "° " + (x >= 0 ? pos : neg); }

  function calcpv(el) {
    var h = '<div class="cpv"><div class="cpv-barre"><span class="cpv-logo">Calc<b>PV</b></span><span>Autonome · simulateur hors ligne</span></div><form class="cpv-form" novalidate>';
    h += '<fieldset><legend><span>1</span>Besoins</legend><label>Énergie quotidienne <span class="cpv-u"><input name="energie" type="number" min="0" step="10" inputmode="numeric"> Wh/j</span></label>' +
      '<label>Puissance maximale <span class="cpv-u"><input name="pmax" type="number" min="0" step="10" inputmode="numeric"> W</span></label></fieldset>';
    h += '<fieldset><legend><span>2</span>Emplacement</legend><label>Lieu <select name="lieu">' + opt("", "Choisir sur la liste…", true) + LIEUX.map(function (l) { return opt(l.id, l.nom); }).join("") + '</select></label><p class="cpv-coord">Aucun point sélectionné.</p></fieldset>';
    h += '<fieldset><legend><span>3</span>Panneaux</legend><label>Orientation <select name="orientation">' + ORIENT.map(function (o) { return opt(o[1], o[0], o[1] === 0); }).join("") + '</select></label>' +
      '<label>Inclinaison <span class="cpv-u"><input name="inclinaison" type="number" min="0" max="90" value="20"> °</span></label><label>Support <select name="support"><option>Panneaux fixes</option></select></label>' +
      '<label>Module <select name="module">' + MODULES.map(function (m) { return opt(m.id, m.nom, m.id === "250"); }).join("") + '</select></label>' +
      '<div class="cpv-perso" hidden><label>Puissance <span class="cpv-u"><input name="ppc" type="number" value="300"> Wc</span></label><label>Voc <span class="cpv-u"><input name="pvoc" type="number" step="0.1" value="35.5"> V</span></label><label>Isc <span class="cpv-u"><input name="pisc" type="number" step="0.1" value="11.1"> A</span></label></div></fieldset>';
    h += '<fieldset><legend><span>4</span>Période d\'utilisation</legend><label>Du <select name="debut">' + MOIS.map(function (m, i) { return opt(i, m, i === 0); }).join("") + '</select></label><label>au <select name="fin">' + MOIS.map(function (m, i) { return opt(i, m, i === 11); }).join("") + '</select></label></fieldset>';
    h += '<fieldset><legend><span>5</span>Stockage</legend><label>Jours d\'autonomie <span class="cpv-u"><input name="jours" type="number" min="1" max="15" value="3"> j</span></label>' +
      '<label>Tension finale <select name="tension">' + opt(12, "12 V") + opt(24, "24 V", true) + opt(48, "48 V") + '</select></label>' +
      '<label>Technologie <select name="techno">' + opt("plomb", BATT.plomb.nom, true) + opt("lithium", BATT.lithium.nom) + '</select></label>' +
      '<label>Décharge admise <span class="cpv-u"><input name="dod" type="number" min="10" max="100" value="70"> %</span></label>' +
      '<label>Rendement batterie <span class="cpv-u"><input name="rendBatt" type="number" min="50" max="100" value="80"> %</span></label>' +
      '<label>Autres pertes (régulateur, câbles, chaleur) <span class="cpv-u"><input name="pertes" type="number" min="0" max="50" value="20"> %</span></label></fieldset>';
    h += '<div class="cpv-lancer"><button type="submit" class="btn">Lancer le calcul</button><p class="cpv-err" role="alert"></p></div></form><div class="cpv-res" aria-live="polite"></div></div>';
    el.innerHTML = h;
    var f = el.querySelector("form"), res = el.querySelector(".cpv-res"), err = el.querySelector(".cpv-err");
    function majLieu() {
      var l = LIEUX.filter(function (x) { return x.id === f.lieu.value; })[0];
      el.querySelector(".cpv-coord").innerHTML = l ? "Point sélectionné : <b>" + l.nom + "</b><br>Latitude <b>" + deg(l.lat, "N", "S") + "</b> · Longitude <b>" + deg(l.lon, "E", "O") + "</b>" : "Aucun point sélectionné.";
    }
    f.addEventListener("change", function (e) {
      if (e.target.name === "lieu") majLieu();
      if (e.target.name === "module") el.querySelector(".cpv-perso").hidden = f.module.value !== "perso";
      if (e.target.name === "techno") { var t = BATT[f.techno.value]; f.dod.value = t.dod; f.rendBatt.value = t.rend; }
    });
    f.addEventListener("submit", function (e) {
      e.preventDefault(); err.textContent = "";
      var n = function (k) { return parseFloat(String(f[k].value).replace(",", ".")); };
      var p = { energie: n("energie"), pmax: n("pmax"), lieu: f.lieu.value, orientation: +f.orientation.value, inclinaison: n("inclinaison"), debut: +f.debut.value, fin: +f.fin.value, jours: n("jours"), tension: +f.tension.value, dod: n("dod"), rendBatt: n("rendBatt"), pertes: n("pertes") };
      var m = MODULES.filter(function (x) { return x.id === f.module.value; })[0];
      p.module = m.id === "perso" ? { pc: n("ppc"), voc: n("pvoc"), isc: n("pisc"), vmp: 0, nom: "Module personnalisé " + fr(n("ppc")) + " Wc" } : m;
      var manque = [];
      if (!(p.energie > 0)) manque.push("l'énergie quotidienne");
      if (!p.lieu) manque.push("le lieu");
      if (!(p.inclinaison >= 0 && p.inclinaison <= 90)) manque.push("une inclinaison entre 0 et 90°");
      if (!(p.jours > 0) || !(p.dod > 0) || !(p.rendBatt > 0) || !(p.pertes >= 0 && p.pertes < 100)) manque.push("les réglages de stockage");
      if (!(p.module.pc > 0 && p.module.voc > 0)) manque.push("le module");
      if (manque.length) { err.textContent = "Complétez : " + manque.join(", ") + "."; res.innerHTML = ""; return; }
      var r = calculer(p);
      var t = '<h4>Résultats du calcul</h4><dl class="cpv-chiffres">' +
        '<div><dt>Puissance du champ nécessaire</dt><dd>' + fr(r.pc) + ' Wc</dd></div>' +
        '<div><dt>Nombre de panneaux proposé</dt><dd>' + r.nb + ' × ' + fr(p.module.pc) + ' Wc</dd><dd class="cpv-pt">' + r.serie + ' en série × ' + r.branches + ' branche' + (r.branches > 1 ? "s" : "") + ' · ' + fr(r.pcInst) + ' Wc installés</dd></div>' +
        '<div><dt>Stockage</dt><dd>' + fr(r.cap) + ' Ah sous ' + p.tension + ' V</dd><dd class="cpv-pt">soit ' + fr(r.kwh, 1) + ' kWh</dd></div>' +
        '<div><dt>Mois de référence (le moins ensoleillé)</dt><dd>' + MOIS[r.ref] + '</dd><dd class="cpv-pt">' + fr(r.Hp[r.ref], 2) + ' kWh/m² par jour sur les panneaux</dd></div></dl>';
      t += '<details class="cpv-detail"><summary>Production mois par mois</summary><div class="cpv-table"><table><thead><tr><th>Mois</th><th>Soleil sur les panneaux (kWh/m²/j)</th><th>Production utile (Wh/j)</th><th>Besoin (Wh/j)</th></tr></thead><tbody>';
      r.mois.forEach(function (mo) {
        var prod = r.pcInst * r.Hp[mo] * r.pr;
        t += '<tr' + (mo === r.ref ? ' class="cpv-ref"' : "") + '><td>' + MOIS[mo] + '</td><td>' + fr(r.Hp[mo], 2) + '</td><td>' + fr(prod) + '</td><td>' + fr(p.energie) + '</td></tr>';
      });
      t += '</tbody></table></div></details>';
      t += '<p class="cpv-param">Paramètres : ' + fr(p.energie) + ' Wh/j' + (p.pmax > 0 ? ", " + fr(p.pmax) + " W max" : "") + ' · ' + r.lieu.nom + ' · ' + ORIENT.filter(function (o) { return o[1] === p.orientation; })[0][0] + ', ' + fr(p.inclinaison) + '°, fixes · ' + MOIS[p.debut] + ' à ' + MOIS[p.fin] + ' · ' + p.module.nom + ' · ' + fr(p.jours) + ' j d\'autonomie, ' + p.tension + ' V, ' + BATT[f.techno.value].nom.replace(" (réglage par défaut)", "").toLowerCase() + ', décharge ' + fr(p.dod) + ' %, rendement batterie ' + fr(p.rendBatt) + ' %, autres pertes ' + fr(p.pertes) + ' %.</p>';
      t += '<p class="cpv-note">Simulateur pédagogique : données solaires approchées. Le dimensionnement réel se vérifie avec les notices du matériel.</p>';
      res.innerHTML = t;
    });
  }
  /* ---------- Onglet « CalcPV » : le simulateur s'ouvre par-dessus la page, partout dans le TP 2 ----------
     Un seul simulateur pour tout le site : les valeurs saisies restent quand on change de séance. */
  var tiroir = null, onglet = null;
  function construire() {
    if (tiroir) return;
    onglet = document.createElement("button");
    onglet.type = "button"; onglet.className = "cpv-onglet"; onglet.hidden = true;
    onglet.innerHTML = '<span aria-hidden="true">☀</span> Simulateur CalcPV';
    onglet.addEventListener("click", ouvrir);
    tiroir = document.createElement("aside");
    tiroir.className = "cpv-tiroir"; tiroir.hidden = true; tiroir.setAttribute("aria-label", "Simulateur CalcPV");
    tiroir.innerHTML = '<div class="cpv-tiroir-haut"><b>Simulateur CalcPV</b><button type="button" class="btn leger cpv-fermer">Fermer ✕</button></div><div class="cpv-tiroir-corps"></div>';
    tiroir.querySelector(".cpv-fermer").addEventListener("click", fermer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !tiroir.hidden) fermer(); });
    document.body.appendChild(tiroir); document.body.appendChild(onglet);
    calcpv(tiroir.querySelector(".cpv-tiroir-corps"));
  }
  function ouvrir() { construire(); tiroir.hidden = false; document.body.classList.add("cpv-ouvert"); var c = tiroir.querySelector("input[name=energie]"); if (c) c.focus({ preventScroll: true }); }
  function fermer() { tiroir.hidden = true; document.body.classList.remove("cpv-ouvert"); onglet.focus(); }
  // L'onglet n'apparaît que dans le TP 2 (élève et corrigé prof)
  function dansTP2() { return /^#(tp2$|seance-2-|corrige-2-|s2-|q-2-)/.test(location.hash); }
  function majOnglet() { construire(); onglet.hidden = !dansTP2(); if (!dansTP2() && !tiroir.hidden) fermer(); }
  window.addEventListener("hashchange", majOnglet);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", majOnglet); else setTimeout(majOnglet, 0);
  // Dans le TP : un bouton qui ouvre le simulateur
  function bouton(el) {
    el.innerHTML = '<button type="button" class="btn cpv-ouvrir"><span aria-hidden="true">☀</span> Ouvrir le simulateur CalcPV</button><span class="cpv-astuce">Il reste aussi accessible avec l\'onglet « Simulateur CalcPV » en bas à droite, partout dans le TP 2.</span>';
    el.querySelector("button").addEventListener("click", ouvrir);
  }
  document.addEventListener("click", function (e) { var l = e.target.closest("[data-ouvrir-calcpv]"); if (l) { e.preventDefault(); ouvrir(); } });

  window.COMPOSANTS = window.COMPOSANTS || {};
  window.COMPOSANTS.calcpv = bouton;
  window.CALCPV = { ouvrir: ouvrir, calculer: calculer, surPanneaux: surPanneaux, LIEUX: LIEUX, MODULES: MODULES };
})();
