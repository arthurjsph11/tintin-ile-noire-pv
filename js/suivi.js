/* Suivi des versions : liste des modifications, fichier zip pour la clé USB, journal Word / LibreOffice. */
(function () {
  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(t) { return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function texteSegs(s) { return (s || []).map(function (x) { return x[0]; }).join(""); }
  function texteCellule(c) { return (c || []).map(texteSegs).join(" "); }

  /* ---------- Liste des modifications entre deux versions ---------- */
  function nomBloc(b) {
    return b.t === "q" ? "Question " + b.num : b.t === "p" ? "Paragraphe" : b.t === "h3" ? "Sous-titre" : b.t === "dial" ? "Bulle de " + b.qui : b.t === "table" ? "Tableau" : b.t === "img" ? "Image" : b.t;
  }
  function texteBloc(b) {
    if (b.t === "q") return texteSegs(b.s);
    if (b.t === "p" || b.t === "dial") return texteSegs(b.s);
    if (b.t === "h3") return b.text || "";
    if (b.t === "table") return b.rows.map(function (r) { return r.map(texteCellule).join(" | "); }).join(" / ");
    if (b.t === "img") return b.src || "";
    return JSON.stringify(b);
  }
  function sig(b) { return b.t + "|" + (b.t === "q" ? b.num + "|" : "") + texteBloc(b); }
  // Alignement des blocs (plus longue sous-suite commune)
  function aligner(a, b) {
    var n = a.length, m = b.length, L = [], i, j;
    for (i = 0; i <= n; i++) { L[i] = []; for (j = 0; j <= m; j++) L[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = sig(a[i]) === sig(b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var ops = [], suppr = [], ajout = [];
    function vider() {
      var k = 0;
      for (; k < Math.min(suppr.length, ajout.length); k++) ops.push({ avant: suppr[k], apres: ajout[k] });
      for (var x = k; x < suppr.length; x++) ops.push({ avant: suppr[x] });
      for (x = k; x < ajout.length; x++) ops.push({ apres: ajout[x] });
      suppr = []; ajout = [];
    }
    i = 0; j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && sig(a[i]) === sig(b[j])) { vider(); i++; j++; }
      else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) ajout.push(b[j++]);
      else suppr.push(a[i++]);
    }
    vider();
    return ops;
  }
  function seancesDe(v) {
    var l = [], parId = {}, ss = v.contenu.seances;
    (Array.isArray(ss) ? ss : Object.keys(ss).map(function (k) { return ss[k]; })).forEach(function (s) { parId[s.id] = s; });
    v.contenu.tps.forEach(function (tp) { tp.seances.forEach(function (id) { if (parId[id]) l.push({ s: parId[id], nom: "TP " + tp.num + " · séance " + parId[id].num }); }); });
    (v.terre.seances || []).forEach(function (s) { l.push({ s: s, nom: "Mise à la terre · " + s.code }); });
    return l;
  }
  function differences(base, neuf) {
    var res = [], avantParId = {};
    seancesDe(base).forEach(function (x) { avantParId[x.s.id] = x; });
    seancesDe(neuf).forEach(function (x) {
      var s = x.s, a = avantParId[s.id] && avantParId[s.id].s; if (!a) return;
      if (a.titre !== s.titre) res.push({ ou: x.nom + " · titre de la séance", type: "modifié", avant: a.titre, apres: s.titre });
      s.sections.forEach(function (sec, si) {
        var asec = a.sections[si]; if (!asec) return;
        var lieu = x.nom + " · " + sec.titre;
        if (asec.titre !== sec.titre) res.push({ ou: x.nom + " · titre de partie", type: "modifié", avant: asec.titre, apres: sec.titre });
        aligner(asec.blocks, sec.blocks).forEach(function (o) {
          if (o.avant && o.apres && o.avant.t === "table" && o.apres.t === "table" && o.avant.rows.length === o.apres.rows.length) {
            o.apres.rows.forEach(function (r, ri) { r.forEach(function (c, ci) {
              var c0 = texteCellule((o.avant.rows[ri] || [])[ci]), c1 = texteCellule(c);
              if (c0 !== c1) res.push({ ou: lieu + " · Tableau, ligne " + (ri + 1) + ", colonne " + (ci + 1), type: "modifié", avant: c0, apres: c1 });
            }); });
          } else if (o.avant && o.apres) res.push({ ou: lieu + " · " + nomBloc(o.apres), type: "modifié", avant: texteBloc(o.avant), apres: texteBloc(o.apres) });
          else if (o.apres) res.push({ ou: lieu + " · " + nomBloc(o.apres), type: "ajouté", apres: texteBloc(o.apres) });
          else res.push({ ou: lieu + " · " + nomBloc(o.avant), type: "supprimé", avant: texteBloc(o.avant) });
        });
      });
    });
    function lignes(c) { return c == null ? "" : (Array.isArray(c) ? c : c.lignes || []).join(" / "); }
    var cles = {}; Object.keys(base.corriges).concat(Object.keys(neuf.corriges)).forEach(function (k) { cles[k] = 1; });
    Object.keys(cles).forEach(function (k) {
      var c0 = base.corriges[k], c1 = neuf.corriges[k];
      if (JSON.stringify(c0) === JSON.stringify(c1)) return;
      var p = k.split("|"), ou = "Corrigé · séance " + p[0].replace("-", ".") + " · question " + p[1];
      res.push(c0 == null ? { ou: ou, type: "ajouté", apres: lignes(c1) } : c1 == null ? { ou: ou, type: "supprimé", avant: lignes(c0) } : { ou: ou, type: "modifié", avant: lignes(c0), apres: lignes(c1) });
    });
    return res;
  }

  /* ---------- Fichier zip (sans compression) ---------- */
  var TABLE = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(o) { var c = 0xffffffff; for (var i = 0; i < o.length; i++) c = TABLE[(c ^ o[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function utf8(t) { return new TextEncoder().encode(t); }
  function zip(fichiers) {
    var parts = [], central = [], pos = 0, d = new Date();
    var heure = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), jour = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    function entete(taille) { var b = new DataView(new ArrayBuffer(taille)); return b; }
    fichiers.forEach(function (f) {
      var nom = utf8(f.nom), data = utf8(f.texte), crc = crc32(data);
      var h = entete(30);
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, heure, true); h.setUint16(12, jour, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
      h.setUint16(26, nom.length, true); h.setUint16(28, 0, true);
      parts.push(h.buffer, nom, data);
      var c = entete(46);
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, heure, true); c.setUint16(14, jour, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
      c.setUint16(28, nom.length, true); c.setUint32(42, pos, true);
      central.push(c.buffer, nom);
      pos += 30 + nom.length + data.length;
    });
    var tailleC = central.reduce(function (n, x) { return n + (x.byteLength || x.length); }, 0);
    var fin = entete(22);
    fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, fichiers.length, true); fin.setUint16(10, fichiers.length, true); fin.setUint32(12, tailleC, true); fin.setUint32(16, pos, true);
    return new Blob(parts.concat(central, [fin.buffer]), { type: "application/zip" });
  }
  function telechargerBlob(nom, blob) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nom;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* ---------- Journal Word / LibreOffice (RTF) ---------- */
  function rtf(t) {
    return String(t == null ? "" : t).replace(/[\\{}]/g, function (c) { return "\\" + c; }).replace(/[^\x00-\x7f]/g, function (c) { var n = c.charCodeAt(0); return "\\u" + (n > 32767 ? n - 65536 : n) + "?"; }).replace(/\n/g, "\\line ");
  }
  function dateFr(iso) { var p = String(iso).split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso; }
  function journalRtf(V) {
    var r = "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}{\\colortbl;\\red31\\green95\\blue153;\\red192\\green57\\blue43;\\red46\\green125\\blue50;\\red107\\green102\\blue92;}\\paperw11906\\paperh16838\\margl1134\\margr1134\\margt1134\\margb1134\\f0\\fs22\n";
    r += "{\\pard\\sa120\\b\\fs36 " + rtf("Tintin sur l'île Noire PV : journal des modifications") + "\\par}\n";
    r += "{\\pard\\sa240\\fs24 " + rtf("Version actuelle : ") + "{\\b " + rtf("version " + V.numero + " du " + dateFr(V.date)) + "}\\par}\n";
    r += "{\\pard\\sa240\\cf4\\fs20 " + rtf("Chaque version est enregistrée dans un fichier zip (Version_N_date.zip), gardé dans le dossier « versions » de la clé USB. Pour revenir à une version, décompressez son fichier zip dans le dossier du site. La version 0 est la version de base livrée par l'équipe.") + "\\par}\n";
    V.journal.slice().reverse().forEach(function (e) {
      r += "{\\pard\\sb240\\sa80\\keepn\\b\\fs28\\cf1 " + rtf("Version " + e.numero + " · " + dateFr(e.date)) + "\\par}\n";
      r += "{\\pard\\sa60 " + rtf("Par : " + e.auteur) + "\\par}\n";
      if (e.motif) r += "{\\pard\\sa60\\i " + rtf(e.motif) + "\\par}\n";
      if (!e.changements.length) r += "{\\pard\\sa120\\cf4 " + rtf(e.numero === 0 ? "Point de départ du suivi." : "Aucun détail.") + "\\par}\n";
      e.changements.forEach(function (c) {
        r += "{\\pard\\sb80\\li284\\b " + rtf("• " + c.ou + " (" + c.type + ")") + "\\par}\n";
        if (c.avant != null && c.avant !== "") r += "{\\pard\\li567\\cf2 " + rtf("Avant : " + c.avant) + "\\par}\n";
        if (c.apres != null && c.apres !== "") r += "{\\pard\\li567\\cf3 " + rtf("Après : " + c.apres) + "\\par}\n";
      });
    });
    return r + "}";
  }

  function aujourdhui() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  var V = window.VERSIONS || { numero: 0, date: aujourdhui(), journal: [] };

  function nouvelleVersion(travail, auteur, motif) {
    var ch = differences(window.EDITEUR.base, travail);
    if (!ch.length) return null;
    var nv = copie(V); nv.numero = V.numero + 1; nv.date = aujourdhui();
    nv.journal.push({ numero: nv.numero, date: nv.date, auteur: auteur, motif: motif, changements: ch });
    var nom = "Version_" + nv.numero + "_" + nv.date;
    telechargerBlob(nom + ".zip", zip([
      { nom: "js/contenu.js", texte: "/* Contenu des séances : version " + nv.numero + " du " + dateFr(nv.date) + ". */\nwindow.CONTENU=" + JSON.stringify(travail.contenu) + ";\n" },
      { nom: "js/terre.js", texte: "/* Régimes de terre : version " + nv.numero + " du " + dateFr(nv.date) + ". */\nwindow.TERRE=" + JSON.stringify(travail.terre) + ";\n" },
      { nom: "js/corriges.js", texte: "/* Corrigés détaillés : version " + nv.numero + " du " + dateFr(nv.date) + ". */\nwindow.CORRIGES=" + JSON.stringify(travail.corriges, null, 1) + ";\n" },
      { nom: "js/versions.js", texte: "/* Suivi des versions des TP. Ce fichier est remplacé à chaque nouvelle version enregistrée avec l'éditeur. */\nwindow.VERSIONS = " + JSON.stringify(nv) + ";\n" },
      { nom: "Journal_des_modifications.rtf", texte: journalRtf(nv) },
      { nom: "LISEZMOI.txt", texte: "Version " + nv.numero + " du " + dateFr(nv.date) + " (" + auteur + ")\r\n\r\n1. Décompressez ce fichier dans le dossier du site sur la clé USB et acceptez de remplacer les fichiers.\r\n2. Rangez ce fichier zip dans le dossier « versions » de la clé : c'est la sauvegarde de cette version.\r\n3. Journal_des_modifications.rtf s'ouvre avec Word ou LibreOffice Writer.\r\n4. En cas de problème, décompressez de la même façon la version précédente, ou versions/Version_0_origine.zip.\r\n" }
    ]));
    return { numero: nv.numero, nb: ch.length };
  }

  /* ---------- Page « Suivi des versions » ---------- */
  function versions(el) {
    var enCours = window.EDITEUR ? differences(window.EDITEUR.base, window.EDITEUR.travail()) : [];
    var h = '<div class="vs-actuelle"><span class="etiquette">Version actuelle</span><b>Version ' + V.numero + '</b><small>du ' + esc(dateFr(V.date)) + ' · ' + esc(V.journal.length ? V.journal[V.journal.length - 1].auteur : "") + '</small>' +
      '<button type="button" class="btn jaune" data-act="journal">Télécharger le journal (Word / LibreOffice)</button></div>';
    if (enCours.length) h += '<p class="vs-attente"><b>' + enCours.length + ' modification' + (enCours.length > 1 ? "s" : "") + ' sur cet ordinateur</b> ne sont pas encore dans une version. Dans l\'éditeur, cliquez sur « Enregistrer la version ' + (V.numero + 1) + ' ».</p>';
    h += '<ol class="vs-liste" reversed>';
    V.journal.slice().reverse().forEach(function (e) {
      h += '<li><details' + (e.numero === V.numero && e.numero ? " open" : "") + '><summary><span class="vs-num">V' + e.numero + '</span><span><b>' + esc(dateFr(e.date)) + '</b> · ' + esc(e.auteur) + (e.motif ? '<br><small>' + esc(e.motif) + '</small>' : "") + '</span><span class="vs-nb">' + (e.numero === 0 ? "base" : e.changements.length + " modif.") + '</span></summary>';
      if (e.changements.length) {
        h += '<ul class="vs-changements">';
        e.changements.forEach(function (c) {
          h += '<li><b>' + esc(c.ou) + '</b> <span class="vs-type vs-' + (c.type === "ajouté" ? "aj" : c.type === "supprimé" ? "su" : "mo") + '">' + esc(c.type) + '</span>' +
            (c.avant ? '<div class="vs-avant">Avant : ' + esc(c.avant) + '</div>' : "") + (c.apres ? '<div class="vs-apres">Après : ' + esc(c.apres) + '</div>' : "") + '</li>';
        });
        h += '</ul>';
      } else h += '<p class="vs-vide">Version de base livrée par l\'équipe. Sa sauvegarde est le fichier <code>versions/Version_0_origine.zip</code> du site.</p>';
      h += '</details></li>';
    });
    el.innerHTML = h + '</ol>';
    el.addEventListener("click", function (e) {
      if (e.target.closest('[data-act="journal"]')) telechargerBlob("Journal_des_modifications_V" + V.numero + ".rtf", new Blob([journalRtf(V)], { type: "application/rtf" }));
    });
  }

  window.COMPOSANTS = window.COMPOSANTS || {};
  window.COMPOSANTS.versions = versions;
  window.SUIVI = { differences: differences, nouvelleVersion: nouvelleVersion, zip: zip, journalRtf: journalRtf };
})();
