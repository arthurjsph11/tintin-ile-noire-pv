/* Accès à l'Espace prof.
   Le mot de passe n'est pas écrit ici : seule son empreinte (SHA-256) est gardée.
   Pour changer le mot de passe : Espace prof > « Changer le mot de passe », puis remplacer ce fichier. */
(function installerAcces(empreinteFichier) {
  function sha256(texte) {
    var k = [], h = [], i, j, bytes = unescape(encodeURIComponent(texte));
    function premier(n) { for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    for (i = 2, j = 0; j < 64; i++) if (premier(i)) { if (j < 8) h[j] = frac(Math.pow(i, 1 / 2)); k[j++] = frac(Math.pow(i, 1 / 3)); }
    var l = bytes.length, mots = [];
    for (i = 0; i < l; i++) mots[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
    mots[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    mots[(((l + 8) >> 6) << 4) + 15] = l * 8;
    function rot(x, n) { return (x >>> n) | (x << (32 - n)); }
    for (var b = 0; b < mots.length; b += 16) {
      var w = [], a = h.slice(0);
      for (i = 0; i < 64; i++) {
        if (i < 16) w[i] = mots[b + i] | 0;
        else w[i] = (w[i - 16] + (rot(w[i - 15], 7) ^ rot(w[i - 15], 18) ^ (w[i - 15] >>> 3)) + w[i - 7] + (rot(w[i - 2], 17) ^ rot(w[i - 2], 19) ^ (w[i - 2] >>> 10))) | 0;
        var t1 = a[7] + (rot(a[4], 6) ^ rot(a[4], 11) ^ rot(a[4], 25)) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + k[i] + w[i];
        var t2 = (rot(a[0], 2) ^ rot(a[0], 13) ^ rot(a[0], 22)) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]));
        a.unshift((t1 + t2) | 0); a[4] = (a[4] + t1) | 0; a.pop();
      }
      for (i = 0; i < 8; i++) h[i] = (h[i] + a[i]) | 0;
    }
    return h.map(function (x) { return ("0000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
  }
  var ENTETE = "/* Accès à l'Espace prof.\n   Le mot de passe n'est pas écrit ici : seule son empreinte (SHA-256) est gardée.\n   Pour changer le mot de passe : Espace prof > « Changer le mot de passe », puis remplacer ce fichier. */\n";
  var empreinte = empreinteFichier;
  // Mot de passe changé sur cet ordinateur (prioritaire sur celui du fichier)
  try { empreinte = localStorage.getItem("tintin-acces-v1") || empreinte; } catch (e) {}
  window.ACCES = {
    sha256: sha256,
    empreinte: empreinte,
    fichier: function (emp) { return ENTETE + "(" + installerAcces.toString() + ")(\"" + emp + "\");\n"; },
    verifier: function (mdp) { mdp = String(mdp || "").trim(); return sha256(mdp) === window.ACCES.empreinte || sha256(mdp.toLowerCase()) === window.ACCES.empreinte; }
  };
})("3516cd8a8124a6025699fa4b318b646a1940bbbd3b10c44fc7c20fbc596d4eaf");
