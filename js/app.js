/* Tintin sur l'île Noire PV — moteur du site (navigation, menu, affichage des séances, espace prof).
   Fonctionne hors ligne : ouvrir index.html dans un navigateur suffit. */
(function () {
  "use strict";
  var C = window.CONTENU, V = window.VIVANT;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var TOURNESOL = "images/tournesol-tete.jpg";
  var T = window.TERRE || { seances: [] };
  // Portraits des personnages du module « mise à la terre » (hors histoire de Tintin)
  var PORTRAITS = {};
  var MOT_DE_PASSE_PROF = "tournesol";
  var FLECHE = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function lien(t) { return t.replace(/(https?:\/\/[^\s<]+[^\s<.,;:)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  function segs(s) {
    return s.map(function (x) {
      var h = lien(esc(x[0])).replace(/\n/g, "<br>");
      if (x[1]) h = "<strong>" + h + "</strong>";
      if (x[2]) h = '<span class="' + x[2] + '">' + h + "</span>";
      return h;
    }).join("");
  }
  function texte(s) { return s.map(function (x) { return x[0]; }).join(""); }
  function bulle(txt, opts) {
    opts = opts || {};
    return '<div class="bulle-l' + (opts.petite ? " petite" : "") + (opts.info ? " info" : "") + '">' +
      (opts.portrait ? '<img class="portrait" src="' + PORTRAITS[opts.portrait][0] + '" alt="' + PORTRAITS[opts.portrait][1] + '">' : '<img class="portrait" src="' + TOURNESOL + '" alt="Professeur Tournesol">') +
      '<div class="bulle">' + (opts.qui ? '<span class="qui">' + esc(opts.qui) + "</span>" : "") + txt + "</div></div>";
  }
  // Réplique de Tintin : bulle à droite, avec une pastille à la place du portrait
  function bulleTintin(txt) {
    return '<div class="bulle-l petite tintin"><img class="portrait" src="images/tintin-tete.jpg" alt="Tintin">' +
      '<div class="bulle"><span class="qui">Tintin</span>' + txt + "</div></div>";
  }
  var lsGet = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var lsSet = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var profOuvert = function () { try { return sessionStorage.getItem("prof") === "1"; } catch (e) { return window.__prof === true; } };
  var setProf = function () { try { sessionStorage.setItem("prof", "1"); } catch (e) {} window.__prof = true; };

  /* ---------- Préparation : séances enrichies (BD, plan) ---------- */
  var seances = {}, RT = V.retouches;
  C.seances.concat(T.seances).forEach(function (s) {
    s.sections = s.sections.filter(function (sec) { return (RT.sectionsRetirees || []).indexOf(sec.id) < 0; });
    // Sections réservées au prof : retirées du parcours élève, affichées avant le corrigé en mode prof
    s.sectionsProf = s.sections.filter(function (sec) { return (RT.sectionsProf || []).indexOf(sec.id) >= 0; });
    s.sections = s.sections.filter(function (sec) { return (RT.sectionsProf || []).indexOf(sec.id) < 0; });
    // TP terre : les paragraphes d'introduction (« Comprendre avant de calculer ») sont aérés en listes
    if (s.tp === "terre") s.sections.forEach(function (sec) {
      if (sec.titre !== "Comprendre avant de calculer") return;
      var nb = [];
      sec.blocks.forEach(function (b) {
        var t = b.t === "p" && b.s.length === 1 && !b.s[0][1] && !b.s[0][2] ? b.s[0][0] : null;
        var morceaux = !t ? [] : (t.split(" ; ").length >= 3 && /:/.test(t) ? t.split(" ; ") : t.split(/(?<=\.)\s+(?=[A-ZÉÈÀ0-9])/));
        if (morceaux.length < 2) { nb.push(b); return; }
        morceaux.forEach(function (m) { nb.push({ t: "p", s: [["• " + m.replace(/\.$/, "") + (/\.$/.test(m) ? "." : ""), 0, ""]] }); });
      });
      sec.blocks = nb;
    });
    // L'image de couverture du TP terre est remplacée par le simulateur du courant de défaut
    s.sections.forEach(function (sec) { sec.blocks = sec.blocks.filter(function (b) { return !(b.t === "img" && b.src === "terre-couverture.jpg"); }); });
    s.sections.forEach(function (sec) {
      var ajout = (V.dialoguesAvant || {})[sec.id];
      if (ajout && !sec.dialoguesAjoutes) { sec.blocks = ajout.map(function (d) { return { t: "dial", qui: d[0], s: [[d[1], 0, ""]] }; }).concat(sec.blocks); sec.dialoguesAjoutes = true; }
      // Remplacements de phrases (paragraphes et cellules de tableau)
      (RT.remplacements || []).forEach(function (r) {
        var rep = function (s) { s.forEach(function (x) { x[0] = x[0].split(r[0]).join(r[1]); }); };
        sec.blocks.forEach(function (b) {
          if (b.t === "p") rep(b.s);
          if (b.t === "table") b.rows.forEach(function (row) { row.forEach(function (c) { if (Array.isArray(c)) c.forEach(function (par) { if (Array.isArray(par)) rep(par); }); }); });
        });
      });
      // Lignes lues à tort comme des questions (ex. étape 1 d'une méthode) : affichées comme du texte, avec leur numéro
      sec.blocks = sec.blocks.map(function (b) {
        if (b.t === "q" && (RT.questionsEnTexte || []).indexOf(b.id) >= 0) return { t: "p", s: [[b.num + ". ", 0, ""]].concat(b.s) };
        return b;
      });
      sec.questions = sec.questions.filter(function (q) { return (RT.questionsEnTexte || []).indexOf(q.id) < 0; });
      sec.blocks = sec.blocks.filter(function (b) { return !(b.t === "q" && RT.questionsRetirees.indexOf(b.id) >= 0); });
      sec.questions = sec.questions.filter(function (q) { return RT.questionsRetirees.indexOf(q.id) < 0; });
      sec.blocks.forEach(function (b) {
        if (b.t === "q" && RT.enonces[b.id]) { b.s = [[RT.enonces[b.id].texte, 0, ""]]; b.indice = RT.enonces[b.id].indice; }
        if (b.t === "q") {
          var m = /^([\s\S]*?)\s*Aide\s*:\s*([\s\S]+)$/.exec(texte(b.s));
          if (m) { b.s = [[m[1], 0, b.s[0][2] || ""]]; b.aide = m[2]; }
        }
        if (b.t === "p" && /^Travail à suivre : pages .*conservent leurs numéros Q et V\.$/.test(texte(b.s))) b.s = [[RT.travailASuivre, 0, ""]];
      });
      sec.questions.forEach(function (q) { if (RT.enonces[q.id]) q.court = RT.enonces[q.id].texte.slice(0, 60); });
      sec.questions.forEach(function (q) { q.court = q.court.replace(/\s*Aide\s*:.*$/, ""); });
      sec.court = sec.titre;
      RT.titres.forEach(function (r) { sec.court = sec.court.replace(r[0], r[1]); });
      var code = /^Complément (V\w+) /.exec(sec.titre);
      if (code) sec.code = code[1];
      if (sec.kind === "objectifs") sec.blocks = sec.blocks.filter(function (b) { return !(b.t === "img" && V.bdRetireesDesObjectifs.indexOf(b.src) >= 0); });
    });
    if (V.bd[s.id]) s.sections.unshift({ id: "s" + s.id + "-bd", titre: V.bd[s.id].titre, court: V.bd[s.id].titre.replace(/^La BD : /, "BD : "), kind: "bd", blocks: [], questions: [] });
    if (s.id === "1-1") {
      var iObj = s.sections.findIndex(function (x) { return x.kind === "objectifs"; });
      s.sections.splice(iObj + 1, 0,
        { id: "s1-1-plan", titre: "Le plan de l'installation", court: "Le plan de l'installation", kind: "plan", blocks: [], questions: [] },
        { id: "s1-1-quiz", titre: "Quiz : les pièces de l'installation", court: "Quiz des pièces", kind: "quizpieces", blocks: [], questions: [] });
    }
    seances[s.id] = s;
  });
  function seanceDeSection(id) {
    for (var k in seances) if (seances[k].sections.some(function (x) { return x.id === id; })) return seances[k];
    return null;
  }
  function seanceDeQuestion(id) {
    for (var k in seances) for (var i = 0; i < seances[k].sections.length; i++)
      if (seances[k].sections[i].questions.some(function (q) { return q.id === id; })) return seances[k];
    return null;
  }

  /* ---------- Menu ---------- */
  function construireMenu() {
    var ouverts = {};
    try { ouverts = JSON.parse(lsGet("menu") || "{}"); } catch (e) {}
    var h = '<a class="marque" href="#accueil"><img src="' + TOURNESOL + '" alt=""><b>Tintin sur l\'île Noire<small>PV · photovoltaïque</small></b></a><ul class="nav">';
    h += '<li><a class="nav-lien nav-simple" href="#accueil" data-route="accueil">Accueil</a></li>';
    function onglet(k, route, libelle, ids) {
      h += '<li class="onglet"><div class="ligne"><a class="nav-lien" href="#' + route + '" data-route="' + route + '">' + esc(libelle) + "</a>" +
        '<button class="fleche" aria-label="Afficher les parties : ' + esc(libelle) + '" aria-expanded="' + (ouverts[k] ? "true" : "false") + '" data-ouvre="' + k + '">' + FLECHE + "</button></div>" +
        '<ul class="sous" id="m-' + k + '"' + (ouverts[k] ? "" : " hidden") + ">";
      ids.forEach(function (sid) {
        var s = seances[sid];
        s.sections.forEach(function (sec) {
          var kk = "sec-" + sec.id, aQ = sec.questions.length > 0;
          h += '<li><div class="ligne"><a class="nav-lien" href="#' + sec.id + '" data-route="' + sec.id + '"><span class="num-seance">' + (s.badge || s.num) + "</span>" + esc(sec.court || sec.titre) + "</a>" +
            (aQ ? '<button class="fleche petite" aria-label="Afficher les questions" aria-expanded="' + (ouverts[kk] ? "true" : "false") + '" data-ouvre="' + kk + '">' + FLECHE + "</button>" : "") + "</div>";
          if (aQ) {
            h += '<ul class="questions-menu" id="m-' + kk + '"' + (ouverts[kk] ? "" : " hidden") + ">";
            sec.questions.forEach(function (q) {
              h += '<li><a class="nav-lien" href="#' + q.id + '"><span class="qn">' + esc(q.num) + "</span>" + esc(q.court) + "</a></li>";
            });
            h += "</ul>";
          }
          h += "</li>";
        });
      });
      h += "</ul></li>";
    }
    C.tps.forEach(function (tp) { onglet("tp" + tp.num, "tp" + tp.num, "TP " + tp.num + " · " + tp.titre, tp.seances); });
    h += '<li class="nav-sep"></li>';
    if (T.seances.length) onglet("terre", "terre", "TP mise à la terre · " + T.titre, T.seances.map(function (s) { return s.id; }));
    h += '<li><a class="nav-lien nav-simple" href="#jeux" data-route="jeux">Jeux</a></li>';
    h += '<li><a class="nav-lien nav-simple" href="#prof" data-route="prof">Espace prof</a></li>';
    h += "</ul>";
    var m = $("#menu"); m.innerHTML = h;
    m.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ouvre]");
      if (b) {
        var k = b.getAttribute("data-ouvre"), ul = $("#m-" + k), ouvert = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", ouvert); ul.hidden = !ouvert; ouverts[k] = ouvert; lsSet("menu", JSON.stringify(ouverts));
        return;
      }
      if (e.target.closest("a") && window.innerWidth <= 860) m.classList.remove("ouvert");
    });
  }
  function deplierPour(route) {
    var tp = null, sec = null;
    var s = seanceDeSection(route) || seanceDeQuestion(route) || seances[route.replace("seance-", "")];
    if (s) {
      tp = "tp" + s.tp;
      if (route.indexOf("q-") === 0) s.sections.forEach(function (x) { if (x.questions.some(function (q) { return q.id === route; })) sec = "sec-" + x.id; });
    }
    [tp, sec].forEach(function (k) {
      if (!k) return;
      var b = document.querySelector('[data-ouvre="' + k + '"]'), ul = $("#m-" + k);
      if (b && ul) { b.setAttribute("aria-expanded", "true"); ul.hidden = false; }
    });
    document.querySelectorAll("#menu .nav-lien.actif").forEach(function (a) { a.classList.remove("actif"); });
    var a = document.querySelector('#menu a[href="#' + route + '"]');
    if (a) { a.classList.add("actif"); a.scrollIntoView({ block: "nearest" }); }
  }

  /* ---------- Rendu des blocs ---------- */
  function rendreTable(rows) {
    var h = '<div class="tableau"><table>';
    rows.forEach(function (r) {
      h += "<tr>";
      r.forEach(function (cell) {
        if (!cell.length) { h += '<td class="vide"></td>'; return; }
        h += "<td>" + cell.map(function (x) { return x.img ? '<img src="images/seances/' + x.img + '" alt="">' : "<p>" + segs(x) + "</p>"; }).join("") + "</td>";
      });
      h += "</tr>";
    });
    h += "</table></div>";
    var aRemplir = rows.some(function (r) { return r.some(function (c) { return !c.length; }); });
    return aRemplir ? '<div class="a-recopier">' + h + '<p class="note-feuille">Tableau à recopier et compléter sur votre feuille.</p></div>' : h;
  }
  function listeSavoirs(lignes) {
    return '<ul class="savoirs">' + lignes.map(function (l) {
      l = l.replace(/\.$/, "");
      var m = /^([^:]{1,70}) : ([\s\S]*)$/.exec(l);
      return "<li>" + (m ? "<b>" + esc(m[1]) + "</b>" + esc(m[2]) : esc(l.charAt(0).toUpperCase() + l.slice(1))) + "</li>";
    }).join("") + "</ul>";
  }
  // Rubriques d'en-tête des séances affichées dans un encadré (icône + titre)
  var ENCADRES = { "Objectifs observables": "🎯", "Compétences visées": "🏅", "Savoirs associés": "📚", "Objectifs opérationnels et preuves": "✅" };
  // Paragraphes « annexes » (organisation, prérequis, notes de lecture) : style à part pour ne pas les confondre avec le contenu
  var ANNEXE = /^(Place dans le module|Prérequis|Travail sur documents|Documents : |Total : |Récit imaginaire|Le récit personnifie|Schéma fonctionnel|Les durées sont)/;
  function rendreBlocs(blocks, sec, s) {
    var h = "", infoSuivant = false, savoirsSuivant = false, encadre = false;
    function fermer() { if (encadre) { h += "</div>"; encadre = false; } }
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (b.t === "h3") {
        fermer();
        if (V.bullesInfo.indexOf(b.text) >= 0) { infoSuivant = b.text; continue; }
        if (b.text === "Ma mission avec Tournesol") { infoSuivant = "mission"; continue; }
        if (ENCADRES[b.text]) { h += '<div class="encadre"><h3><span aria-hidden="true">' + ENCADRES[b.text] + "</span>" + esc(b.text) + "</h3>"; encadre = true; }
        else h += "<h3>" + esc(b.text) + "</h3>";
        if (b.text === "Savoirs associés") savoirsSuivant = true;
        continue;
      }
      if (b.t === "q") fermer();
      if (b.t === "p") {
        if (infoSuivant) {
          h += infoSuivant === "mission" ? bulle(segs(b.s), { qui: "Votre mission" }) : bulle(segs(b.s), { petite: true, info: true, qui: infoSuivant });
          infoSuivant = false; continue;
        }
        var t = texte(b.s);
        // Savoirs associés : une ligne par thème (« Thème : … ») ou par savoir (« a ; b ; c »)
        if (savoirsSuivant) { savoirsSuivant = false; h += listeSavoirs(t.split(/\.\s+(?=[A-ZÉ][^:.]{0,70} : )/)); continue; }
        if (/^Savoirs associés : /.test(t)) { fermer(); h += '<div class="encadre"><h3><span aria-hidden="true">📚</span>Savoirs associés</h3>' + listeSavoirs(t.replace(/^Savoirs associés : /, "").replace(/\.$/, "").split(/\s*;\s*/)) + "</div>"; continue; }
        // Puces « • » consécutives : une vraie liste
        if (/^• /.test(t)) {
          var puces = [];
          while (i < blocks.length && blocks[i].t === "p" && /^• /.test(texte(blocks[i].s))) { puces.push(texte(blocks[i].s).slice(2)); i++; }
          i--; h += '<ul class="puces">' + puces.map(function (x) { var d = /^([^:]{1,30}) : ([\s\S]+)$/.exec(x); return "<li>" + (d ? "<b>" + esc(d[1]) + "</b> : " + esc(d[2]) : esc(x)) + "</li>"; }).join("") + "</ul>"; continue;
        }
        // Compétences visées : une compétence par ligne
        if (encadre && /^C\d+ — [^\n]+\n/.test(t)) { h += '<ul class="puces">' + t.split("\n").map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; continue; }
        if (ANNEXE.test(t)) { fermer(); h += '<p class="note-annexe">' + segs(b.s) + "</p>"; continue; }
        if (/^Réussite : /.test(t)) { h += '<div class="reussite"><b>Pour réussir</b><span>' + esc(t.replace(/^Réussite : (.)/, function (m, c) { return c.toUpperCase(); })) + "</span></div>"; continue; }
        if (/\nObservateur /.test(t)) {
          h += "<p>" + esc(t.split("\nObservateur")[0]) + '</p><p class="note-feuille">Sur la feuille, l\'observateur écrit son nom et coche « conseil compris » ou « à reprendre ».</p>';
          continue;
        }
        // Cas A / B / C sur plusieurs lignes : liste avec le nom du cas en gras
        if (/^Cas [A-Z] — [^\n]*\nCas [A-Z] — /.test(t)) {
          h += '<ul class="aere">' + t.split("\n").map(function (l) {
            var d = /^(Cas [A-Z] — [^:]+) : ([\s\S]+)$/.exec(l);
            if (!d) return "<li>" + esc(l) + "</li>";
            var p = d[2].replace(/\.$/, "").split(/ ; |\. (?=[A-ZÉ])/);
            return "<li><b>" + esc(d[1]) + "</b> : " + (p.length > 1 ? "<ul>" + p.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : esc(d[2])) + "</li>";
          }).join("") + "</ul>";
          continue;
        }
        // Gros pavés (longs paragraphes à plusieurs phrases) : une ligne par phrase, sous-liste pour « Titre : a ; b ; c »
        if (b.s.length === 1 && !b.s[0][1] && !b.s[0][2] && t.length > 200) {
          var phrases = t.split(/(?<=[.!?])\s+(?=[A-ZÉÈÀÂ«])/);
          if (phrases.length >= 3 || t.split(" ; ").length >= 3) {
            h += '<ul class="aere">' + phrases.map(function (ph) {
              var d = /^([^:;]{2,45}) : ([\s\S]+)$/.exec(ph);
              if (d && d[2].indexOf(" ; ") >= 0) return "<li><b>" + esc(d[1]) + "</b> :<ul>" + d[2].replace(/\.$/, "").split(" ; ").map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></li>";
              return "<li>" + esc(ph) + "</li>";
            }).join("") + "</ul>";
            continue;
          }
        }
        h += "<p>" + segs(b.s) + "</p>"; continue;
      }
      if (b.t === "dial") { h += b.qui === "Tintin" ? bulleTintin(segs(b.s)) : bulle(segs(b.s), { petite: !b.portrait, qui: b.qui, portrait: b.portrait }); continue; }
      if (b.t === "img") {
        var vid = (V.videosAvant || {})[b.src];
        if (vid) h += '<a class="video" href="' + vid.url + '" target="_blank" rel="noopener"><span class="video-play" aria-hidden="true">▶</span><span><b>' + esc(vid.titre) + "</b>" + esc(vid.texte) + '<small>Vidéo YouTube : il faut une connexion internet.</small></span></a>';
        var im = (RT.images || {})[b.src] || {};
        h += '<figure class="schema"><img src="images/seances/' + (im.src || b.src) + '" alt="' + esc(im.alt || b.alt || "Schéma de la séance") + '">' +
          (im.legende ? "<figcaption>" + esc(im.legende) + "</figcaption>" : "") + "</figure>";
        continue;
      }
      if (b.t === "table") {
        h += rendreTable(b.rows);

        continue;
      }
      if (b.t === "q") {
        // Le simulateur de CPI est placé AVANT la question qui l'utilise
        if (b.id === "q-T3-V3") h += '<p class="sim-avant">Utilisez ce simulateur de contrôleur permanent d\'isolement pour répondre à la question suivante.</p><div data-composant="cpi"></div>';
        h += '<div class="question' + (b.v ? " violette" : "") + '" id="' + b.id + '"><span class="numero">' + esc(b.num) + '</span><div class="enonce">' + enonceAere(b) +
          (b.indice ? '<div class="indice"><button type="button" data-indice="Indice" aria-expanded="false">Indice</button><div class="reponse-indice" hidden>' + esc(b.indice) + "</div></div>" : "") +
          (b.aide ? '<div class="indice"><button type="button" data-indice="Aide" aria-expanded="false">Aide</button><div class="reponse-indice" hidden>' + esc(b.aide) + "</div></div>" : "") +
          (b.feuille ? '<div class="feuille"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 12l8-8 2 2-8 8H2z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Je réponds sur ma feuille</div>' : "") + "</div></div>";
        // Tableau à recopier et compléter sur la feuille (VIVANT.tableauxARemplir : [entêtes, lignes])
        var tr = (V.tableauxARemplir || {})[b.id];
        if (tr) h += '<p class="note-feuille">Recopiez ce tableau sur votre feuille et complétez-le.</p>' + rendreTable([tr[0].map(function (c) { return [[[c, 1, ""]]]; })].concat(tr[1].map(function (l) { return [[[[l, 1, ""]]]].concat(tr[0].slice(1).map(function () { return []; })); })));
        if (profOuvert() && modeCorrige) h += correction(s, b.num);
        if (s.id === "1-1" && b.num === "4") h += '<div data-composant="ordre"></div>';
        if (b.id === "q-1-2-12") h += '<div data-composant="panneau-virtuel"></div>';
        if (b.id === "q-3-3-V3B-2") h += '<div data-composant="modbus"></div>';
        if (b.id === "q-1-2-V1B-2") h += bulle('Votre schéma est fait ? Vérifiez-le avec les boutons <strong>Le jour</strong> et <strong>La nuit</strong> du <a href="#s1-1-plan">plan de l\'installation</a>.', { petite: true, info: true, qui: "Pour vérifier" });
      }
    }
    fermer();
    return h;
  }
  function rendreSection(sec, s) {
    var cls = "case " + (sec.kind || "");
    var etiq = { complement: "Complément", questionnaire: "Révision", ressource: "Ressource", bilan: "Bilan", defi: "Défi", plan: "Interactif", quizpieces: "Quiz", bd: "BD" }[sec.kind];
    var titre = sec.court || sec.titre;
    if (sec.code) etiq = "Complément " + sec.code;
    if (etiq === titre) etiq = null;
    var h = '<section class="' + cls + '" id="' + sec.id + '"><h2>' + (etiq ? '<span class="etiquette">' + etiq + "</span>" : "") + esc(titre) + "</h2>";
    var cle = s.num + "|" + sec.titre;
    if (V.bullesParties[cle]) h += bulle(esc(V.bullesParties[cle]), { petite: true });
    if (sec.kind === "bd") {
      var bd = V.bd[s.id];
      h += '<figure class="planche"><img src="' + bd.image + '" alt="Planche de bande dessinée : ' + esc(bd.titre) + '" data-zoom><figcaption>' + esc(bd.legende) + "</figcaption></figure>";
    } else if (sec.kind === "plan") {
      h += '<div data-composant="plan"></div>';
    } else if (sec.kind === "quizpieces") {
      h += '<div data-composant="quiz-pieces"></div>';
    } else if (sec.kind === "bilan") {
      h += (s.tp === "terre" ? '<p>Ce bilan est rempli <strong>par votre enseignant, sur une fiche papier</strong>. Voici les compétences qu\'il observe pendant cette activité :</p>' : bulle("Ce bilan est rempli <strong>par votre enseignant, sur une fiche papier</strong>. Voici les compétences qu'il observe pendant ce TP :", { petite: true })) +
        '<ul class="competences">' + competences(sec).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>";
    } else {
      h += rendreBlocs(sec.blocks, sec, s);
      // Simulateur du courant de défaut : un régime par activité, au début
      var regime = sec.kind === "mission" && { T1: "TT", T2: "TN", T3: "IT" }[s.id];
      if (regime) h += '<div class="sim-intro"><h3>Où passe le courant de défaut ? Le régime ' + regime + ' pas à pas</h3><p>Un fil abîmé touche la carcasse en métal de la machine de Marie. Avancez étape par étape pour voir par où le courant revient, et qui l\'arrête.</p><div data-composant="ou-passe-electron" data-regime="' + regime + '"></div></div>';
    }
    return h + "</section>";
  }

  function competences(sec) {
    var t = sec.blocks.filter(function (b) { return b.t === "table"; })[0];
    return t ? t.rows.slice(1).map(function (r) { return r[0].map(texte).join(" "); }) : [];
  }
  function bilanDe(s) { return s.sections.filter(function (x) { return x.kind === "bilan"; })[0]; }
  function apresTitre(sec, titre) {
    var i = sec.blocks.findIndex(function (b) { return b.t === "h3" && b.text === titre; });
    return i >= 0 && sec.blocks[i + 1] && sec.blocks[i + 1].t === "p" ? texte(sec.blocks[i + 1].s) : "";
  }

  /* ---------- Pages ---------- */
  function pageAccueil() {
    var h = '<div class="accueil-hero"><div style="display:grid;gap:14px"><span class="bandeau">Module photovoltaïque</span>' +
      '<h1 class="titre-page">Bienvenue dans l\'aventure de Tintin sur l\'île Noire</h1>' +
      '<p class="chapeau">Tintin s\'installe sur une île sans électricité. Avec le professeur Tournesol, vous allez l\'aider à la rendre autonome grâce au soleil : comprendre, calculer, installer, puis dépanner.</p>' +
      '<div><a class="btn jaune" href="#tp1">Aider Tintin : commencer le TP 1</a></div></div>' +
      '<img src="images/bd-arrivee.jpg" alt="Case de bande dessinée : Tintin et Milou arrivent en barque sur l\'île" data-zoom></div>';
    h += bulle("Bonjour ! Je suis le professeur Tournesol. Chaque TP suit l'histoire de Tintin. Utilisez le menu à gauche : cliquez sur un TP, puis sur une partie ou directement sur une question. Vous répondez sur votre feuille, le site vous guide.");
    h += '<div class="cartes">';
    C.tps.forEach(function (tp) {
      var n = tp.seances.length;
      h += '<a class="carte" href="#tp' + tp.num + '"><span class="tp-num">TP ' + tp.num + "</span><b>" + esc(tp.titre) + "</b><span>" + n + " séance" + (n > 1 ? "s" : "") + " de 4 h</span></a>";
    });
    h += '<a class="carte" href="#terre"><span class="tp-num">TP à part</span><b>La mise à la terre : ' + esc(T.titre.replace(/^Les r/, "r")) + "</b><span>" + T.seances.length + " activités de 4 h</span></a>";
    h += '<a class="carte jeux" href="#jeux"><span class="tp-num">Pour s\'entraîner</span><b>Les jeux de Tournesol</b><span>Memory, juste prix, vrai ou faux, mots croisés</span></a>';
    // Visible seulement en mode prof : la liste des points à retravailler
    if (profOuvert()) {
      var nb = (window.VIVANT.aRetravailler || []).length;
      h += '<a class="carte a-retravailler" href="#a-retravailler"><span class="tp-num">Pour l\'équipe</span><b>À retravailler</b><span>' + nb + " point" + (nb > 1 ? "s" : "") + " ouverts : questions pour les profs, idées et tâches de l'équipe</span></a>";
    }
    h += "</div>";
    return h + pied();
  }
  function pageTP(n) {
    var tp = C.tps[n - 1];
    var h = '<span class="bandeau">TP ' + n + '</span><h1 class="titre-page">' + esc(tp.titre) + "</h1>" + bulle(esc(V.bullesTP[n]));
    tp.seances.forEach(function (sid) {
      var s = seances[sid];
      h += '<section class="case"><h2><span class="etiquette">Séance ' + s.num + "</span>" + esc(s.titre) + "</h2><p>4 heures · " + s.sections.length + ' parties</p><div><a class="btn" href="#seance-' + sid + '">Ouvrir la séance ' + s.num + "</a></div></section>";
    });
    if (n === 1) h += '<figure class="planche"><img src="images/bd-tintin-tel.jpg" alt="Tintin se demande combien de panneaux il lui faudra" style="max-width:520px"></figure>';
    return h + pied();
  }
  // Tableau des abréviations utilisées dans la séance (tirées de VIVANT.lexique)
  function textesDe(o, acc) {
    if (typeof o === "string") acc.push(o);
    else if (Array.isArray(o)) o.forEach(function (x) { textesDe(x, acc); });
    else if (o && typeof o === "object") Object.keys(o).forEach(function (k) { if (["src", "id", "kind", "t", "tp", "alt"].indexOf(k) < 0) textesDe(o[k], acc); });
    return acc;
  }
  // Jamais dans les tableaux : sans utilité pour comprendre, ou déjà connues (choix d'Arthur)
  var ABREV_EXCLUES = ["MELEC", "NF C 18-510", "NF C 15-100", "UTE C 15-712-2", "QSSE", "TT", "TN", "IT", "L", "N", "PE", "U"];
  function abreviationsDe(s) {
    var txt = textesDe(s.sections, []).join("\n"), out = [];
    // Questions qui demandent le sens d'une abréviation : on ne donne pas la réponse
    var qDef = [];
    s.sections.forEach(function (sec) { sec.blocks.forEach(function (b) { if (b.t === "q") { var t = texte(b.s); if (/nommez|que signifie|signifi|que désigne|que veut dire|différence entre|définissez/i.test(t)) qDef.push(t); } }); });
    var exclues = ABREV_EXCLUES.concat((V.abrevRetirees || {})[s.id] || []);
    var formule = function (tok) { return "(?:^|[\\s(×/=])" + tok + "(?=\\s*[=×/)]|\\s*$)|[×/=]\\s?" + tok + "(?![\\p{L}\\p{N}_])"; };
    (V.lexique || []).forEach(function (g) {
      if (g.tp && g.tp !== String(s.tp)) return;
      if (g.titre === "Les unités") return;
      g.mots.forEach(function (m) {
        var toks = m[0].split(/\s*(?:\/|,| à )\s*/).filter(Boolean).map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/DEF\d/, "DEF\\d"); });
        var ok = toks.some(function (t) {
          var re = t.length === 1 && g.tp === "3" ? formule(t) : "(?:^|[^\\p{L}\\p{N}_])" + t + "(?![\\p{L}\\p{N}_’'])";
          return new RegExp(re, "u").test(txt);
        });
        var demandee = qDef.some(function (q) { return toks.some(function (t) { return new RegExp("(?:^|[^\\p{L}\\p{N}_])" + t + "(?![\\p{L}\\p{N}_’'])", "u").test(q); }); });
        if (ok && !demandee && exclues.indexOf(m[0]) < 0) out.push(m);
      });
    });
    return out;
  }
  function tableauAbreviations(s) {
    var l = abreviationsDe(s);
    if (!l.length) return "";
    return '<details class="abrev" open><summary>🔤 Les abréviations de cette ' + (s.tp === "terre" ? "activité" : "séance") + " (" + l.length + ')</summary><table><tbody>' +
      l.map(function (m) { return '<tr><th scope="row">' + esc(m[0]) + "</th><td><b>" + esc(m[1]) + "</b> : " + esc(m[2]) + "</td></tr>"; }).join("") + "</tbody></table></details>";
  }
  // Les corrections ne s'affichent que sur la page « Corrigé » de l'Espace prof, jamais dans le TP lui-même
  var modeCorrige = false;
  function pageSeance(s) {
    var h = (modeCorrige ? '<p class="bandeau-corrige">Version corrigée : réservée aux enseignants</p>' : "") + '<span class="bandeau">' + (s.tp === "terre" ? "Mise à la terre · Activité " + s.num + " · " + esc(s.code) : "TP " + s.tp + " · Séance " + s.num) + '</span><h1 class="titre-page">' + esc(s.titre) + "</h1>";
    h += tableauAbreviations(s);
    // Fiche technique accessible dès le début des exercices (elle reste aussi en fin de séance)
    var fiche = s.sections.filter(function (x) { return x.kind === "ressource" && /Fiche technique/.test(x.titre); })[0];
    if (fiche) h += '<details class="fiche-rapide"><summary>📄 Fiche technique de référence : à garder sous les yeux pendant les exercices</summary><div>' + rendreBlocs(fiche.blocks, fiche, s) + "</div></details>";
    s.sections.forEach(function (sec) { h += rendreSection(sec, s); });
    if (profOuvert() && modeCorrige && s.corrige.length) h += blocCorrige(s);
    // Séance précédente / suivante, sans passer des TP solaires au module « terre »
    var ids = Object.keys(seances).filter(function (k) { return (seances[k].tp === "terre") === (s.tp === "terre"); }), i = ids.indexOf(s.id);
    var nom = function (x) { return (x.tp === "terre" ? "Activité " : "Séance ") + x.num; };
    h += '<nav class="suite">' + (i > 0 ? '<a class="btn leger" href="#seance-' + ids[i - 1] + '">← ' + nom(seances[ids[i - 1]]) + "</a>" : "<span></span>") +
      (i < ids.length - 1 ? '<a class="btn" href="#seance-' + ids[i + 1] + '">' + nom(seances[ids[i + 1]]) + " →</a>" : "") + "</nav>";
    return h + pied();
  }
  // Énoncés longs : une phrase par ligne, pour ne pas laisser de gros pavés
  function enonceAere(b) {
    if (b.s.length !== 1 || b.s[0][1] || b.s[0][2] || texte(b.s).length <= 200) return segs(b.s);
    var ph = texte(b.s).split(/(?<=[.!?»])\s+(?=[A-ZÉÈÀÂ«])/);
    return ph.length < 3 ? segs(b.s) : ph.map(function (x) { return '<span class="ligne-aeree">' + esc(x) + "</span>"; }).join("");
  }
  function correction(s, num) {
    var c = (window.CORRIGES || {})[s.id + "|" + num];
    if (!c) return "";
    if (Array.isArray(c)) c = { lignes: c };
    function ligne(t) {
      var m = /^([^:]{1,40}) : ([\s\S]*)$/.exec(t);
      return "<p>" + (m ? "<strong>" + esc(m[1]) + " :</strong> " + esc(m[2]) : esc(t)) + "</p>";
    }
    var h = '<div class="correction"><div class="corr-titre">Question ' + esc(num) + " – Correction</div>" +
      (c.lignes || []).map(ligne).join("");
    if (c.document) h += documentPro(c.document);
    if (c.tableau) h += '<div class="tableau"><table>' + c.tableau.map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + esc(x) + "</td>"; }).join("") + "</tr>"; }).join("") + "</table></div>";
    return h + (c.apres || []).map(ligne).join("") + "</div>";
  }
  // Exemple de compte rendu présenté comme un vrai document professionnel
  function documentPro(d) {
    return '<div class="doc-pro"><div class="doc-tete"><b>' + esc(d.titre) + "</b><span>" + esc(d.sous) + "</span></div><table>" +
      d.champs.map(function (c) { return "<tr><th>" + esc(c[0]) + "</th><td>" + esc(c[1]) + "</td></tr>"; }).join("") +
      '</table><div class="doc-pied">' + esc(d.signature) + " : ____________</div></div>";
  }
  function blocCorrige(s) {
    var h = '<section class="corrige case" id="corrige-' + s.id + '"><h2><span class="etiquette" style="background:var(--vert-prof)">Prof</span>Corrigé ' + (s.tp === "terre" ? "de l'activité " + s.num + " (" + esc(s.code) + ")" : "de la séance " + s.num) + "</h2>";
    s.sections.forEach(function (sec) {
      var c = sec.questions.map(function (q) { return correction(s, q.num); }).join("");
      if (c) h += '<div class="corr-partie"><h3>' + esc(sec.court || sec.titre) + "</h3>" + c + "</div>";
    });
    h += '<details class="corrige-origine"><summary>Corrigé d\'origine des enseignants</summary>';
    s.corrige.forEach(function (b) {
      if (b.t === "h3") h += "<h3>" + esc(b.text) + "</h3>";
      else if (b.t === "p") h += "<p>" + segs(b.s) + "</p>";
      else if (b.t === "table") h += rendreTable(b.rows);
    });
    return h + "</details></section>";
  }
  function pageFiche() {
    var h = '<div class="pas-imprime" style="display:grid;gap:14px"><span class="bandeau"><a href="#prof" style="color:inherit">Espace prof</a></span>' +
      bulle("Une fiche par élève. Cochez un niveau pour chaque compétence observée ; laissez la ligne vide si elle n'a pas été observée.", { petite: true }) +
      '<div><button class="btn jaune" type="button" data-imprimer>Imprimer la fiche</button></div></div>' +
      '<div class="fiche-comp"><h1 class="titre-page" style="font-size:26px">Tintin sur l\'île Noire PV · Suivi des compétences</h1>' +
      '<div class="entete"><span>Nom :</span><span>Prénom :</span><span>Classe :</span></div>' +
      '<p class="preuves"><strong>Non acquis</strong> : la tâche n\'est pas encore réussie. <strong>En cours</strong> : réussie en partie ou avec de l\'aide. <strong>Acquis</strong> : réussie avec l\'autonomie attendue.</p>';
    C.tps.forEach(function (tp) {
      tp.seances.forEach(function (sid) {
        var sec = bilanDe(seances[sid]); if (!sec) return;
        h += '<div class="bloc-tp"><h3>TP ' + tp.num + " · " + esc(tp.titre) + " (fin de la séance " + seances[sid].num + ")</h3>" +
          '<div class="tableau"><table><tr><td>Compétence MELEC</td><td class="cc">Non acquis</td><td class="cc">En cours</td><td class="cc">Acquis</td></tr>' +
          competences(sec).map(function (c) { return "<tr><td>" + esc(c) + '</td><td class="cc">☐</td><td class="cc">☐</td><td class="cc">☐</td></tr>'; }).join("") + "</table></div>";
        var pr = apresTitre(sec, "Preuves à examiner");
        if (pr) h += '<p class="preuves"><strong>Preuves à examiner :</strong> ' + esc(pr) + "</p>";
        h += '<div class="obs">Observation de l\'enseignant</div></div>';
      });
    });
    return h + "</div>";
  }
  // Lexique : les abréviations des TP (données dans VIVANT.lexique)
  function pageLexique() {
    var h = '<span class="bandeau"><a href="#prof" style="color:inherit">Espace prof</a></span><h1 class="titre-page">Le lexique de Tournesol</h1>' +
      bulle("Vmp, Isc, kWc… Toutes les abréviations des TP, avec les valeurs de l'installation de Tintin. Cherchez celle qui vous bloque.") +
      '<div class="lex-recherche"><label for="lex-cherche">Chercher une abréviation</label><input id="lex-cherche" type="search" placeholder="Par exemple : Vmp" autocomplete="off"></div>';
    (window.VIVANT.lexique || []).forEach(function (g) {
      h += '<section class="case lex-groupe"><h2><span aria-hidden="true">' + g.ico + "</span> " + esc(g.titre) + '</h2><dl class="lexique">' +
        g.mots.map(function (m) {
          return '<div class="lex-mot"><dt><span class="lex-abr">' + esc(m[0]) + '</span><span class="lex-nom">' + esc(m[1]) + "</span></dt><dd>" + esc(m[2]) +
            (m[3] ? '<span class="lex-ex">Exemple : ' + esc(m[3]) + "</span>" : "") + "</dd></div>";
        }).join("") + "</dl></section>";
    });
    return h + '<p class="retour ko" id="lex-vide" hidden>Aucune abréviation trouvée. Essayez avec moins de lettres.</p>' + pied();
  }
  function monterLexique(racine) {
    var champ = racine.querySelector("#lex-cherche");
    if (!champ) return;
    champ.addEventListener("input", function () {
      var t = champ.value.trim().toLowerCase(), vus = 0;
      racine.querySelectorAll(".lex-groupe").forEach(function (g) {
        var n = 0;
        g.querySelectorAll(".lex-mot").forEach(function (m) {
          var ok = !t || m.textContent.toLowerCase().indexOf(t) >= 0;
          m.hidden = !ok; if (ok) n++;
        });
        g.hidden = !n; vus += n;
      });
      racine.querySelector("#lex-vide").hidden = vus > 0;
    });
  }
  // À retravailler : points ouverts (données dans VIVANT.aRetravailler)
  function pageARetravailler() {
    var l = window.VIVANT.aRetravailler || [];
    var POUR = [["benin", "Questions pour les profs du Bénin"], ["paris", "Questions pour Monsieur Paris"], ["idee", "Mes idées à présenter"], ["equipe", "À faire par l'équipe"]];
    var h = '<span class="bandeau"><a href="#prof" style="color:inherit">Espace prof</a></span><h1 class="titre-page">À retravailler</h1>' +
      bulle("Tout ce qu'on ne sait pas encore, ou qu'il faut revoir, rangé par destinataire puis par TP.") + '<div class="ar-liste">';
    POUR.forEach(function (p) {
      var items = l.filter(function (it) { return it.pour === p[0]; });
      if (!items.length) return;
      h += '<section class="case ar-groupe ar-' + p[0] + '"><h2>' + esc(p[1]) + " (" + items.length + ")</h2>";
      var tps = [];
      items.forEach(function (it) { if (tps.indexOf(it.tp) < 0) tps.push(it.tp); });
      tps.forEach(function (g) {
        h += "<h3>" + esc(g) + '</h3><ul class="tirets">';
        items.filter(function (it) { return it.tp === g; }).forEach(function (it) {
          h += "<li><b>" + esc(it.titre) + "</b> : " + esc(it.texte) +
            (it.options ? '<ul class="tirets">' + it.options.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>" : "") +
            (it.lien ? ' <a href="' + it.lien + '">Voir sur le site</a>' : "") + "</li>";
        });
        h += "</ul>";
      });
      h += "</section>";
    });
    return h + "</div>" + pied();
  }
  function pageTerre() {
    var h = '<span class="bandeau">TP à part · hors histoire de Tintin</span><h1 class="titre-page">' + esc(T.titre) + "</h1>";
    T.seances.forEach(function (s) {
      h += '<section class="case"><h2><span class="etiquette">Activité ' + s.num + " · " + esc(s.code) + "</span>" + esc(s.titre) + "</h2><p>4 heures · " + s.sections.length + ' parties</p><div><a class="btn" href="#seance-' + s.id + '">Ouvrir l\'activité ' + s.num + "</a></div></section>";
    });
    return h + pied();
  }
  // Espace prof : les « Ressources et repères » de chaque TP, regroupés (retirés des pages des TP)
  function pageRessources() {
    var h = '<span class="bandeau"><a href="#prof" style="color:inherit">Espace prof</a></span><h1 class="titre-page">Ressources et repères</h1>' +
      '<p>Dossiers, références et limites de chaque activité, tels que fournis par les enseignants. Ces parties ne sont pas montrées aux élèves.</p>';
    Object.keys(seances).forEach(function (k) {
      var s = seances[k];
      (s.sectionsProf || []).forEach(function (sec) {
        h += rendreSection(sec, s).replace("<h2>", '<h2><span class="etiquette">' + (s.tp === "terre" ? "Terre · " + esc(s.code) : "TP " + s.tp + " · " + s.num) + "</span>");
      });
    });
    return h + pied();
  }
  function pageProf() {
    if (!profOuvert()) {
      return '<span class="bandeau">Espace prof</span><h1 class="titre-page">Espace enseignant</h1>' +
        '<section class="case"><p>Cet espace contient les corrigés des séances. Il est réservé aux enseignants.</p>' +
        '<form class="prof-form" id="prof-form"><label for="mdp">Mot de passe</label><input id="mdp" type="password" autocomplete="off"><button class="btn" type="submit">Entrer</button><span class="retour ko" id="prof-err" hidden>Mot de passe incorrect.</span></form>' +
        '<p style="font-size:13px;color:var(--gris)">Protection simple, sans serveur : elle évite seulement que les élèves tombent sur les corrigés par hasard.</p></section>' + pied();
    }
    var h = '<span class="bandeau">Espace prof</span><h1 class="titre-page">Espace enseignant</h1>' +
      '<section class="case"><h2>Mode d\'emploi</h2><p>Les corrigés s\'affichent maintenant aussi en bas de chaque séance, en vert. Ils sont repris sans modification des supports enseignants.</p>' +
      "<p><strong>À relire par l'enseignant :</strong> les textes ajoutés par l'équipe (bulles de Tournesol, fiches du plan interactif, quiz, jeux) se trouvent dans le fichier <code>js/vivant.js</code>.</p>" +
      '<p>Le panneau virtuel de la séance 1.2 est une simulation simplifiée : il remplace la maquette seulement si le lycée n\'en a pas.</p></section>';
    h += '<section class="case"><h2><span class="etiquette">À imprimer</span>Fiche de suivi des compétences</h2><p>Le site ne garde pas la progression des élèves. Imprimez une fiche par élève : elle regroupe les bilans de compétences de tous les TP, à cocher sur papier.</p><div><a class="btn jaune" href="#fiche-competences">Ouvrir la fiche</a></div></section>';
    h += '<section class="case"><h2><span class="etiquette">Dossier annexe</span>Synthèse des compétences du module</h2><p>Document de l\'enseignant, repris tel quel : le parcours des 11 séances, les compétences C1 à C13 travaillées dans chaque activité, et les fiches détaillées par compétence.</p><div><a class="btn jaune" href="annexes/Synthese_competences_module_PV.pdf" target="_blank" rel="noopener">Ouvrir le PDF</a></div></section>';
    h += '<section class="case"><h2><span class="etiquette">Outil</span>Modifier les TP</h2><p>Changer un texte, une question, un tableau ou une correction, ajouter ou supprimer une question.' + (window.EDITEUR && window.EDITEUR.brouillon ? " <b>Des modifications sont enregistrées dans ce navigateur.</b>" : "") + '</p><div><a class="btn" href="#editeur">Ouvrir l\'éditeur</a></div></section>';
    h += '<section class="case"><h2><span class="etiquette">Annexe</span>Ressources et repères</h2><p>Dossiers, références et limites de chaque activité (TP 5 et mise à la terre). Retirés des pages élèves.</p><div><a class="btn" href="#ressources">Ouvrir</a></div></section>';
    h += '<section class="case"><h2><span class="etiquette">Pour l\'équipe</span>À retravailler</h2><p>Ce qu\'on ne sait pas encore et ce qui reste à revoir, avec les questions à poser aux profs.</p><div><a class="btn jaune" href="#a-retravailler">Voir la liste</a></div></section>';
    h += '<section class="case"><h2><span class="etiquette">Pour l\'équipe</span>Lexique des abréviations</h2><p>Vmp, Imp, Voc, Isc, kWc, MPPT… Toutes les abréviations des TP, expliquées simplement avec les valeurs de Tintin. Réservé à l\'équipe : les élèves découvrent les notions au fil des séances.</p><div><a class="btn jaune" href="#lexique">Ouvrir le lexique</a></div></section>';
    C.tps.forEach(function (tp) {
      h += '<section class="case"><h2><span class="etiquette">TP ' + tp.num + "</span>" + esc(tp.titre) + "</h2><div style=\"display:flex;gap:8px;flex-wrap:wrap\">";
      tp.seances.forEach(function (sid) { h += '<a class="btn leger" href="#corrige-' + sid + '">Corrigé ' + seances[sid].num + "</a>"; });
      h += "</div></section>";
    });
    if (T.seances.length) {
      h += '<section class="case"><h2><span class="etiquette">TP à part</span>' + esc(T.titre) + "</h2><div style=\"display:flex;gap:8px;flex-wrap:wrap\">";
      T.seances.forEach(function (s) { h += '<a class="btn leger" href="#corrige-' + s.id + '">Corrigé ' + esc(s.code) + "</a>"; });
      h += "</div></section>";
    }
    return h + pied();
  }
  function pied() {
    return '<p class="pied">Projet conçu par Monsieur Paris, Arthur Joseph et Kellyan Camas du BTS FED en France.</p>';
  }

  /* ---------- Routeur ---------- */
  function route() {
    var r = (location.hash || "#accueil").slice(1) || "accueil";
    var cible = null, html;
    if (r === "accueil") html = pageAccueil();
    else if (/^tp[1-5]$/.test(r)) html = pageTP(+r.slice(2));
    else if (r === "terre") html = pageTerre();
    else if (r === "lexique") html = profOuvert() ? pageLexique() : pageProf();
    else if (r === "a-retravailler") html = profOuvert() ? pageARetravailler() : pageProf();
    else if (r === "prof") html = pageProf();
    else if (r === "ressources") html = profOuvert() ? pageRessources() : pageProf();
    else if (r === "editeur") html = profOuvert() ? '<span class="bandeau"><a href="#prof" style="color:inherit">Espace prof</a></span><h1 class="titre-page">Modifier les TP</h1>' + bulle("Attention : « Enregistrer » ne modifie le TP que sur CET ordinateur et CE navigateur. Les autres PC, la clé USB et le site en ligne gardent l'ancienne version.") + '<ol class="ed-aide"><li>Modifiez les textes, puis cliquez sur « Enregistrer et voir le résultat » pour vérifier.</li><li>Pour que tout le monde ait la nouvelle version : cliquez sur « Télécharger les fichiers du site ». Vous obtenez 3 fichiers : contenu.js, terre.js et corriges.js.</li><li>Copiez ces 3 fichiers dans le dossier <b>js</b> du site (clé USB ou dossier partagé), en remplaçant les anciens. Recopiez ensuite la clé sur les autres ordinateurs.</li><li>Pour le site en ligne, les 3 fichiers doivent être déposés sur GitHub par une personne qui a accès au dépôt.</li></ol>' + '<div data-composant="editeur"></div>' : pageProf();
    else if (r === "fiche-competences") html = profOuvert() ? pageFiche() : pageProf();
    else if (r === "jeux" || r.indexOf("jeu-") === 0) html = window.JEUX.page(r);
    else if (r.indexOf("seance-") === 0 && seances[r.slice(7)]) html = pageSeance(seances[r.slice(7)]);
    else if (r.indexOf("corrige-") === 0 && seances[r.slice(8)] && profOuvert()) { modeCorrige = true; html = pageSeance(seances[r.slice(8)]); modeCorrige = false; }
    else {
      var s = seanceDeSection(r) || seanceDeQuestion(r);
      if (s) { html = pageSeance(s); cible = r; } else html = pageAccueil();
    }
    var main = $("#page");
    if (main.getAttribute("data-route") !== r) {
      var cleSeance = (seanceDeSection(r) || seanceDeQuestion(r) || {}).id;
      var dejaLa = cleSeance && main.getAttribute("data-seance") === cleSeance;
      if (!dejaLa) {
        main.innerHTML = html;
        main.setAttribute("data-seance", r.indexOf("corrige-") === 0 ? "" : cleSeance || (r.indexOf("seance-") === 0 ? r.slice(7) : ""));
        monter(main);
      }
      main.setAttribute("data-route", r);
    }
    deplierPour(r.indexOf("corrige-") === 0 ? "prof" : r);
    if (cible) {
      var el = document.getElementById(cible);
      if (el) { el.scrollIntoView({ block: "start" }); if (el.classList.contains("question")) { el.classList.remove("surligne"); void el.offsetWidth; el.classList.add("surligne"); } }
    } else window.scrollTo(0, 0);
    if (r === "prof" || ((r === "fiche-competences" || r === "lexique" || r === "a-retravailler" || r === "ressources" || r === "editeur") && !profOuvert())) brancherProf();
    document.title = "Tintin sur l'île Noire PV";
  }
  function brancherProf() {
    var f = $("#prof-form"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if ($("#mdp").value.trim().toLowerCase() === MOT_DE_PASSE_PROF) { setProf(); $("#page").removeAttribute("data-route"); route(); }
      else $("#prof-err").hidden = false;
    });
  }
  function monter(racine) {
    racine.querySelectorAll("[data-composant]").forEach(function (el) {
      var n = el.getAttribute("data-composant");
      if (window.COMPOSANTS && window.COMPOSANTS[n]) window.COMPOSANTS[n](el);
    });
    if (window.JEUX && window.JEUX.monter) window.JEUX.monter(racine);
    monterLexique(racine);
  }

  /* Indices et impression */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-indice]");
    if (b) { var z = b.nextElementSibling, ouvert = z.hidden; z.hidden = !ouvert; b.setAttribute("aria-expanded", String(ouvert)); var lbl = b.getAttribute("data-indice"); b.textContent = ouvert ? (lbl === "Aide" ? "Cacher l'aide" : "Cacher l'indice") : lbl; }
    if (e.target.closest("[data-imprimer]")) window.print();
  });

  /* Zoom des planches */
  document.addEventListener("click", function (e) {
    var img = e.target.closest("img[data-zoom]");
    if (img) {
      var z = document.createElement("div"); z.className = "zoom"; z.innerHTML = '<img src="' + img.getAttribute("src") + '" alt="' + esc(img.alt) + '">';
      z.addEventListener("click", function () { z.remove(); }); document.body.appendChild(z);
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { var z = $(".zoom"); if (z) z.remove(); } });

  construireMenu();
  // Menu sur petit écran : le bouton l'ouvre ; un clic à côté du menu ou la touche Échap le referme
  var voile = document.createElement("div");
  voile.className = "voile-menu";
  document.body.appendChild(voile);
  function menuOuvert(oui) { $("#menu").classList.toggle("ouvert", oui); voile.classList.toggle("visible", oui); }
  $("#bouton-menu").addEventListener("click", function () { menuOuvert(!$("#menu").classList.contains("ouvert")); });
  voile.addEventListener("click", function () { menuOuvert(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") menuOuvert(false); });
  new MutationObserver(function () { voile.classList.toggle("visible", $("#menu").classList.contains("ouvert")); })
    .observe($("#menu"), { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("hashchange", route);
  route();
})();
