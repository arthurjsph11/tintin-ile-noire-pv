/* Onglet Jeux : memory, juste prix énergétique, vrai ou faux contre la montre, mots croisés.
   Les données (paires, appareils, affirmations, mots) sont dans js/vivant.js. */
(function () {
  "use strict";
  var V = window.VIVANT;
  var TOURNESOL = "images/tournesol-tete.jpg";
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function melange(a) { return window.melange(a); }
  function bulle(txt) {
    return '<div class="bulle-l petite"><img class="portrait" src="' + TOURNESOL + '" alt="Professeur Tournesol"><div class="bulle">' + txt + "</div></div>";
  }
  function nombre(x) { return String(Math.round(x * 10) / 10).replace(".", ","); }

  var JEUX = [
    { id: "memory", titre: "Memory", desc: "Retournez les cartes deux par deux et retrouvez les paires.", donnees: "memory" },
    { id: "prix", titre: "Le juste prix énergétique", desc: "Estimez l'énergie consommée par jour, au plus juste.", donnees: "justePrix" },
    { id: "vf", titre: "Vrai ou faux contre la montre", desc: "Trois niveaux : 60, 45 ou 30 secondes pour répondre au plus d'affirmations possible.", donnees: "vraiFaux" },
    { id: "mots", titre: "Mots croisés", desc: "Retrouvez les mots du photovoltaïque à partir des définitions.", donnees: "motsCroises" }
  ];

  function page(r) {
    if (r === "jeux") {
      var h = '<span class="bandeau">Pour s\'entraîner</span><h1 class="titre-page">Les jeux de Tournesol</h1>' +
        bulle("Ces jeux ne font pas partie des TP : ils servent à <strong>réviser en s'amusant</strong>. Chaque jeu existe en plusieurs versions, à choisir en haut du jeu.") +
        '<div class="jeux-liste">';
      JEUX.forEach(function (j) {
        h += '<a class="carte" href="#jeu-' + j.id + '"><span class="tp-num">' + V[j.donnees].length + ' versions</span><b>' + esc(j.titre) + '</b><span>' + esc(j.desc) + '</span></a>';
      });
      return h + "</div>";
    }
    var id = r.slice(4), j = JEUX.filter(function (x) { return x.id === id; })[0];
    if (!j) return page("jeux");
    var boutons = V[j.donnees].map(function (v, k) {
      return '<button type="button" data-variante="' + k + '" aria-pressed="' + (k === 0) + '">' + esc(v.nom) + "</button>";
    }).join("");
    return '<a class="btn leger retour-jeux" href="#jeux">← Retour aux jeux</a><span class="bandeau"><a href="#jeux" style="color:inherit">Les jeux</a></span><h1 class="titre-page">' + esc(j.titre) + "</h1>" +
      '<section class="case"><div class="variantes" role="group" aria-label="Choisir une version">' + boutons + '</div><div data-jeu="' + j.id + '"></div></section>';
  }

  function monter(racine) {
    racine.querySelectorAll("[data-jeu]").forEach(function (zone) {
      var id = zone.getAttribute("data-jeu"), boutons = racine.querySelectorAll("[data-variante]");
      function lancer(k) {
        boutons.forEach(function (b) { b.setAttribute("aria-pressed", String(+b.getAttribute("data-variante") === k)); });
        if (zone._stop) zone._stop();
        zone._stop = null;
        MOTEURS[id](zone, k);
      }
      boutons.forEach(function (b) { b.addEventListener("click", function () { lancer(+b.getAttribute("data-variante")); }); });
      lancer(0);
    });
  }

  var MOTEURS = {};

  /* ---------------- Memory ---------------- */
  function faceMemory(t) {
    var ico = (V.iconesMemory || {})[t], m = /^(\S+) \((.+)\)$/.exec(t);
    var txt = m ? '<span class="unite">' + esc(m[1]) + '</span><span class="unite-nom">' + esc(m[2]) + "</span>" : "<span>" + esc(t) + "</span>";
    return '<span class="face-in">' + (ico ? '<span class="ico" aria-hidden="true">' + ico + "</span>" : "") + txt + "</span>";
  }
  MOTEURS.memory = function (zone, k) {
    var v = V.memory[k], cartes = [];
    v.paires.forEach(function (p, i) { cartes.push({ t: p[0], p: i }); cartes.push({ t: p[1], p: i }); });
    cartes = melange(cartes);
    var ouvertes = [], coups = 0, trouvees = 0, bloque = false;
    zone.innerHTML = bulle("Retournez deux cartes. Si elles vont ensemble, elles restent visibles. Trouvez les " + v.paires.length + " paires avec le moins de coups possible.") +
      '<p><strong>Coups : <span data-coups>0</span></strong> · Paires : <span data-paires>0</span> / ' + v.paires.length + '</p>' +
      '<div class="memory">' + cartes.map(function (c, i) {
        return '<button type="button" class="carte-m" data-i="' + i + '" aria-label="Carte cachée"><span class="in"><span class="dos"></span><span class="face">' + faceMemory(c.t) + "</span></span></button>";
      }).join("") + '</div><div data-expl></div><div data-fin></div>';
    zone.querySelectorAll(".carte-m").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-i");
        if (bloque || b.classList.contains("ouverte") || b.classList.contains("trouvee")) return;
        b.classList.add("ouverte"); b.setAttribute("aria-label", cartes[i].t);
        ouvertes.push(b);
        if (ouvertes.length < 2) return;
        coups++; zone.querySelector("[data-coups]").textContent = coups;
        var a = ouvertes[0], c = ouvertes[1];
        if (cartes[+a.getAttribute("data-i")].p === cartes[+c.getAttribute("data-i")].p) {
          a.classList.replace("ouverte", "trouvee"); c.classList.replace("ouverte", "trouvee");
          ouvertes = []; trouvees++; zone.querySelector("[data-paires]").textContent = trouvees;
          var ex = v.paires[cartes[+a.getAttribute("data-i")].p][2];
          if (ex) zone.querySelector("[data-expl]").innerHTML = bulle("<strong>Paire trouvée !</strong> " + esc(ex));
          if (trouvees === v.paires.length) {
            var parfait = v.paires.length;
            zone.querySelector("[data-fin]").innerHTML = bulle("<strong>Bravo, toutes les paires en " + coups + " coups !</strong> " +
              (coups <= parfait + 3 ? "Une mémoire digne d'un grand savant." : "Rejouez pour faire moins de coups (le minimum est " + parfait + ").") +
              ' <button class="btn jaune" type="button" data-rejouer>Rejouer</button>');
            zone.querySelector("[data-rejouer]").addEventListener("click", function () { MOTEURS.memory(zone, k); });
          }
        } else {
          bloque = true;
          setTimeout(function () {
            [a, c].forEach(function (x) { x.classList.remove("ouverte"); x.setAttribute("aria-label", "Carte cachée"); });
            ouvertes = []; bloque = false;
          }, 900);
        }
      });
    });
  };

  /* ---------------- Juste prix énergétique ---------------- */
  MOTEURS.prix = function (zone, k) {
    var v = V.justePrix[k], i = 0, etoiles = 0;
    function etape() {
      if (i >= v.appareils.length) {
        var max = v.appareils.length * 3;
        zone.innerHTML = bulle("<strong>" + etoiles + " ★ sur " + max + ".</strong> 3 ★ : à 5 % près ; 2 ★ : à 10 % près ; 1 ★ : à 20 % près. " +
          (etoiles >= max - 1 ? "Remarquable ! Vous savez déjà dimensionner une consommation." : "Rappelez-vous : énergie (Wh) = nombre × puissance (W) × durée (h).") +
          ' <button class="btn jaune" type="button" data-rejouer>Rejouer</button>');
        zone.querySelector("[data-rejouer]").addEventListener("click", function () { MOTEURS.prix(zone, k); });
        return;
      }
      var a = v.appareils[i], vrai = a.p * a.n * a.h;
      // Pas du curseur : la bonne réponse tombe toujours pile sur une graduation (les 3 étoiles restent atteignables)
      var pas = [50, 25, 20, 10, 5, 1].filter(function (x) { return vrai % x === 0 && vrai / x >= 4; })[0] || 1;
      // Le maximum change à chaque fois : la bonne réponse n'est pas toujours au même endroit
      var haut = Math.max(vrai + pas * 4, Math.ceil(vrai * (1.8 + Math.random() * 1.7) / pas) * pas);
      zone.innerHTML = '<div class="prix"><div class="progression"><i style="width:' + (i / v.appareils.length * 100) + '%"></i></div>' +
        '<div class="appareil"><span class="ico" aria-hidden="true">' + a.ico + "</span><div><b>" + esc(a.nom) + "</b><br>" +
        a.n + " × " + nombre(a.p) + " W, utilisé" + (a.n > 1 ? "s" : "") + " " + nombre(a.h) + " h par jour</div></div>" +
        "<label for=\"curseur-prix\">Combien d'énergie par jour, à votre avis ?</label>" +
        '<input id="curseur-prix" type="range" min="0" max="' + haut + '" step="' + pas + '" value="' + Math.round(haut / 2 / pas) * pas + '">' +
        '<div class="reglage"><button class="btn leger" type="button" data-pas="-1" aria-label="Diminuer">−</button><span class="estim"><span data-estim></span> Wh</span><button class="btn leger" type="button" data-pas="1" aria-label="Augmenter">+</button></div>' +
        '<div><button class="btn" type="button" data-valider>Valider</button></div><div data-retour></div></div>';
      var c = zone.querySelector("input"), e = zone.querySelector("[data-estim]");
      function maj() { e.textContent = c.value; } maj();
      c.addEventListener("input", maj);
      // Boutons − et + pour régler finement, graduation par graduation
      zone.querySelectorAll("[data-pas]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (c.disabled) return;
          c.value = Math.min(haut, Math.max(0, +c.value + pas * +b.getAttribute("data-pas"))); maj();
        });
      });
      zone.querySelector("[data-valider]").addEventListener("click", function () {
        var ecart = Math.abs(+c.value - vrai) / vrai, n = ecart <= 0.05 ? 3 : ecart <= 0.1 ? 2 : ecart <= 0.2 ? 1 : 0;
        etoiles += n; c.disabled = true; this.remove();
        zone.querySelector("[data-retour]").innerHTML = bulle("<strong>" + "★".repeat(n) + "☆".repeat(3 - n) + "</strong> Le juste prix : " +
          a.n + " × " + nombre(a.p) + " W × " + nombre(a.h) + " h = <strong>" + nombre(vrai) + " Wh</strong> par jour. Vous aviez dit " + c.value + " Wh." +
          ' <button class="btn jaune" type="button" data-suivant>' + (i + 1 < v.appareils.length ? "Appareil suivant" : "Voir mon score") + "</button>");
        zone.querySelector("[data-suivant]").addEventListener("click", function () { i++; etape(); });
      });
    }
    etape();
  };

  /* ---------------- Vrai ou faux contre la montre ---------------- */
  MOTEURS.vf = function (zone, k) {
    var v = V.vraiFaux[k], DUREE = 60, items, i, bons, erreurs, reste, minuteur;
    var NIVEAUX = [["Normal", 60], ["Expert", 45], ["Professeur", 30]];
    function stop() { clearInterval(minuteur); minuteur = null; }
    zone._stop = stop;
    function accueil() {
      zone.innerHTML = bulle("Choisissez votre niveau, puis répondez Vrai ou Faux à chaque affirmation, le plus vite possible. Les corrections s'affichent à la fin.") +
        '<div class="niveaux">' + NIVEAUX.map(function (n) {
          return '<button class="btn jaune" type="button" data-go="' + n[1] + '"><b>' + n[0] + "</b><span>" + n[1] + " secondes</span></button>";
        }).join("") + "</div>";
      zone.querySelectorAll("[data-go]").forEach(function (b) {
        b.addEventListener("click", function () { DUREE = +b.getAttribute("data-go"); partir(); });
      });
    }
    function partir() {
      items = melange(v.items); i = 0; bons = 0; erreurs = []; reste = DUREE;
      zone.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span class="chrono" data-chrono>' + DUREE + ' s</span><strong>Score : <span data-score>0</span></strong></div>' +
        '<div class="progression"><i data-barre style="width:100%"></i></div><p data-affirm style="font-size:20px;font-weight:700;min-height:3em"></p>' +
        '<div class="vf"><button class="btn" type="button" data-rep="1">Vrai</button><button class="btn leger" type="button" data-rep="0">Faux</button></div>';
      zone.querySelectorAll("[data-rep]").forEach(function (b) {
        b.addEventListener("click", function () { repondre(b.getAttribute("data-rep") === "1"); });
      });
      montrer();
      minuteur = setInterval(function () {
        reste--;
        var ch = zone.querySelector("[data-chrono]");
        if (!ch) { stop(); return; }
        ch.textContent = reste + " s"; zone.querySelector("[data-barre]").style.width = (reste / DUREE * 100) + "%";
        if (reste <= 0) fin();
      }, 1000);
    }
    function montrer() { zone.querySelector("[data-affirm]").textContent = items[i][0]; }
    function repondre(rep) {
      var it = items[i];
      if (rep === it[1]) bons++; else erreurs.push(it);
      zone.querySelector("[data-score]").textContent = bons;
      i++;
      if (i >= items.length) fin(); else montrer();
    }
    function fin() {
      stop();
      var vues = i, h = bulle("<strong>" + bons + " bonne" + (bons > 1 ? "s" : "") + " réponse" + (bons > 1 ? "s" : "") + " sur " + vues + "</strong>" +
        (vues < items.length ? " (le temps s'est écoulé avant la fin)." : (reste > 0 ? ", avec " + reste + " s d'avance !" : ".")));
      if (erreurs.length) {
        h += "<h3>À revoir</h3><ul style=\"display:grid;gap:8px;margin:0;padding-left:20px\">" + erreurs.map(function (it) {
          return "<li><strong>« " + esc(it[0]) + " »</strong> est <strong>" + (it[1] ? "vrai" : "faux") + "</strong>. " + esc(it[2]) + "</li>";
        }).join("") + "</ul>";
      }
      var niv = NIVEAUX.filter(function (n) { return n[1] === DUREE; })[0];
      zone.innerHTML = h + '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn jaune" type="button" data-rejouer>Rejouer (' + niv[0] + ')</button><button class="btn leger" type="button" data-niveau>Changer de niveau</button></div>';
      zone.querySelector("[data-rejouer]").addEventListener("click", partir);
      zone.querySelector("[data-niveau]").addEventListener("click", accueil);
    }
    accueil();
  };

  /* ---------------- Mots croisés ---------------- */
  // Grille construite au chargement : chaque mot est placé en croisant un mot déjà posé.
  // Plusieurs ordres sont essayés ; on garde la grille où tous les mots sont placés, la plus compacte.
  // Le tirage est toujours le même (graine fixe) : tous les élèves ont la même grille et les mêmes numéros.
  function melangeFixe(a, graine) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      graine = (graine * 1103515245 + 12345) % 2147483648;
      var j = graine % (i + 1), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function construireGrille(mots) {
    var base = mots.map(function (m) { return { mot: m[0], indice: m[1] }; }).sort(function (a, b) { return b.mot.length - a.mot.length; });
    var meilleure = null;
    for (var essai = 0; essai < 40; essai++) {
      var g = essayer(essai === 0 ? base : [base[0]].concat(melangeFixe(base.slice(1), essai)));
      var note = g.oublies.length * 1000 + g.l * g.h;
      if (!meilleure || note < meilleure.note) { meilleure = g; g.note = note; }
    }
    return meilleure;
  }
  function essayer(liste) {
    var cases = {}, poses = [];
    function lire(x, y) { return cases[x + "," + y]; }
    function possible(m, x, y, dir) {
      var dx = dir === "h" ? 1 : 0, dy = dir === "v" ? 1 : 0, croise = 0;
      if (lire(x - dx, y - dy) || lire(x + dx * m.length, y + dy * m.length)) return -1;
      for (var k = 0; k < m.length; k++) {
        var cx = x + dx * k, cy = y + dy * k, l = lire(cx, cy);
        if (l) { if (l !== m[k]) return -1; croise++; }
        else if (lire(cx + dy, cy + dx) || lire(cx - dy, cy - dx)) return -1;
      }
      return croise;
    }
    function poser(e, x, y, dir) {
      for (var k = 0; k < e.mot.length; k++) cases[(dir === "h" ? x + k : x) + "," + (dir === "v" ? y + k : y)] = e.mot[k];
      poses.push({ mot: e.mot, indice: e.indice, x: x, y: y, dir: dir });
    }
    poser(liste[0], 0, 0, "h");
    var restants = liste.slice(1), progres = true;
    while (restants.length && progres) {
      progres = false;
      for (var r = 0; r < restants.length; r++) {
        var e = restants[r], meilleur = null;
        poses.forEach(function (p) {
          for (var a = 0; a < p.mot.length; a++) for (var b = 0; b < e.mot.length; b++) {
            if (p.mot[a] !== e.mot[b]) continue;
            var dir = p.dir === "h" ? "v" : "h";
            var x = p.dir === "h" ? p.x + a : p.x - b, y = p.dir === "h" ? p.y - b : p.y + a;
            var c = possible(e.mot, x, y, dir);
            if (c > 0 && (!meilleur || c > meilleur.c)) meilleur = { x: x, y: y, dir: dir, c: c };
          }
        });
        if (meilleur) { poser(e, meilleur.x, meilleur.y, meilleur.dir); restants.splice(r, 1); progres = true; break; }
      }
    }
    var xs = [], ys = [];
    Object.keys(cases).forEach(function (c) { var p = c.split(","); xs.push(+p[0]); ys.push(+p[1]); });
    var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
    var grille = { l: Math.max.apply(null, xs) - x0 + 1, h: Math.max.apply(null, ys) - y0 + 1, cases: {}, mots: [] };
    Object.keys(cases).forEach(function (c) { var p = c.split(","); grille.cases[(p[0] - x0) + "," + (p[1] - y0)] = cases[c]; });
    // Numérotation de haut en bas, de gauche à droite : un numéro par mot.
    // Si deux mots partent de la même case, elle porte les deux numéros (horizontal / vertical).
    poses.forEach(function (p) { p.x -= x0; p.y -= y0; });
    poses.sort(function (a, b) { return a.y - b.y || a.x - b.x || (a.dir === "h" ? -1 : 1); });
    var nums = {};
    poses.forEach(function (p, i) { var cle = p.x + "," + p.y; p.num = i + 1; nums[cle] = nums[cle] ? nums[cle] + "/" + p.num : String(p.num); });
    grille.mots = poses; grille.nums = nums; grille.oublies = restants;
    return grille;
  }

  MOTEURS.mots = function (zone, k) {
    var g = construireGrille(V.motsCroises[k].mots);
    var h = '<div class="mc-grille" style="grid-template-columns:repeat(' + g.l + ',34px)" role="grid">';
    for (var y = 0; y < g.h; y++) for (var x = 0; x < g.l; x++) {
      var cle = x + "," + y;
      if (g.cases[cle]) h += '<div class="c">' + (g.nums[cle] ? "<sup>" + g.nums[cle] + "</sup>" : "") +
        '<input data-c="' + cle + '" aria-label="Case ligne ' + (y + 1) + " colonne " + (x + 1) + '" autocomplete="off"></div>';
      else h += '<div class="c"></div>';
    }
    h += "</div>";
    function indices(dir, titre) {
      var l = g.mots.filter(function (m) { return m.dir === dir; });
      if (!l.length) return "";
      return "<h3>" + titre + "</h3><ol>" + l.map(function (m) {
        return '<li value="' + m.num + '">' + esc(m.indice) + " <span style=\"color:var(--gris)\">(" + m.mot.length + " lettres)</span></li>";
      }).join("") + "</ol>";
    }
    zone.innerHTML = bulle("Cliquez sur une case et tapez les lettres. Les accents ne comptent pas. Quand vous pensez avoir fini, appuyez sur <strong>Vérifier</strong>.") +
      '<div class="mc-zone">' + h + '<div class="mc-indices">' + indices("h", "Horizontalement") + indices("v", "Verticalement") +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn" type="button" data-verif>Vérifier</button><button class="btn leger" type="button" data-solution>Voir la solution</button></div><div data-retour></div></div></div>';
    var dirCourante = "h";
    var inputs = zone.querySelectorAll(".mc-grille input");
    function cellule(x, y) { return zone.querySelector('[data-c="' + x + "," + y + '"]'); }
    inputs.forEach(function (inp) {
      inp.addEventListener("focus", function () {
        inp.select(); // une lettre déjà présente est remplacée par la suivante tapée
        var p = inp.getAttribute("data-c").split(","), x = +p[0], y = +p[1];
        var horiz = cellule(x - 1, y) || cellule(x + 1, y), vert = cellule(x, y - 1) || cellule(x, y + 1);
        if (dirCourante === "h" && !horiz && vert) dirCourante = "v";
        else if (dirCourante === "v" && !vert && horiz) dirCourante = "h";
      });
      // Re-cliquer sur la case active change le sens d'écriture (horizontal / vertical)
      inp.addEventListener("mousedown", function () {
        if (document.activeElement !== inp) return;
        var p = inp.getAttribute("data-c").split(","), x = +p[0], y = +p[1];
        var horiz = cellule(x - 1, y) || cellule(x + 1, y), vert = cellule(x, y - 1) || cellule(x, y + 1);
        if (dirCourante === "h" && vert) dirCourante = "v"; else if (dirCourante === "v" && horiz) dirCourante = "h";
      });
      inp.addEventListener("input", function () {
        var avant = inp.getAttribute("data-avant") || "", v = inp.value.normalize("NFD").replace(/[^A-Za-z]/g, "").toUpperCase();
        // Si le curseur était devant la lettre déjà mise, garder la nouvelle lettre, pas l'ancienne
        inp.value = v.length > 1 && v.slice(-1) === avant ? v[0] : v.slice(-1);
        inp.setAttribute("data-avant", inp.value);
        inp.classList.remove("bon", "faux");
        if (!inp.value) return;
        var p = inp.getAttribute("data-c").split(","), x = +p[0], y = +p[1];
        var suiv = dirCourante === "h" ? cellule(x + 1, y) : cellule(x, y + 1);
        if (suiv) suiv.focus();
      });
      inp.addEventListener("keydown", function (e) {
        var p = inp.getAttribute("data-c").split(","), x = +p[0], y = +p[1], cible = null;
        if (e.key === "ArrowRight") { cible = cellule(x + 1, y); dirCourante = "h"; }
        else if (e.key === "ArrowLeft") { cible = cellule(x - 1, y); dirCourante = "h"; }
        else if (e.key === "ArrowDown") { cible = cellule(x, y + 1); dirCourante = "v"; }
        else if (e.key === "ArrowUp") { cible = cellule(x, y - 1); dirCourante = "v"; }
        else if (/^[a-zA-ZÀ-ÿ]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Taper une lettre : elle remplace celle de la case, puis on passe à la case suivante
          e.preventDefault();
          inp.value = e.key.normalize("NFD").replace(/[^A-Za-z]/g, "").toUpperCase();
          inp.setAttribute("data-avant", inp.value);
          inp.classList.remove("bon", "faux");
          cible = dirCourante === "h" ? cellule(x + 1, y) : cellule(x, y + 1);
          if (cible) cible.focus();
          return;
        }
        else if (e.key === "Backspace" && !inp.value) cible = dirCourante === "h" ? cellule(x - 1, y) : cellule(x, y - 1);
        if (cible) { e.preventDefault(); cible.focus(); }
      });
    });
    zone.querySelector("[data-verif]").addEventListener("click", function () {
      var vides = 0, faux = 0;
      inputs.forEach(function (inp) {
        var bon = g.cases[inp.getAttribute("data-c")];
        inp.classList.remove("bon", "faux");
        if (!inp.value) { vides++; return; }
        if (inp.value === bon) inp.classList.add("bon"); else { inp.classList.add("faux"); faux++; }
      });
      zone.querySelector("[data-retour]").innerHTML = (faux === 0 && vides === 0)
        ? bulle("<strong>Grille complète, bravo !</strong> Tous les mots sont justes.")
        : '<p class="retour ko">' + (faux ? faux + " lettre" + (faux > 1 ? "s" : "") + " à corriger (en rouge). " : "") + (vides ? vides + " case" + (vides > 1 ? "s" : "") + " encore vide" + (vides > 1 ? "s" : "") + "." : "") + "</p>";
    });
    zone.querySelector("[data-solution]").addEventListener("click", function () {
      inputs.forEach(function (inp) { inp.value = g.cases[inp.getAttribute("data-c")]; inp.classList.remove("faux"); inp.classList.add("bon"); });
    });
  };

  window.JEUX = { page: page, monter: monter, _grille: construireGrille };
})();
