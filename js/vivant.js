/* Couche « vivante » ajoutée par l'équipe BTS : bulles de Tournesol, plan interactif, quiz, jeux.
   Le contenu des séances (contenu.js) n'est pas modifié ; ces textes s'y ajoutent.
   Tout ce fichier est à faire relire par l'enseignant. */
window.VIVANT = {

  /* Bulles d'ouverture de chaque TP (page TP) */
  bullesTP: {
    1: "Bienvenue, jeune technicien ! Tintin vient de s'installer sur l'île, mais il n'y a pas d'électricité. Avant de construire quoi que ce soit, découvrons ensemble les pièces d'une installation solaire, puis calculons ce dont Tintin a besoin.",
    2: "Un panneau mal placé, c'est de l'énergie perdue ! Dans ce TP, vous allez comprendre l'orientation et l'inclinaison, puis utiliser les logiciels des professionnels pour trouver la meilleure position.",
    3: "Place au chantier ! On calcule les panneaux, la batterie et les câbles, on prépare le devis, puis on monte et on contrôle la maquette.",
    4: "Les Dupondt ont fait l'installation… et rien ne marche comme prévu ! Menez l'enquête : observer, mesurer, trouver la vraie cause, puis réparer.",
    5: "Tintin voudrait aussi de l'eau chaude ! Je lui propose des panneaux hybrides, qui produisent à la fois de l'électricité et de la chaleur. À vous de vérifier, calculs à l'appui, si c'est vraiment une bonne idée pour l'île."
  },

  /* Bulles au début des parties (clé : numéro de séance + titre de la partie) */
  bullesParties: {
    "1.1|Reconnaître les composants": "Voici le chemin de l'énergie, du soleil jusqu'à la lampe de Tintin. Suivez les flèches du schéma avant de répondre !",
    "1.1|Complément V1A Lire une fiche de panneau": "Les Dupondt veulent commander les yeux fermés… Une étiquette de panneau se lit comme une carte d'identité : chaque valeur a un sens !",
    "1.1|Distinguer puissance et énergie": "La puissance, c'est ce que l'appareil demande à un instant donné, en watts. L'énergie, c'est cette puissance multipliée par le temps, en wattheures. Ne les confondez pas !",
    "1.2|Calculer les besoins de Tintin": "Avant de choisir le moindre panneau, il faut savoir combien Tintin consomme chaque jour. Ligne par ligne, sans se presser !",
    "1.2|Observer et expliquer": "Un nuage passe… Que deviennent la tension et l'intensité ? Mesurez d'abord, expliquez ensuite.",
    "1.2|Complément V1B Écouter Tintin": "À vous de jouer les techniciens ! L'un fait Tintin, l'autre pose les questions. Puis on échange les rôles.",
    "1.2|Questionnaire de révision": "Fermez le cours, je vous écoute ! Vous corrigerez ensuite avec votre enseignant."
  },

  /* Titres de sous-parties dont le paragraphe suivant devient une petite bulle d'info */
  bullesInfo: ["Aide pour calculer", "Le message de Tournesol"],

  /* Planches BD placées dans la trame */
  bd: {
    "1-1": { titre: "La BD : Tintin arrive sur l'île", image: "images/seances/b3aa516f40.jpeg",
      legende: "Étapes 1, 3 et 4 : Tintin découvre l'île sans électricité et appelle le professeur Tournesol. Cliquez sur la planche pour l'agrandir." },
    "1-2": { titre: "La BD : établir le besoin de Tintin", image: "images/seances/de07b6e2cb.jpeg",
      legende: "Étape 2 : Tintin fait la liste de ses appareils. Cliquez sur la planche pour l'agrandir." }
  },
  bdRetireesDesObjectifs: ["b3aa516f40.jpeg", "de07b6e2cb.jpeg"],

  /* ---------- Plan interactif de l'installation ---------- */
  zones: [
    { id: "champ", nom: "Champ photovoltaïque", courant: "Courant continu (DC)" },
    { id: "local", nom: "Local technique", courant: "Courant continu (DC) puis alternatif (AC)" },
    { id: "maison", nom: "Maison de Tintin", courant: "Courant alternatif (AC) 230 V" }
  ],
  pieces: [
    { id: "panneaux", zone: "champ", nom: "Panneaux photovoltaïques",
      definition: "Assemblage de cellules en silicium qui transforment la lumière du soleil en électricité : c'est l'effet photovoltaïque.",
      role: "Produire de l'électricité en courant continu. Leur puissance crête (Wc) est mesurée dans les conditions STC : 1 000 W/m² et 25 °C.",
      astuce: "Cliquez sur « Zoom sur un panneau » pour voir ce qu'il y a à l'intérieur." },
    { id: "cables-pv", zone: "champ", nom: "Câbles et connecteurs PV",
      definition: "Câbles solaires résistants aux UV et connecteurs étanches repérés + et −.",
      role: "Relier les panneaux entre eux (en série ou en parallèle) puis au coffret de protection.",
      astuce: "Un connecteur PV ne se débranche jamais en charge." },
    { id: "coffret-dc", zone: "champ", nom: "Coffret de protection DC",
      definition: "Boîtier qui regroupe les protections du côté panneaux : fusibles des branches, interrupteur-sectionneur et parafoudre.",
      role: "Protéger les câbles contre les surintensités, couper le circuit des panneaux pour intervenir, et limiter les surtensions dues à la foudre." },
    { id: "regulateur", zone: "local", nom: "Régulateur de charge MPPT",
      definition: "Appareil électronique placé entre les panneaux et la batterie. MPPT veut dire « suivi du point de puissance maximale ».",
      role: "Charger correctement la batterie sans la surcharger, en faisant travailler les panneaux à leur meilleure puissance." },
    { id: "batterie", zone: "local", nom: "Batterie (parc d'accumulateurs)",
      definition: "Ensemble d'éléments de stockage. Montés en série, leurs tensions s'additionnent : 24 éléments de 2 V donnent 48 V.",
      role: "Stocker l'énergie produite le jour pour la restituer la nuit et les jours sans soleil. Sa capacité s'exprime en ampères-heures (Ah).",
      astuce: "Une batterie reste une source d'énergie, même quand tout est arrêté." },
    { id: "protection-batt", zone: "local", nom: "Protection de la batterie",
      definition: "Fusible ou disjoncteur prévu pour le courant continu, placé au plus près de la batterie.",
      role: "Couper en cas de court-circuit : une batterie peut fournir un courant très élevé et faire chauffer les câbles." },
    { id: "onduleur", zone: "local", nom: "Onduleur autonome",
      definition: "Appareil qui transforme le courant continu de la batterie (48 V DC) en courant alternatif.",
      role: "Fournir du 230 V alternatif, 50 Hz, comme le réseau, pour faire fonctionner les appareils de la maison." },
    { id: "tableau", zone: "maison", nom: "Tableau électrique AC",
      definition: "Coffret qui contient les disjoncteurs et le dispositif différentiel de la maison.",
      role: "Répartir l'électricité vers les circuits, protéger les câbles (disjoncteurs) et protéger les personnes (différentiel)." },
    { id: "eclairage", zone: "maison", nom: "Éclairage LED",
      definition: "Récepteur de faible puissance : de 5 à 15 W par lampe dans le bilan de Tintin.",
      role: "Éclairer la maison. Plus une lampe reste allumée longtemps, plus elle consomme d'énergie : E = P × t." },
    { id: "froid", zone: "maison", nom: "Réfrigérateur et congélateur",
      definition: "Récepteurs qui fonctionnent par cycles : le compresseur démarre et s'arrête selon la température.",
      role: "Conserver les aliments. Ils fonctionnent jour et nuit : ce sont de gros postes du bilan énergétique." },
    { id: "terre", zone: "maison", nom: "Prise de terre",
      definition: "Électrode (piquet) enfoncée dans le sol et reliée aux parties métalliques de l'installation.",
      role: "Évacuer un courant de défaut vers la terre pour que le différentiel coupe : elle protège les personnes." }
  ],
  couches: [
    { id: "verre", nom: "Verre trempé", role: "Protège les cellules de la pluie, de la grêle et de la poussière tout en laissant passer la lumière." },
    { id: "eva1", nom: "Film d'encapsulation (EVA)", role: "Film transparent qui colle et protège les cellules contre l'humidité." },
    { id: "cellules", nom: "Cellules en silicium", role: "Transforment la lumière en électricité. Chaque cellule donne environ 0,5 à 0,6 V : on les relie en série par des rubans métalliques." },
    { id: "eva2", nom: "Film d'encapsulation arrière (EVA)", role: "Enrobe les cellules par l'arrière." },
    { id: "arriere", nom: "Face arrière isolante", role: "Feuille qui isole et protège l'arrière du panneau." },
    { id: "cadre", nom: "Cadre en aluminium", role: "Rend le panneau rigide et permet de le fixer sur son support. Il est relié à la terre." },
    { id: "boite", nom: "Boîte de jonction et diodes bypass", role: "Boîtier à l'arrière d'où sortent le + et le −. Ses diodes bypass font contourner le courant autour d'un groupe de cellules à l'ombre, ce qui limite les pertes et l'échauffement." },
    { id: "mc4", nom: "Câbles et connecteurs", role: "Sorties + et − étanches pour relier le panneau au suivant." }
  ],
  quizPieces: [
    { q: "Quel élément transforme la lumière en électricité ?", choix: ["L'onduleur", "Le panneau photovoltaïque", "La batterie", "Le tableau électrique"], bon: 1,
      expl: "Le panneau produit l'électricité grâce à l'effet photovoltaïque." },
    { q: "Quel élément stocke l'énergie pour la nuit ?", choix: ["La batterie", "Le régulateur", "Le coffret DC", "La prise de terre"], bon: 0,
      expl: "La batterie stocke l'énergie du jour pour la restituer la nuit." },
    { q: "Que fait l'onduleur ?", choix: ["Il stocke l'énergie", "Il protège les personnes", "Il transforme le continu en alternatif", "Il augmente la puissance des panneaux"], bon: 2,
      expl: "L'onduleur transforme le courant continu (DC) en alternatif 230 V (AC)." },
    { q: "Où trouve-t-on du courant continu ?", choix: ["Entre les panneaux et l'onduleur", "Dans les prises de la maison", "Dans les lampes du salon", "Nulle part"], bon: 0,
      expl: "Panneaux, régulateur et batterie sont en continu. Après l'onduleur, c'est de l'alternatif." },
    { q: "Quel appareil protège les personnes contre les défauts d'isolement ?", choix: ["Le régulateur MPPT", "Le dispositif différentiel", "La batterie", "Le verre du panneau"], bon: 1,
      expl: "Le différentiel, associé à la prise de terre, coupe en cas de fuite de courant." },
    { q: "À quoi servent les diodes bypass ?", choix: ["À recharger la batterie", "À contourner les cellules à l'ombre", "À allumer les lampes", "À mesurer la tension"], bon: 1,
      expl: "Elles font passer le courant autour d'un groupe de cellules à l'ombre." }
  ],
  ordreChaine: {
    consigne: "Glissez les étiquettes (ou utilisez les flèches) pour remettre la chaîne d'énergie dans l'ordre, du soleil jusqu'aux appareils de Tintin.",
    elements: [
      { nom: "Panneaux photovoltaïques", courant: "DC" },
      { nom: "Régulateur de charge", courant: "DC" },
      { nom: "Batterie", courant: "DC" },
      { nom: "Onduleur", courant: "DC → AC" },
      { nom: "Appareils de la maison", courant: "AC" }
    ],
    bravo: "Bravo ! Jusqu'à l'onduleur, le courant est continu (DC). Après l'onduleur, il est alternatif (AC), comme dans les prises."
  },

  /* ---------- Jeux ---------- */
  memory: [
    { nom: "Grandeurs et unités", paires: [
      ["Puissance", "W (watt)", "La puissance se mesure en watts (W). Exemple : une lampe de 10 W."],
      ["Énergie", "Wh (wattheure)", "L'énergie se mesure en wattheures (Wh) : puissance × temps. Une lampe de 10 W allumée 3 h consomme 30 Wh."],
      ["Puissance crête", "Wc (watt-crête)", "Le watt-crête (Wc) est la puissance d'un panneau en plein soleil (1 000 W/m², 25 °C). Le panneau de Tintin fait 300 Wc."],
      ["Tension", "V (volt)", "La tension se mesure en volts (V). Le panneau de Tintin donne environ 30 V."],
      ["Intensité", "A (ampère)", "L'intensité du courant se mesure en ampères (A). Le panneau de Tintin donne environ 10 A."],
      ["Capacité d'une batterie", "Ah (ampère-heure)", "La capacité d'une batterie se mesure en ampères-heures (Ah) : 100 Ah, c'est 1 A pendant 100 h (ou 10 A pendant 10 h)."]] },
    { nom: "La fiche du panneau", paires: [["Voc", "Tension à vide"], ["Isc", "Courant de court-circuit"], ["Pmax", "Puissance maximale"], ["Vmp", "Tension au point de puissance max."], ["Imp", "Courant au point de puissance max."], ["STC", "1 000 W/m² et 25 °C"]] },
    { nom: "Pièces et rôles", paires: [["Panneau", "Produit du courant continu"], ["Onduleur", "Continu → alternatif"], ["Batterie", "Stocke pour la nuit"], ["Régulateur MPPT", "Charge la batterie"], ["Disjoncteur", "Coupe les surintensités"], ["Prise de terre", "Évacue les défauts"]] }
  ],
  /* Petit logo sur les cartes du memory (clé = texte de la carte). Un seul côté de chaque paire
     a un logo, sinon on retrouverait les paires sans réfléchir. */
  iconesMemory: {
    "Puissance": "💡", "Énergie": "⏱️", "Puissance crête": "☀️", "Tension": "⚡", "Intensité": "➡️", "Capacité d'une batterie": "🔋",
    "Tension à vide": "⚡", "Courant de court-circuit": "➡️", "Puissance maximale": "💡", "Tension au point de puissance max.": "⚡", "Courant au point de puissance max.": "➡️", "1 000 W/m² et 25 °C": "🌡️",
    "Panneau": "☀️", "Onduleur": "🔄", "Batterie": "🔋", "Régulateur MPPT": "🎛️", "Disjoncteur": "🛑", "Prise de terre": "🌍"
  },
  justePrix: [
    { nom: "La maison de Tintin", appareils: [
      { ico: "🧊", nom: "Congélateur", p: 110, n: 1, h: 24 },
      { ico: "💡", nom: "Lampes LED extérieures", p: 15, n: 30, h: 4 },
      { ico: "🚿", nom: "Eau chaude", p: 210, n: 1, h: 12 },
      { ico: "🚨", nom: "Alarme", p: 40, n: 1, h: 12 },
      { ico: "🍳", nom: "Plaque de cuisson", p: 200, n: 1, h: 3 },
      { ico: "🫖", nom: "Bouilloire", p: 2000, n: 1, h: 0.25 },
      { ico: "🧺", nom: "Lave-linge", p: 1000, n: 1, h: 1 },
      { ico: "📻", nom: "Poste de radio", p: 20, n: 1, h: 5 } ] },
    { nom: "Une maison au Bénin", appareils: [
      { ico: "🌀", nom: "Ventilateur", p: 50, n: 1, h: 8 },
      { ico: "📺", nom: "Téléviseur", p: 80, n: 1, h: 4 },
      { ico: "📱", nom: "Chargeur de téléphone", p: 10, n: 3, h: 2 },
      { ico: "💡", nom: "Ampoules LED", p: 9, n: 4, h: 5 },
      { ico: "💻", nom: "Ordinateur portable", p: 60, n: 1, h: 3 },
      { ico: "🧊", nom: "Réfrigérateur (le moteur tourne 8 h)", p: 150, n: 1, h: 8 },
      { ico: "📶", nom: "Box internet", p: 10, n: 1, h: 24 },
      { ico: "🔦", nom: "Lampes de bureau pour les devoirs", p: 12, n: 2, h: 5 } ] },
    { nom: "L'atelier", appareils: [
      { ico: "🔌", nom: "Perceuse", p: 600, n: 1, h: 0.5 },
      { ico: "🖨️", nom: "Imprimante", p: 30, n: 1, h: 2 },
      { ico: "❄️", nom: "Climatiseur", p: 800, n: 1, h: 2 },
      { ico: "💡", nom: "Tubes LED", p: 5, n: 20, h: 12 },
      { ico: "⚙️", nom: "Pompe auxiliaire", p: 750, n: 1, h: 2 },
      { ico: "🔥", nom: "Fer à souder", p: 60, n: 1, h: 2 },
      { ico: "🖥️", nom: "Ordinateur de bureau", p: 150, n: 1, h: 6 },
      { ico: "🧪", nom: "Étuve de séchage", p: 500, n: 1, h: 4 } ] }
  ],
  vraiFaux: [
    { nom: "Les bases", items: [
      ["Un panneau photovoltaïque produit du courant continu.", true, "Les panneaux produisent du DC ; l'onduleur le transforme en AC."],
      ["L'onduleur stocke l'énergie pour la nuit.", false, "C'est la batterie qui stocke ; l'onduleur convertit."],
      ["En série, les tensions s'additionnent.", true, "Deux panneaux de 30,5 V en série donnent 61 V."],
      ["En parallèle, les tensions s'additionnent.", false, "En parallèle, ce sont les intensités qui s'additionnent."],
      ["Le wattheure (Wh) est une unité d'énergie.", true, "Énergie = puissance × temps, en Wh."],
      ["Un panneau de 300 Wc produit toujours 300 W.", false, "La production dépend de l'éclairement, de la température et des ombres."],
      ["Une lampe de 10 W allumée 3 h utilise 30 Wh.", true, "10 W × 3 h = 30 Wh."],
      ["Le kWc et le kWh mesurent la même chose.", false, "Le kWc est une puissance crête, le kWh une énergie."],
      ["P = U × I.", true, "La puissance est le produit de la tension et de l'intensité."],
      ["Une batterie produit de l'électricité.", false, "Elle stocke une énergie reçue auparavant."] ] },
    { nom: "Orientation et soleil", items: [
      ["En France, plein sud est en général la meilleure orientation.", true, "Dans l'hémisphère nord, le soleil passe au sud."],
      ["Une ombre sur un panneau ne change rien à sa production.", false, "Une ombre peut faire chuter fortement la production."],
      ["L'inclinaison se mesure par rapport à l'horizontale.", true, "0° = à plat, 90° = vertical."],
      ["Près de l'équateur, l'inclinaison optimale est faible.", true, "Le soleil y passe presque à la verticale."],
      ["Pour savoir quelle orientation est la meilleure, on peut comparer un panneau de 300 Wc plein sud avec un panneau de 400 Wc plein est.", false, "Il faut garder le même panneau. Si la puissance change aussi, on ne sait plus si la différence vient de l'orientation ou du panneau."],
      ["Si les panneaux produisent beaucoup dans l'année, Tintin a forcément de l'électricité toutes les nuits.", false, "La nuit, les panneaux ne produisent rien. Pour avoir de l'électricité la nuit, il faut une batterie assez grande pour garder l'énergie produite pendant la journée."],
      ["L'autoconsommation est la part de la production utilisée sur place.", true, "Elle se calcule : solaire utilisé ÷ production × 100."],
      ["Un panneau orienté au nord produit plus qu'au sud, en France.", false, "C'est l'inverse dans l'hémisphère nord."] ] },
    { nom: "Sécurité et pannes", items: [
      ["Quand l'onduleur est arrêté, tout est hors tension.", false, "Un panneau éclairé produit encore, et la batterie reste une source."],
      ["On peut ouvrir un connecteur PV en charge.", false, "Jamais : risque d'arc électrique."],
      ["Une batterie usagée se jette avec les ordures ménagères.", false, "Elle suit une filière de recyclage autorisée."],
      ["On mesure une résistance sur un circuit hors tension.", true, "Ne jamais mesurer une résistance sur un circuit alimenté."],
      ["Une tension négative peut venir de cordons de voltmètre inversés.", true, "Vérifier les cordons avant d'accuser la polarité."],
      ["Un appareil prévu seulement pour l'alternatif convient forcément en continu.", false, "Le courant continu est plus difficile à couper."],
      ["Laver les panneaux au jet puissant est conseillé.", false, "On suit la méthode de nettoyage de la notice."],
      ["Avant de remplacer une pièce, on confirme la cause de la panne.", true, "On ne remplace pas au hasard."] ] }
  ],
  motsCroises: [
    { nom: "Le photovoltaïque", mots: [
      ["ONDULEUR", "Il transforme le courant continu en alternatif."],
      ["BATTERIE", "Elle stocke l'énergie pour la nuit."],
      ["PANNEAU", "Il produit l'électricité grâce au soleil."],
      ["TENSION", "Elle se mesure en volts."],
      ["SERIE", "Panneaux branchés les uns à la suite des autres ; leurs tensions s'additionnent."],
      ["SOLEIL", "Source de la lumière captée par les panneaux."],
      ["WATT", "Unité de puissance."],
      ["SUD", "Meilleure orientation en France."] ] },
    { nom: "Mesures et sécurité", mots: [
      ["VOLTMETRE", "Appareil qui mesure une tension."],
      ["INTENSITE", "Elle se mesure en ampères."],
      ["ENERGIE", "Elle se mesure en wattheures (Wh)."],
      ["TERRE", "On y relie les parties en métal des appareils pour protéger les personnes."],
      ["FUSIBLE", "Il fond pour couper une surintensité."],
      ["OMBRE", "Elle fait chuter la production."],
      ["CELLULE", "Petite plaque de silicium du panneau."],
      ["DIODE", "Petit composant qui laisse passer le courant dans un seul sens. Dans le panneau, elle aide le courant à éviter les cellules à l'ombre."] ] }
  ]
};

/* ---------- Retouches d'affichage demandées par l'équipe (11/10) ----------
   Le contenu des enseignants reste dans contenu.js ; ces retouches ne changent que ce que le site affiche. */
window.VIVANT.retouches = {
  // Questions retirées du site
  // Colonnes ajoutées aux tableaux à compléter (question juste avant le tableau)
  colonnesAjoutees: { "q-3-2-23": { apres: "ΔU", titre: "R max Ω" } }, // 3.2 Q23 : demandé par Arthur le 19/10
  // Lignes de tableau retirées (texte de la première cellule)
  lignesRetirees: ["Pertes et pose"], // 2.3 Q35 : PV.TecSol n'affiche ni pertes ni pose, retirée par Arthur le 19/10
  // Lignes à trous remplacées par un tableau à remplir (début du paragraphe)
  paragraphesRetires: ["Profil exploré ___"], // zone à compléter de la question 2.2 Q30, retirée avec elle
  questionsRetirees: ["q-1-1-V1A-1", "q-2-1-11", "q-2-2-30"], // V1A.1 : vocabulaire anglais ; 2.1 Q11 (coordonnées) et 2.2 Q30 (profil AutoCalSol) : retirées par Arthur le 19/10
  // Images des supports remises dans le bon sens, avec une légende
  images: {
    "34adb4dd19.jpeg": { src: "34adb4dd19-droit.jpg", alt: "Armoire technique d'une installation photovoltaïque",
      legende: "L'armoire technique de l'installation. Au centre : l'onduleur. En haut à gauche : le coffret de protection AC (disjoncteur et différentiel). En haut à droite : le coffret de protection DC, côté panneaux. Les câbles noirs viennent des panneaux ; sous l'onduleur, le schéma de câblage." }
  },
  // V3B (supervision Modbus, séance 3.3) : retiré à la demande de l'équipe, à voir avec les profs (voir « À retravailler »)
  sectionsRetirees: ["s3-3-2"],
  // Retirées des pages élèves ET des TP en mode prof ; regroupées dans la page « Ressources et repères » de l'Espace prof
  sectionsProf: ["s5-1-10", "sT1-7", "sT2-8", "sT3-8", "sT4-10"],
  // Phrases des supports qui renvoyaient au V3B retiré
  remplacements: [
    ["Pour comparer sud et est, les Dupondt doublent aussi la puissance.", "Pour comparer sud et est, les Dupondt changent aussi la valeur de la puissance."],
    ["Faire V3B sur le simulateur préparé par l’enseignant.", "V3B (supervision Modbus) : retiré pour l'instant, à voir avec les enseignants."],
    ["Q34 et Q35 ; V3B", "Q34 et Q35"],
    ["Chaîne d’informations : capteur, supervision et Modbus TCP sur simulateur.", "Chaîne d’informations : capteur et supervision."]
  ],
  // Lignes du support lues à tort comme des questions : affichées comme du texte
  questionsEnTexte: ["q-3-2-1"], // séance 3.2 : « 1. ΔU = 0,02 × U » est l'étape 1 de la méthode, pas une question
  // Énoncés réécrits, avec un bouton « Indice » facultatif
  enonces: {
    "q-3-2-V3A-1": { texte: "Pour une liaison, relevez Ib, In et Iz dans le dossier. Vérifiez Ib ≤ In ≤ Iz. Sur la notice de la protection, relevez aussi sa tension assignée en DC et son pouvoir de coupure, et comparez-les à la tension du circuit et au courant de court-circuit." }, // validé par Arthur le 19/10
    "q-3-2-20": { texte: "Calculez le courant d'un panneau avec la formule I = P ÷ U. Pour la suite, on utilisera 9,82 A.", aide: "I = 300 ÷ 30,5" }, // demandé par Arthur le 19/10
    "q-3-2-21": { texte: "Calculez le courant batterie avec la formule I = P ÷ (U × η).", aide: "I = 3 000 ÷ (48 × 0,90)" },
    "q-3-1-17": { texte: "Dans PVGIS, ouvrez le calcul « Hors réseau » et saisissez les valeurs du tableau ci-dessous. Lancez le calcul, puis notez sur votre feuille si vous avez gardé le profil par défaut." }, // reformulée à la demande d'Arthur le 19/10
    "q-2-3-37": { texte: "Cochez les explications possibles de l'écart entre les deux logiciels. Recopiez les numéros cochés sur votre feuille.",
      cases: ["Données météo différentes (station, années)", "Quantité de panneaux", "Arrondis de lecture", "Pertes par défaut différentes (câbles, onduleur…)", "Lieu différent"] }, // cases à cocher demandées par Arthur le 19/10
    "q-2-3-39": { texte: "Quelle est la différence géographique entre l'Île d'Or et un site du Bénin ?" },
    "q-2-1-18": { texte: "Comparez vos deux essais : quels résultats ont diminué ? Le nombre de panneaux a-t-il changé ? Expliquez pourquoi." },
    "q-1-1-V1A-3": {
      texte: "Calculez le rendement du panneau au point nominal : η = Pmax ÷ (E × S) × 100, avec Pmax la puissance crête en Wc, E l'éclairement en W/m² et S la surface du panneau en m².",
      indice: "η = 300 ÷ (1 000 × 1,485) × 100"
    },
    "q-1-2-12": {
      texte: "Avec le panneau virtuel ci-dessous, relevez la tension U et l'intensité I pour deux éclairements différents. Recopiez le tableau sur votre feuille et complétez-le."
    }
  },
  // Phrase « Travail à suivre : pages … » : les numéros de page ne veulent rien dire sur le site
  travailASuivre: "Sur votre feuille, numérotez chaque réponse comme la question du site (1, 2, V1A.2…).",
  // Titres de parties simplifiés (le titre d'origine reste la clé)
  titres: [
    [/^Ma mission et mon déroulement$/, "Ma mission"],
    [/^Objectifs de l'activité$/, "Objectifs"],
    [/^Complément V\w+ /, ""],
    [/^Questionnaire de révision$/, "Révision"],
    [/^Bilan des compétences$/, "Bilan"],
    [/^Ressource : Consignes pour les manipulations$/, "Consignes de sécurité"],
    [/^Ressource : Fiche technique de référence$/, "Fiche technique"],
    [/^(CalcPV|AutoCalSol) (.)/, function (m, outil, c) { return outil + " : " + c.toLowerCase(); }],
    [/^Défi avec /, "Défi : "],
    [/^Défi Comparer/, "Défi : comparer"]
  ]
};

/* ---------- Lexique : les abréviations des TP expliquées simplement ---------- */
window.VIVANT.lexique = [
  { titre: "Les unités", ico: "📏", mots: [
    ["W", "watt", "Unité de puissance : ce qu'un appareil demande à un instant donné.", "Une lampe LED de 10 W."],
    ["Wh / kWh", "wattheure / kilowattheure", "Unité d'énergie : la puissance multipliée par le temps. 1 kWh = 1 000 Wh.", "10 W pendant 3 h = 30 Wh."],
    ["Wc / kWc", "watt-crête / kilowatt-crête", "Puissance d'un panneau en plein soleil, dans les conditions STC. C'est la « taille » du panneau.", "Le panneau de Tintin fait 300 Wc."],
    ["V", "volt", "Unité de tension électrique.", "Le panneau donne environ 30 V ; la batterie fait 48 V."],
    ["A", "ampère", "Unité d'intensité : le courant qui circule dans les câbles.", "Le panneau donne environ 10 A."],
    ["Ah", "ampère-heure", "Capacité d'une batterie : combien de courant elle peut fournir, et pendant combien de temps.", "100 Ah = 1 A pendant 100 h, ou 10 A pendant 10 h."],
    ["W/m²", "watt par mètre carré", "Éclairement : la puissance du soleil qui arrive sur 1 m².", "Plein soleil : 1 000 W/m². Ciel nuageux : 200 W/m²."],
    ["kWh/m²", "kilowattheure par mètre carré", "Énergie solaire reçue sur 1 m² pendant une journée ou une année.", "Utilisé par les logiciels comme CalcPV."],
    ["Wh/j", "wattheure par jour", "Énergie consommée (ou produite) en une journée.", "Les besoins de Tintin : 12 100 Wh/j."] ] },
  { titre: "La fiche du panneau", ico: "☀️", mots: [
    ["PV", "photovoltaïque", "Qui transforme la lumière en électricité.", "Un panneau PV, une installation PV."],
    ["Pmax", "puissance maximale", "La plus grande puissance que le panneau peut donner. Pmax = Vmp × Imp.", "300 W."],
    ["Vmp", "tension au point de puissance maximale (m = max, p = power, « puissance » en anglais)", "La tension du panneau quand il donne sa puissance maximale. C'est sa tension « de travail ».", "30,5 V."],
    ["Imp", "intensité au point de puissance maximale (attention : c'est un I majuscule, pas un L)", "Le courant du panneau quand il donne sa puissance maximale. C'est son courant « de travail ».", "9,82 A. Vérification : 30,5 V × 9,82 A ≈ 300 W."],
    ["Voc", "tension de circuit ouvert (o = open, c = circuit), aussi notée Vco", "La tension quand rien n'est branché sur le panneau : aucun courant ne circule. C'est la tension la plus haute du panneau.", "35,5 V. Elle sert à vérifier qu'on ne dépasse pas la tension maximale du régulateur."],
    ["Isc", "courant de court-circuit (s = short, c = circuit), aussi noté Icc", "Le courant quand on relie directement le + et le − : la tension tombe à 0. C'est le courant le plus haut du panneau.", "11,1 A. Il sert à choisir les fusibles et les câbles."],
    ["STC", "conditions standard de test", "Les conditions où l'on mesure tous les panneaux pour pouvoir les comparer : 1 000 W/m² de soleil et 25 °C.", "Les valeurs de la fiche (Pmax, Vmp, Imp…) sont données en STC."],
    ["η", "rendement (lettre grecque « êta »)", "La part de l'énergie du soleil que le panneau transforme en électricité.", "Environ 20 % pour le panneau de Tintin."] ] },
  { titre: "L'installation", ico: "🔌", mots: [
    ["DC", "courant continu (direct current)", "Courant qui circule toujours dans le même sens.", "Panneaux, régulateur et batterie sont en DC."],
    ["AC", "courant alternatif (alternating current)", "Courant qui change de sens 50 fois par seconde, comme dans les prises.", "Après l'onduleur : 230 V AC."],
    ["MPPT", "suivi du point de puissance maximale", "Régulateur qui cherche sans arrêt le réglage où le panneau donne le plus de puissance, puis charge la batterie.", "Régulateur MPPT de l'installation de Tintin."],
    ["LED", "diode électroluminescente", "Lampe qui consomme très peu d'énergie.", "Lampes de 5 à 15 W."],
    ["DEF1 à DEF6", "défaut n° 1 à 6", "Les pannes à trouver dans le TP 4, laissées par les Dupondt.", "DEF3 : un défaut côté maison."] ] },
  { titre: "Les calculs du dimensionnement (TP 3)", ico: "🧮", tp: "3", mots: [
    ["Ec", "énergie consommée", "L'énergie dont la maison a besoin chaque jour.", "Ec = 12 100 Wh/j."],
    ["k", "coefficient de pertes de la chaîne PV", "Une partie de l'énergie se perd en route (câbles, régulateur, batterie, onduleur). k = 0,75 veut dire qu'il reste 75 %.", "k = 0,75."],
    ["Ep", "énergie à produire", "Ce que les panneaux doivent produire pour couvrir les besoins malgré les pertes. Ep = Ec ÷ k.", "12 100 ÷ 0,75 ≈ 16 133 Wh/j."],
    ["H", "heures de soleil équivalent", "Nombre d'heures par jour d'un soleil « parfait » à 1 000 W/m² qui donnerait la même énergie que la vraie journée.", "H = 5 h/j."],
    ["Pc", "puissance crête nécessaire", "La puissance totale de panneaux à installer. Pc = Ep ÷ H.", "16 133 ÷ 5 ≈ 3 227 Wc."],
    ["N", "nombre de panneaux", "Pc divisée par la puissance d'un panneau, arrondie au-dessus.", "3 227 ÷ 300 ≈ 10,8 donc 11 panneaux."],
    ["C", "capacité de la batterie", "C = Ec × J ÷ (U × D × η), en Ah.", "Voir la séance 3.1."],
    ["J", "jours d'autonomie", "Nombre de jours sans soleil que la batterie doit tenir.", "J = 5 jours."],
    ["U", "tension de la batterie", "La tension du parc de batteries.", "U = 48 V."],
    ["D", "profondeur de décharge", "La part de la batterie qu'on a le droit de vider sans l'abîmer.", "D = 0,80, soit 80 %."] ] },
  { titre: "Logiciels, normes et documents", ico: "📚", mots: [
    ["CalcPV, AutoCalSol, PV.TecSol, PVGIS", "logiciels de calcul solaire", "Sites et logiciels qui calculent la production d'un panneau selon le lieu, l'orientation et l'inclinaison.", "Utilisés dans le TP 2."],
    ["NF C 15-100", "norme française des installations électriques", "Les règles à respecter pour une installation électrique dans un logement.", ""],
    ["UTE C 15-712-2", "guide pour le photovoltaïque autonome", "Les règles propres aux installations PV avec batterie, non reliées au réseau.", ""],
    ["NF C 18-510", "norme de sécurité électrique", "Les règles pour travailler en sécurité sur une installation électrique (habilitation).", ""],
    ["Modbus TCP", "langage de communication", "Façon dont un automate et un ordinateur échangent des mesures sur un réseau.", "Séance 3.3 : supervision sur simulateur."],
    ["IP", "adresse IP", "Le « numéro » d'un appareil sur un réseau informatique.", "192.168.10.20."],
    ["HT / TTC", "hors taxes / toutes taxes comprises", "Prix sans la taxe, puis prix avec la taxe. TTC = HT + taxe.", "Devis de la séance 3.2."],
    ["CSV", "fichier de tableau", "Fichier de données qu'on peut ouvrir dans un tableur.", ""],
    ["QSSE", "qualité, santé, sécurité, environnement", "Thème du référentiel sur les bons réflexes de sécurité et d'environnement.", ""],
    ["MELEC", "bac pro Métiers de l'électricité et de ses environnements connectés", "Le diplôme dont viennent les compétences évaluées dans les bilans.", ""] ] },
  { titre: "La mise à la terre", ico: "⏚", tp: "terre", mots: [
    ["TT", "régime TT", "Le neutre de la source est relié à la terre (T) ; les masses de l'installation sont reliées à leur propre prise de terre (T)."],
    ["TN", "régime TN", "Le neutre de la source est relié à la terre (T) ; les masses sont reliées à ce neutre (N) par le conducteur de protection."],
    ["TN-S", "TN séparé", "Le neutre N et le conducteur de protection PE sont deux fils séparés."],
    ["TN-C", "TN combiné", "Le neutre et la protection sont réunis dans un seul fil, le PEN."],
    ["TN-C-S", "TN combiné puis séparé", "Une partie en PEN, puis séparation en N et PE."],
    ["IT", "régime IT", "Le neutre de la source est isolé de la terre ou relié par une grande impédance (I) ; les masses sont reliées à la terre (T)."],
    ["L", "phase", "Conducteur de ligne : il amène le courant."],
    ["N", "neutre", "Conducteur qui ramène le courant à la source."],
    ["PE", "conducteur de protection", "Fil vert-jaune qui relie les masses métalliques à la terre ou au neutre."],
    ["PEN", "neutre et protection réunis", "Un seul conducteur qui joue le rôle de N et de PE (TN-C)."],
    ["QF", "disjoncteur", "Repère du disjoncteur sur les schémas."],
    ["DDR", "dispositif différentiel résiduel", "Appareil qui compare le courant qui part et celui qui revient, et coupe s'il manque du courant (fuite vers la terre)."],
    ["SLT", "schéma de liaison à la terre", "Le régime de neutre de l'installation : TT, TN ou IT."],
    ["CPI", "contrôleur permanent d'isolement", "En IT, il surveille l'isolement et donne l'alarme dès le premier défaut."],
    ["U₀", "tension simple", "Tension entre une phase et le neutre (230 V)."],
    ["U", "tension", "Tension électrique, en volts. Au second défaut en IT, U est la tension entre deux phases (400 V)."],
    ["U_c", "tension de contact", "Tension entre la masse en défaut et la terre : celle que subirait une personne qui touche la machine."],
    ["U_c1", "tension de contact au premier défaut", "En IT, la tension de contact lors d'un premier défaut."],
    ["U_L", "tension limite de sécurité", "Tension de contact à ne pas dépasser : 50 V ici."],
    ["I_d", "courant de défaut", "Courant qui passe par le défaut et revient à la source."],
    ["I_d1", "courant au premier défaut", "En IT, le courant de défaut lors d'un premier défaut."],
    ["I_d2", "courant au second défaut", "En IT, le courant lorsqu'un second défaut apparaît sur une autre phase."],
    ["IΔn", "sensibilité du différentiel", "Courant de fuite à partir duquel le dispositif différentiel résiduel coupe (par exemple 30 mA)."],
    ["I_n", "calibre", "Courant nominal du disjoncteur, écrit sur l'appareil (par exemple 16 A pour un C16)."],
    ["I_a", "courant de coupure assurée", "Courant qui fait couper le dispositif dans le temps exigé."],
    ["R_A", "résistance de la terre des masses", "Résistance de la prise de terre de l'installation, à laquelle sont reliées les masses."],
    ["R_B", "résistance de la terre de la source", "Résistance de la prise de terre du neutre de la source."],
    ["Z", "impédance de mise à la terre", "En IT, l'impédance (très grande) entre le réseau et la terre."],
    ["Z_s", "impédance de boucle", "Impédance de tout le chemin du défaut : source, phase, défaut, PE."],
    ["Z_s,max", "impédance de boucle maximale", "Plus grande valeur de Z_s qui garantit encore la coupure dans le temps exigé."],
    ["Z_boucle", "impédance de la boucle complète", "En IT, l'impédance du chemin parcouru au second défaut."]
  ] },
];

/* ---------- À retravailler : ce qu'on ne sait pas encore, ou à revoir avec les profs ----------
   statut : "profs" (question à poser aux enseignants), "equipe" (à faire par l'équipe) */
/* Répliques ajoutées par l'équipe au début d'une partie (avant le texte des profs) */
window.VIVANT.dialoguesAvant = {
  "s5-1-0": [
    ["Tintin", "Professeur, l'eau de la douche est glacée tous les matins ! Et sur le toit de la tour, il ne reste qu'un petit coin de libre à côté des panneaux."],
    ["Tournesol", "Un bateau ? Ah, un coin de toit ! Justement, utilisons-le au mieux : et si chaque panneau posé là faisait deux choses à la fois ?"]
  ]
};

/* Tableaux à recopier et compléter sur la feuille, affichés sous une question (clé : id de la question) */
window.VIVANT.tableauxARemplir = {
  "q-T3-8": [["Rubrique", "Votre message de maintenance"], ["Alarme", "Départ suspect", "Risque si le défaut persiste", "Action demandée"]]
};

/* Vidéos en ligne, affichées juste avant une image des supports (clé : nom de l'image) */
window.VIVANT.videosAvant = {
  "7b46e66f52.png": { url: "https://www.youtube.com/watch?v=VAA3Rtx0nH0", titre: "Les différentes sortes de panneaux solaires en vidéo",
    texte: "Avant de lire le schéma, regardez cette vidéo : elle présente les différentes sortes de panneaux solaires, dont le panneau hybride, qui produit à la fois de l'électricité et de la chaleur." }
};

// Points ouverts, rangés par destinataire (pour : "benin" = profs du Bénin, "paris" = Monsieur Paris, "idee" = idées d'Arthur à présenter, "equipe" = à faire par l'équipe)
window.VIVANT.aRetravailler = [
  { pour: "benin", tp: "TP 2", titre: "CalcPV ne répond plus", texte: "Le formulaire de calcul de CalcPvAutonome (calcpv.net/Autonome.php) ne s'ouvre plus chez nous. Nous avons donc mis dans la séance 2.1 un simulateur qui imite CalcPV et marche sans Internet (questions 11 à 18). Le préfèrent-ils au vrai site, ou veulent-ils garder les deux ?", options: ["Le simulateur du site (marche sans Internet)", "Le vrai site CalcPV, s'il marche chez eux", "PVGIS hors réseau : https://re.jrc.ec.europa.eu/pvg_tools/fr/"] },
  { pour: "benin", tp: "TP 3", titre: "Données de V3A.1 (Ib, In, Iz)", texte: "V3A.1 se fait sur papier. Ib vient des courants calculés aux questions 20 et 21 (9,82 A, 58,92 A, 100 A, 69,44 A), mais In et Iz doivent être lus dans un dossier de notices et d'extraits de normes (NF C 15-100, UTE C 15-712-2) qui n'est pas sur le site. Quels documents utilisez-vous, et quelles normes s'appliquent au Bénin ?", options: ["Ils fournissent leurs notices et les règles locales", "On prépare un petit dossier type avec des calibres et des Iz donnés", "On garde les valeurs d'exemple du corrigé (In = 80 A)"], lien: "#q-3-2-V3A-1" },
  { pour: "benin", tp: "TP 3", titre: "Chiffrage du devis (Q26 à Q30)", texte: "Le support ne donne aucun prix : il faut les tarifs du matériel, des câbles, de la main-d'œuvre, du déplacement, du transport et la taxe. Les prix français ne valent pas pour le Bénin.", options: ["Ils fournissent leur propre grille de prix, en FCFA et avec leur taxe", "On prépare une grille de prix fictifs commune, qu'ils adaptent ensuite"], lien: "#q-3-2-26" },
  { pour: "benin", tp: "TP 4", titre: "Les défauts et l'organisation des groupes", texte: "Le TP prévoit que l'enseignant choisisse deux défauts selon son matériel, avec une seule maquette. Proposition qui combine les deux : 5 groupes de 4 élèves et 5 postes. Chaque groupe passe environ 40 min à un poste, puis tourne, pour que tout le monde traite tous les cas. Cette organisation leur convient-elle ? Comment font-ils d'habitude ?", options: ["Poste 1 : maquette, DEF3 ou DEF6 (les deux défauts qui demandent la maquette)", "Poste 2 : DEF1 sur documents", "Poste 3 : DEF4 sur documents ou simulateur", "Poste 4 : DEF5 sur documents ou simulateur", "Poste 5 : Q1 à Q3 et questionnaire, sur papier", "DEF2 (l'ombre) : le support ne dit pas sur quoi il se fait. Il peut se faire sur documents (courbes de production avec et sans ombre), avec le panneau virtuel du TP 1, ou sur la maquette en cachant une partie du panneau avec un carton. Comment préfèrent-ils le faire ?"] },
  { pour: "benin", tp: "TP 5", titre: "LibreOffice Calc", texte: "La question V5A (effet de la température) se fait avec LibreOffice Calc. Les PC des élèves l'ont-ils ? Sinon, prévoir de l'installer avant le TP, ou faire le calcul à la calculatrice." },
  { pour: "benin", tp: "Général", titre: "Fiche d'aide LibreOffice Calc", texte: "Plusieurs questions (TP 5, activités TN et IT) se font avec LibreOffice Calc. Faut-il une feuille explicative (saisir une formule, recopier vers le bas, virgule ou point décimal) ? Les élèves connaissent-ils déjà le tableur ?" },
  { pour: "benin", tp: "Général", titre: "Fiche de suivi des compétences", texte: "Préfèrent-ils cette version (une fiche par élève, Non acquis / En cours / Acquis) ou celle donnée par le professeur ? Ils peuvent aussi faire leur propre version.", lien: "#fiche-competences" },
  { pour: "benin", tp: "Général", titre: "Espace prof en ligne", texte: "Sur le site en ligne, l'Espace prof est protégé par un mot de passe simple. Un élève débrouillard peut retrouver les corrigés dans le code du site. Est-ce acceptable, ou préfèrent-ils un site élève sans corrigés et les corrigés seulement en PDF ?" },
  { pour: "paris", tp: "TP 3", titre: "Montage avec une seule maquette (séance 3.3)", texte: "Ce TP prévoit 70 min de montage sur une maquette. Si toute la classe en est au même point en même temps, il faudrait plusieurs maquettes : faire manipuler tous les élèves sur la même maquette sera compliqué. C'est à nous de fournir le matériel de la maquette, sans doute une seule. Comment ont-ils l'habitude de faire ?" },
  { pour: "paris", tp: "TP 3 et TP 4", titre: "Photo de l'armoire technique", texte: "Photo des supports, au début des séances 3.1 et 4.1. Est-ce la maquette de leur lycée ? La photo a été remise dans le bon sens. Confirmer la légende : onduleur au centre, coffret AC en haut à gauche, coffret DC en haut à droite." },
  { pour: "idee", tp: "Général", titre: "Fiches d'aide papier", texte: "Des fiches d'aide imprimées, gardées par l'enseignant. Quand un élève bloque, l'enseignant lui en donne une s'il pense qu'elle suffira pour avancer. L'élève reste autonome : il ne reçoit pas la réponse, seulement un coup de pouce (une formule, une méthode, un rappel). À leur demander : sont-ils intéressés, et pour quelles questions ?" },
  { pour: "idee", tp: "Général", titre: "Fiche plastifiée des abréviations", texte: "Le site affiche en haut de chaque séance un tableau des abréviations utiles. On peut en faire une version papier plastifiée, une par TP, posée à côté du cours sur la table des élèves. À leur demander : la veulent-ils ?" },
  { pour: "equipe", tp: "Général", titre: "Sites à tester (et comptes à créer si besoin)", texte: "Pour chaque site : faut-il un compte ? Marche-t-il avec une connexion lente ? Les menus correspondent-ils aux questions ?", options: ["CalcPV (TP 2) : https://conso.calcpv.net/fr?from=CalcPvAutonome", "AutoCalSol (TP 2) : https://autocalsol.ines-solaire.org/", "PV.TecSol (TP 2, défi avancé) : https://www.tecsol.fr/calculs puis le générateur photovoltaïque (https://pv.tecsol.fr/) ; le formulaire ne s'était pas chargé lors de la préparation du support, à tester en priorité", "PVGIS (TP 3, vérifier l'autonomie) : https://re.jrc.ec.europa.eu/pvg_tools/fr/", "LibreOffice Calc (TP 5, activités TN et IT) : à installer pour tester les questions tableur"] },
  { pour: "equipe", tp: "Mise à la terre", titre: "À vérifier : dossier de l'activité TN (question 7)", texte: "Énoncé reformulé par l'équipe le 18/10 pour être plus clair (solutions A, B, C ; un collègue veut appliquer B). Vérifier qu'il garde le sens du support d'origine et que la correction colle toujours.", lien: "#q-T2-7" },
  { pour: "equipe", tp: "TP 2", titre: "Question 20 (AutoCalSol)", texte: "Ce sont des étapes de menus du logiciel : à reformuler après l'avoir ouvert et testé.", lien: "#q-2-2-20" },
  { pour: "equipe", tp: "TP 1", titre: "Photos des pièces du plan interactif", texte: "Les 7 photos du plan de l'installation (panneaux, câbles PV, batterie, onduleur, régulateur, protection batterie, coffret DC) viennent du web. Elles sont retirées du site en ligne et restent sur la version de travail. La photo du coffret DC est provisoire (c'est un coffret AC). À remplacer par des photos libres ou prises par l'équipe." },
  { pour: "equipe", tp: "Général", titre: "Droits des dessins de Tintin", texte: "Demande en cours auprès de Moulinsart. Les dessins restent pour la démo ; si la réponse est non, on les retire du site en ligne." },
  { pour: "equipe", tp: "Général", titre: "Planches BD et bulles", texte: "Bulles de Tournesol dans les TP 2 à 4. La planche BD des Dupondt est abandonnée." }
];
