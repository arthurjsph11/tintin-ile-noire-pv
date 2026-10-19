/* Éditeur des TP pour les enseignants (Espace prof).
   Chargé AVANT app.js : il garde une copie intacte des contenus, applique le brouillon enregistré
   dans ce navigateur, puis fournit le composant « editeur » (page #editeur). */
(function () {
  var CLE = "tintin-brouillon-v1";
  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  function lire() { try { return JSON.parse(localStorage.getItem(CLE) || "null"); } catch (e) { return null; } }
  function ecrire(d) { try { localStorage.setItem(CLE, JSON.stringify(d)); return true; } catch (e) { return false; } }

  // Brouillon enregistré dans ce navigateur : il remplace les contenus d'origine
  var brouillon = lire();
  // Version des fichiers du site (avant brouillon) : sert à lister les modifications
  var base = { contenu: copie(window.CONTENU), terre: copie(window.TERRE || { seances: [] }), corriges: copie(window.CORRIGES || {}) };
  if (brouillon) {
    if (brouillon.contenu) window.CONTENU = brouillon.contenu;
    if (brouillon.terre) window.TERRE = brouillon.terre;
    if (brouillon.corriges) window.CORRIGES = brouillon.corriges;
  }
  // Copie de travail, prise avant que app.js ne prépare l'affichage
  var src = { contenu: copie(window.CONTENU), terre: copie(window.TERRE || { seances: [] }), corriges: copie(window.CORRIGES || {}) };

  function esc(t) { return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function texteSegs(s) { return (s || []).map(function (x) { return x[0]; }).join(""); }
  function segsDe(texte, ancien) { var g = (ancien && ancien[0]) || ["", 0, ""]; return [[texte, g[1], g[2]]]; }
  function texteCellule(c) { return (c || []).map(texteSegs).join("\n"); }
  function celluleDe(t, ancienne) {
    var g = (ancienne && ancienne[0] && ancienne[0][0]) || ["", 0, ""];
    return t === "" ? [] : t.split("\n").map(function (l) { return [[l, g[1], g[2]]]; });
  }
  function lesSeances() {
    var l = [];
    var parId = {};
    (Array.isArray(src.contenu.seances) ? src.contenu.seances : Object.keys(src.contenu.seances).map(function (k) { return src.contenu.seances[k]; })).forEach(function (s) { parId[s.id] = s; });
    src.contenu.tps.forEach(function (tp) { tp.seances.forEach(function (id) { var s = parId[id]; if (!s) return; l.push({ s: s, nom: "TP " + tp.num + " · séance " + s.num + " · " + s.titre }); }); });
    src.terre.seances.forEach(function (s) { l.push({ s: s, nom: "Mise à la terre · activité " + s.num + " (" + s.code + ") · " + s.titre }); });
    return l;
  }
  function majQuestions(sec) {
    sec.questions = sec.blocks.filter(function (b) { return b.t === "q"; }).map(function (b) {
      var t = texteSegs(b.s); return { num: b.num, id: b.id, court: t.length > 70 ? t.slice(0, 70) : t };
    });
  }
  function telecharger(nom, texte) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([texte], { type: "text/javascript;charset=utf-8" }));
    a.download = nom; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function auteur() { try { return localStorage.getItem("tintin-auteur") || ""; } catch (e) { return ""; } }
  function editeur(el) {
    var liste = lesSeances(), choix = 0;
    try { choix = +sessionStorage.getItem("editeur-seance") || 0; } catch (e) {}
    if (!liste[choix]) choix = 0;

    function bloc(b, si, bi, s) {
      var ref = ' data-sec="' + si + '" data-bloc="' + bi + '"';
      if (b.t === "p") return '<div class="ed-bloc"><span class="ed-type">Paragraphe</span><textarea' + ref + ' data-champ="p" rows="' + Math.min(8, 2 + Math.floor(texteSegs(b.s).length / 90)) + '">' + esc(texteSegs(b.s)) + "</textarea>" + boutons(si, bi) + "</div>";
      if (b.t === "h3") return '<div class="ed-bloc"><span class="ed-type">Sous-titre</span><input' + ref + ' data-champ="h3" value="' + esc(b.text) + '">' + boutons(si, bi) + "</div>";
      if (b.t === "dial") return '<div class="ed-bloc"><span class="ed-type">Bulle de ' + esc(b.qui) + '</span><textarea' + ref + ' data-champ="p" rows="3">' + esc(texteSegs(b.s)) + "</textarea>" + boutons(si, bi) + "</div>";
      if (b.t === "img") return '<div class="ed-bloc ed-fixe"><span class="ed-type">Image</span> ' + esc(b.src) + " (non modifiable ici)" + boutons(si, bi) + "</div>";
      if (b.t === "table") {
        return '<div class="ed-bloc"><span class="ed-type">Tableau</span><div class="ed-table"><table>' + b.rows.map(function (r, ri) {
          return "<tr>" + r.map(function (c, ci) { return '<td><textarea' + ref + ' data-champ="cellule" data-r="' + ri + '" data-c="' + ci + '" rows="2">' + esc(texteCellule(c)) + "</textarea></td>"; }).join("") + "</tr>";
        }).join("") + "</table></div>" + boutons(si, bi) + "</div>";
      }
      if (b.t === "q") {
        var c = src.corriges[s.id + "|" + b.num], lignes = Array.isArray(c) ? c : (c && c.lignes) || [];
        var autre = c && !Array.isArray(c) && (c.document || c.tableau || c.apres);
        return '<div class="ed-bloc ed-question"><span class="ed-type">Question</span><label>N° <input class="ed-num"' + ref + ' data-champ="num" value="' + esc(b.num) + '"></label>' +
          '<textarea' + ref + ' data-champ="q" rows="3">' + esc(texteSegs(b.s)) + "</textarea>" +
          '<label class="ed-corr">Correction (une ligne par élément de réponse)' + (autre ? " · le tableau ou le document de cette correction reste tel quel" : "") +
          '<textarea' + ref + ' data-champ="corr" rows="' + Math.max(2, lignes.length + 1) + '">' + esc(lignes.join("\n")) + "</textarea></label>" +
          boutons(si, bi, true) + "</div>";
      }
      return '<div class="ed-bloc ed-fixe"><span class="ed-type">' + esc(b.t) + "</span> (non modifiable ici)</div>";
    }
    function boutons(si, bi, q) {
      return '<div class="ed-actions">' + (q ? '<button type="button" class="btn leger" data-act="ajq" data-sec="' + si + '" data-bloc="' + bi + '">+ Question après</button>' : "") +
        '<button type="button" class="btn leger" data-act="ajp" data-sec="' + si + '" data-bloc="' + bi + '">+ Paragraphe après</button>' +
        '<button type="button" class="btn leger ed-suppr" data-act="suppr" data-sec="' + si + '" data-bloc="' + bi + '">Supprimer</button></div>';
    }
    function rendre() {
      var s = liste[choix].s;
      var h = '<div class="ed-barre"><label>TP à modifier <select class="ed-choix">' + liste.map(function (x, i) { return '<option value="' + i + '"' + (i === choix ? " selected" : "") + ">" + esc(x.nom) + "</option>"; }).join("") + "</select></label>" +
        '<div class="ed-boutons"><button type="button" class="btn" data-act="enregistrer">Enregistrer et voir le résultat</button>' +
        '<button type="button" class="btn leger" data-act="annuler">Annuler les modifications de cet ordinateur</button></div>' +
        '<div class="ed-version"><b>Nouvelle version pour la clé USB</b><label>Votre nom <input class="ed-auteur" value="' + esc(auteur()) + '"></label><label>Pourquoi ces changements ? (facultatif) <input class="ed-motif"></label><button type="button" class="btn jaune" data-act="telecharger">Enregistrer la version ' + ((window.VERSIONS ? window.VERSIONS.numero : 0) + 1) + ' (fichier zip)</button></div>' +
        '<p class="ed-etat"></p></div>';
      h += '<label class="ed-titre-seance">Titre <input data-champ="titre-seance" value="' + esc(s.titre) + '"></label>';
      s.sections.forEach(function (sec, si) {
        h += '<section class="case ed-section"><label class="ed-titre">Partie <input data-champ="titre" data-sec="' + si + '" value="' + esc(sec.titre) + '"></label>';
        sec.blocks.forEach(function (b, bi) { h += bloc(b, si, bi, s); });
        if (!sec.blocks.length) h += '<div class="ed-actions"><button type="button" class="btn leger" data-act="ajp" data-sec="' + si + '" data-bloc="-1">+ Paragraphe</button></div>';
        h += "</section>";
      });
      el.innerHTML = h;
      if (lire()) etat("Des modifications sont enregistrées dans ce navigateur.");
    }
    function etat(t) { var p = el.querySelector(".ed-etat"); if (p) p.textContent = t; }

    // Chaque saisie met à jour la copie de travail
    el.addEventListener("input", function (e) {
      var t = e.target, champ = t.getAttribute("data-champ"); if (!champ) return;
      var s = liste[choix].s;
      if (champ === "titre-seance") { s.titre = t.value; return; }
      var sec = s.sections[+t.getAttribute("data-sec")];
      if (champ === "titre") { sec.titre = t.value; return; }
      var b = sec.blocks[+t.getAttribute("data-bloc")];
      if (champ === "p" || champ === "q") b.s = segsDe(t.value, b.s);
      else if (champ === "h3") b.text = t.value;
      else if (champ === "cellule") { var r = +t.getAttribute("data-r"), c = +t.getAttribute("data-c"); b.rows[r][c] = celluleDe(t.value, b.rows[r][c]); }
      else if (champ === "num") {
        var ancien = s.id + "|" + b.num, neuf = s.id + "|" + t.value;
        if (src.corriges[ancien] && !src.corriges[neuf]) { src.corriges[neuf] = src.corriges[ancien]; delete src.corriges[ancien]; }
        b.num = t.value;
      } else if (champ === "corr") {
        var cle = s.id + "|" + b.num, lignes = t.value.split("\n").filter(function (l) { return l.trim(); }), c0 = src.corriges[cle];
        if (c0 && !Array.isArray(c0)) c0.lignes = lignes; else if (lignes.length) src.corriges[cle] = lignes; else delete src.corriges[cle];
      }
      majQuestions(sec);
      etat("Modifications non enregistrées.");
    });
    el.addEventListener("change", function (e) {
      if (!e.target.classList.contains("ed-choix")) return;
      choix = +e.target.value; try { sessionStorage.setItem("editeur-seance", choix); } catch (er) {}
      rendre();
    });
    el.addEventListener("click", function (e) {
      var bt = e.target.closest("[data-act]"); if (!bt) return;
      var act = bt.getAttribute("data-act"), s = liste[choix].s;
      if (act === "enregistrer") {
        if (ecrire(src)) { etat("Enregistré. Le site affiche maintenant votre version dans ce navigateur."); setTimeout(function () { location.reload(); }, 600); }
        else etat("Impossible d'enregistrer dans ce navigateur : utilisez « Enregistrer la version ».");
        return;
      }
      if (act === "telecharger") {
        var nom = el.querySelector(".ed-auteur").value.trim(), motif = el.querySelector(".ed-motif").value.trim();
        if (!nom) { etat("Indiquez votre nom avant d'enregistrer la nouvelle version."); el.querySelector(".ed-auteur").focus(); return; }
        try { localStorage.setItem("tintin-auteur", nom); } catch (er) {}
        var r = window.SUIVI.nouvelleVersion(src, nom, motif);
        etat(r ? "Version " + r.numero + " téléchargée (" + r.nb + " modification" + (r.nb > 1 ? "s" : "") + ") : décompressez le fichier dans le dossier du site sur la clé USB." : "Aucune modification par rapport à la version actuelle.");
        return;
      }
      if (act === "annuler") {
        if (bt.getAttribute("data-confirme")) { try { localStorage.removeItem(CLE); } catch (er) {} location.reload(); return; }
        bt.setAttribute("data-confirme", "1"); bt.textContent = "Cliquez encore pour confirmer"; return;
      }
      var sec = s.sections[+bt.getAttribute("data-sec")], bi = +bt.getAttribute("data-bloc");
      if (act === "suppr") {
        if (!bt.getAttribute("data-confirme")) { bt.setAttribute("data-confirme", "1"); bt.textContent = "Confirmer la suppression"; return; }
        sec.blocks.splice(bi, 1);
      } else if (act === "ajp") sec.blocks.splice(bi + 1, 0, { t: "p", s: [["Nouveau paragraphe", 0, ""]] });
      else if (act === "ajq") {
        var prec = sec.blocks[bi];
        sec.blocks.splice(bi + 1, 0, { t: "q", num: prec.num + " bis", id: "q-" + s.id + "-" + Date.now().toString(36), s: [["Nouvelle question", 0, ""]], v: false, feuille: true });
      }
      majQuestions(sec);
      var y = window.scrollY; rendre(); window.scrollTo(0, y);
      etat("Modifications non enregistrées.");
    });
    rendre();
  }

  // Changer le mot de passe de l'Espace prof
  function motdepasse(el) {
    el.innerHTML = '<form class="mdp-form"><label>Mot de passe actuel<input type="password" name="ancien" autocomplete="current-password" required></label>' +
      '<label>Nouveau mot de passe<input type="password" name="nouveau" autocomplete="new-password" minlength="6" required></label>' +
      '<label>Nouveau mot de passe, une seconde fois<input type="password" name="confirme" autocomplete="new-password" required></label>' +
      '<div><button class="btn" type="submit">Changer le mot de passe</button></div><p class="mdp-etat" role="status"></p></form>';
    var f = el.querySelector("form"), msg = el.querySelector(".mdp-etat");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var A = window.ACCES, n = f.nouveau.value.trim();
      if (!A.verifier(f.ancien.value)) { msg.textContent = "Le mot de passe actuel est faux."; return; }
      if (n.length < 6) { msg.textContent = "Le nouveau mot de passe doit avoir au moins 6 caractères."; return; }
      if (n !== f.confirme.value.trim()) { msg.textContent = "Les deux nouveaux mots de passe ne sont pas identiques."; return; }
      var emp = A.sha256(n);
      try { localStorage.setItem("tintin-acces-v1", emp); } catch (er) {}
      A.empreinte = emp;
      var code = A.fichier(emp);
      if (code) telecharger("acces.js", code);
      f.reset();
      msg.innerHTML = "<b>Mot de passe changé sur cet ordinateur.</b> " + (code ? "Le fichier <code>acces.js</code> vient d'être téléchargé : copiez-le dans le dossier <b>js</b> de la clé USB (et sur GitHub pour le site en ligne) pour changer le mot de passe partout." : "Pour le changer partout, demandez à l'équipe le nouveau fichier <code>acces.js</code>.");
    });
  }

  window.COMPOSANTS = window.COMPOSANTS || {};
  window.COMPOSANTS.editeur = editeur;
  window.COMPOSANTS.motdepasse = motdepasse;
  window.EDITEUR = { brouillon: !!brouillon, base: base, travail: function () { return src; }, telecharger: telecharger };
})();
