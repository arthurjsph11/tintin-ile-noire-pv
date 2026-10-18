/* Simulateur « Où passe le courant de défaut ? » : introduction du TP mise à la terre (TT, TN, IT, pas à pas) */
(function () {
  var GABARIT = '<div class="choix" role="group" aria-label="Régime de neutre">\n    <span>Régime :</span>\n    <button data-r="TT" aria-pressed="true">TT</button>\n    <button data-r="TN" aria-pressed="false">TN</button>\n    <button data-r="IT" aria-pressed="false">IT</button>\n  </div>\n\n  <div class="schema"><svg data-id="svg" viewBox="0 0 800 400" role="img" aria-label="Schéma : source, protection, machine de Marie et prises de terre"></svg></div>\n  <ul class="legende">\n    <li><i style="background:#6b4f2a"></i>Phase L (amène le courant)</li>\n    <li><i style="background:#1f5f99"></i>Neutre N (le ramène)</li>\n    <li><i style="background:repeating-linear-gradient(90deg,#2e7d32 0 8px,#f4c430 8px 14px)"></i>PE, fil de protection vert-jaune</li>\n    <li><i style="background:#c0392b"></i>Chemin du courant de défaut</li>\n  </ul>\n\n  <section class="etape" aria-live="polite">\n    <span class="num" data-id="num"></span>\n    <h3 data-id="titre"></h3>\n    <p data-id="texte"></p>\n    <div class="retenir" data-id="retenir" hidden></div>\n    <div class="sim-nav"><button data-id="prec">← Étape précédente</button><button class="suivant" data-id="suiv">Étape suivante →</button></div>\n  </section>\n  <p class="note">Les valeurs sont des exemples, différentes de celles des exercices : à vous de faire les vrais calculs dans l\'activité.</p>\n';
  function simulateur(root) {
    root.classList.add("sim-terre");
    root.innerHTML = GABARIT;
    var fixe = root.getAttribute("data-regime");
    if (fixe) root.querySelector(".choix").hidden = true;

  var NS="http://www.w3.org/2000/svg", svg=root.querySelector("[data-id=svg]");
  var R="TT", i=0, raf=null;
  function $(id){return root.querySelector("[data-id="+id+"]");}
  function el(t,a,txt,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;(p||svg).appendChild(e);return e;}
  function poly(pts,a){return el("polyline",Object.assign({points:pts.map(function(p){return p.join(",")}).join(" "),class:"fil"},a));}
  function resist(x,y1,y2,lab,sous){el("rect",{x:x-9,y:y1,width:18,height:y2-y1,fill:"#fff",stroke:"#1b1a17","stroke-width":2});el("text",{x:x+16,y:(y1+y2)/2+2,"font-size":14,"font-weight":700},lab);if(sous)el("text",{x:x+16,y:(y1+y2)/2+18,"font-size":11,fill:"#6b665c"},sous);}
  function terre(x,y){el("line",{x1:x,y1:y,x2:x,y2:y+8,stroke:"#1b1a17","stroke-width":2});[22,14,6].forEach(function(w,k){el("line",{x1:x-w/2,y1:y+8+k*5,x2:x+w/2,y2:y+8+k*5,stroke:"#1b1a17","stroke-width":2});});}
  function pe(pts){poly(pts,{stroke:"#2e7d32","stroke-width":4});poly(pts,{stroke:"#f4c430","stroke-width":4,"stroke-dasharray":"6 10"});}

  var SEG={
    normal:[[130,80],[600,80],[628,100],[628,120],[130,120]],
    defaut:[[130,80],[600,80],[600,105],[580,165],[580,190],[630,190]],
    TT:[[630,190],[630,345],[150,345],[150,120],[130,120]],
    TN:[[630,190],[630,235],[150,235],[150,120],[130,120]],
    IT:[[630,190],[630,345],[150,345],[150,120],[130,120]],
    IT2:[[630,190],[630,265],[500,265],[440,250],[420,232],[420,95],[130,95]]
  };
  function join(){var out=[];for(var k=0;k<arguments.length;k++)out=out.concat(SEG[arguments[k]]);return out;}

  // Étapes : chemin animé, effets sur le schéma, textes
  var ETAPES={
    TT:[
      {t:"En temps normal : le disjoncteur différentiel surveille déjà",x:"Le courant part de la source par la phase L, fait tourner le moteur, puis revient par le neutre N. Le disjoncteur différentiel mesure en permanence <b>ce qui part par L</b> et <b>ce qui revient par N</b>. Ici, les deux sont égaux (5 A dans cet exemple) : l'écart est nul, le disjoncteur différentiel laisse passer.",d:"Je fais mon tour… et je sens qu'on me compte à l'aller et au retour.",ch:["normal"],c:"#2e7d32",ddr:["5 A","5 A","0 mA","Tout va bien : il laisse passer","#2e7d32"]},
      {t:"Le défaut : une partie du courant s'échappe",x:"Le fil de phase abîmé touche la carcasse en métal. Une partie du courant ne revient plus par le neutre : elle part dans la carcasse, descend par le fil vert-jaune PE jusqu'à la prise de terre de la machine (ici 30 Ω), traverse le sol, puis remonte par la prise de terre de la source (ici 10 Ω) pour rejoindre le neutre.",d:"Je prends un raccourci par la carcasse et le sol. Personne ne me verra !",ch:["defaut","TT"],c:"#c0392b",marie:true,ddr:["10,75 A","5 A","5,75 A","Il manque du courant au retour !","#c0392b"]},
      {t:"Le disjoncteur différentiel voit qu'il manque du courant",x:"Le courant de défaut traverse les deux prises de terre : <span class='chiffre'>230 V ÷ (30 Ω + 10 Ω) = 5,75 A</span>. Le disjoncteur différentiel compare : 10,75 A partent par L, mais seulement 5 A reviennent par N. Il manque 5,75 A, bien plus que son seuil de 30 mA (0,030 A) : il va couper. Le disjoncteur ordinaire de 16 A, lui, ne voit rien : 10,75 A, c'est moins que 16 A.",d:"Aïe… le disjoncteur différentiel a remarqué qu'il en manquait un morceau au retour.",ch:["defaut","TT"],c:"#c0392b",marie:true,ddr:["10,75 A","5 A","5,75 A","Écart > 30 mA : il va couper !","#c0392b"]},
      {t:"Pourquoi il doit couper : Marie est en danger",x:"Pendant ce temps, la carcasse monte à <span class='chiffre'>30 Ω × 5,75 A ≈ 173 V</span> par rapport au sol : c'est la <b>tension de contact</b>, celle que subirait Marie en touchant la machine. 173 V, c'est bien plus que la limite de sécurité de 50 V. <b>Sans disjoncteur différentiel, cette situation durerait</b>, puisque le disjoncteur ordinaire ne coupe pas.",d:"Sans le disjoncteur différentiel, je pourrais rester là longtemps…",ch:["defaut","TT"],c:"#c0392b",marie:true,ddr:["10,75 A","5 A","5,75 A","Écart > 30 mA : il va couper !","#c0392b"]},
      {t:"Le disjoncteur différentiel coupe en quelques millisecondes",x:"Le disjoncteur différentiel ouvre le circuit en quelques dizaines de millisecondes. Plus de courant, plus de tension sur la carcasse : Marie est protégée. Il faudra trouver et réparer le fil abîmé avant de réarmer.",d:"Raté ! Le disjoncteur différentiel m'a compté à l'aller et au retour, et il a tout coupé.",ch:[],coupe:"prot",ddr:["0 A","0 A","—","COUPÉ : Marie est protégée","#2e7d32"],r:"En TT, le courant de défaut passe par la terre. Il est trop faible pour le disjoncteur, mais le disjoncteur différentiel le repère, car il compare l'aller et le retour. C'est lui qui protège."}
    ],
    TN:[
      {t:"En temps normal",x:"Le courant part de la source par la phase L, fait tourner le moteur, puis revient par le neutre N. Tout ce qui part revient.",d:"Je fais mon tour, tranquille.",ch:["normal"],c:"#2e7d32"},
      {t:"Le défaut : un fil abîmé touche la carcasse",x:"Le fil de phase abîmé touche la carcasse en métal. Toute la carcasse est maintenant sous tension.",d:"Une sortie ! Je file dans la carcasse…",ch:["defaut"],c:"#c0392b",marie:true},
      {t:"Le retour du courant en TN : par le fil PE",x:"En TN, le fil vert-jaune PE est relié directement au neutre de la source. Le courant revient par un chemin tout en métal, sans passer par le sol.",d:"Que du métal, aucun obstacle : je fonce !",ch:["defaut","TN"],c:"#c0392b",fort:true,marie:true},
      {t:"Un vrai court-circuit",x:"Le chemin tout en métal ne résiste presque pas (ici 0,5 Ω pour toute la boucle) : <span class='chiffre'>230 V ÷ 0,5 Ω = 460 A</span>. C'est un vrai court-circuit, et la carcasse est dangereuse : il faut couper très vite.",d:"On est des centaines à passer en même temps !",ch:["defaut","TN"],c:"#c0392b",fort:true,marie:true},
      {t:"La protection : le disjoncteur coupe",x:"Un disjoncteur 16 A de courbe C coupe instantanément à partir de <span class='chiffre'>10 × 16 A = 160 A</span>. 460 A, c'est bien plus que 160 A : il coupe en une fraction de seconde.",d:"Trop gros, trop vite : le disjoncteur m'a arrêté net.",ch:[],coupe:"prot",r:"En TN, le défaut devient un court-circuit. C'est le disjoncteur qui coupe, très vite."}
    ],
    IT:[
      {t:"En temps normal",x:"Le courant part de la source par la phase L1, fait tourner le moteur, puis revient par le neutre N.",d:"Je fais mon tour, tranquille.",ch:["normal"],c:"#2e7d32"},
      {t:"Premier défaut : un fil abîmé touche la carcasse",x:"Le fil de phase abîmé touche la carcasse en métal de la machine de Marie.",d:"Une sortie ! Je file dans la carcasse…",ch:["defaut"],c:"#d9822b"},
      {t:"Le retour en IT : un mur sur le chemin",x:"En IT, le neutre de la source n'est pas relié directement à la terre : il passe par une très grande résistance (ici 2 000 Ω). Pour rentrer, le courant doit la traverser.",d:"Une très grande résistance ? C'est un mur ! Je passe au compte-gouttes…",ch:["defaut","IT"],c:"#d9822b",faible:true},
      {t:"Pas de danger, et rien ne coupe",x:"Le courant de défaut est tout petit : <span class='chiffre'>230 V ÷ (2 000 Ω + 20 Ω) ≈ 0,11 A</span>. La carcasse ne monte qu'à <span class='chiffre'>20 Ω × 0,11 A ≈ 2,3 V</span>, bien moins que 50 V : pas de danger pour Marie. Rien ne coupe : l'atelier continue de tourner.",d:"Je n'arrive à rien… mais personne ne m'a arrêté non plus.",ch:["defaut","IT"],c:"#d9822b",faible:true},
      {t:"Le CPI sonne l'alarme",x:"Le CPI (contrôleur permanent d'isolement) surveille l'installation. Il détecte le défaut et donne l'alarme : il faut trouver le défaut et le réparer.",d:"Zut, le CPI m'a repéré !",ch:["defaut","IT"],c:"#d9822b",faible:true,cpi:true},
      {t:"Si personne ne répare : un second défaut",x:"Un second défaut arrive, sur l'autre phase L2, dans la machine B. Le courant fait alors le tour par les deux carcasses et le PE, sans passer par Z : c'est un court-circuit entre phases.",d:"Un second défaut ! Plus de mur, je passe en force !",ch:["defaut","IT2"],c:"#c0392b",fort:true,cpi:true,marie:true},
      {t:"La protection : le disjoncteur coupe",x:"Entre deux phases, la tension est de 400 V et la boucle ne résiste presque pas (ici 0,8 Ω) : <span class='chiffre'>400 V ÷ 0,8 Ω = 500 A</span>. C'est bien plus que les 160 A qui font couper le disjoncteur : il coupe en une fraction de seconde.",d:"Arrêté quand même…",ch:[],coupe:"prot",r:"En IT, le premier défaut ne coupe pas : l'atelier continue de tourner. Mais il faut le réparer vite, car un second défaut, lui, provoque la coupure."}
    ]
  };

  function dessiner(et){
    svg.textContent="";
    el("line",{x1:110,y1:362,x2:790,y2:362,stroke:"#b5a98a","stroke-width":2,"stroke-dasharray":"6 5"});
    el("text",{x:330,y:384,"font-size":13,fill:"#6b665c"},"le sol (la terre)");
    // source
    el("rect",{x:30,y:50,width:100,height:110,rx:6,fill:"#f3ead3",stroke:"#1b1a17","stroke-width":2});
    el("text",{x:80,y:42,"text-anchor":"middle","font-size":13,"font-weight":700},"Source");
    el("text",{x:80,y:142,"text-anchor":"middle","font-size":10,fill:"#6b665c"},"transformateur");
    for(var k=0;k<3;k++)el("circle",{cx:66+k*14,cy:100,r:9,fill:"none",stroke:"#1b1a17","stroke-width":2});
    // conducteurs
    poly([[130,80],[560,80]],{stroke:"#6b4f2a"});el("text",{x:140,y:72,"font-size":13,"font-weight":700},R==="IT"?"L1":"L");
    poly([[130,120],[560,120]],{stroke:"#1f5f99"});el("text",{x:136,y:138,"font-size":13,"font-weight":700,fill:"#1f5f99"},"N");
    if(R==="IT"){poly([[130,80],[405,80],[405,230]],{stroke:"#6b4f2a"});poly([[130,95],[420,95],[420,230]],{stroke:"#333"});poly([[130,107],[435,107],[435,230]],{stroke:"#888"});el("text",{x:178,y:92,"font-size":11,"font-weight":700},"L2");el("text",{x:200,y:104,"font-size":11,"font-weight":700,fill:"#666"},"L3");}
    // neutre ↔ terre
    if(R==="IT"){poly([[150,120],[150,240]],{stroke:"#1b1a17","stroke-width":2});resist(150,240,290,"Z","2 000 Ω");poly([[150,290],[150,345]],{stroke:"#1b1a17","stroke-width":2});}
    else{poly([[150,120],[150,290]],{stroke:"#1b1a17","stroke-width":2});resist(150,290,335,"R_B",R==="TT"?"terre source · 10 Ω":"terre source");poly([[150,335],[150,345]],{stroke:"#1b1a17","stroke-width":2});}
    terre(150,345);
    // protection
    var coupe=et.coupe==="prot";
    el("rect",{x:230,y:62,width:116,height:R==="IT"?52:76,rx:5,fill:coupe?"#c0392b":"#fff",stroke:"#1b1a17","stroke-width":2});
    el("text",{x:288,y:R==="IT"?54:104,"text-anchor":"middle","font-size":12,"font-weight":700,fill:coupe&&R!=="IT"?"#fff":(coupe?"#c0392b":"#1b1a17")},coupe?"COUPÉ !":{TT:"Disj. diff. 30 mA",TN:"Disjoncteur",IT:"Disjoncteur"}[R]);
    if(R==="TT"&&et.ddr){var D=et.ddr;
      poly([[288,138],[288,152]],{stroke:"#999","stroke-width":1.5,"stroke-dasharray":"3 3"});
      el("rect",{x:200,y:152,width:250,height:104,rx:6,fill:"#fffbea",stroke:D[4],"stroke-width":2.5});
      el("text",{x:212,y:172,"font-size":12,"font-weight":800},"Ce que mesure le disj. diff.");
      el("text",{x:212,y:194,"font-size":12},"Part par L :");el("text",{x:438,y:194,"text-anchor":"end","font-size":13,"font-weight":800},D[0]);
      el("text",{x:212,y:213,"font-size":12,fill:"#1f5f99"},"Revient par N :");el("text",{x:438,y:213,"text-anchor":"end","font-size":13,"font-weight":800,fill:"#1f5f99"},D[1]);
      el("text",{x:212,y:232,"font-size":12},"Écart (seuil 30 mA) :");el("text",{x:438,y:232,"text-anchor":"end","font-size":13,"font-weight":800,fill:D[4]},D[2]);
      el("text",{x:212,y:250,"font-size":11.5,"font-weight":700,fill:D[4]},D[3]);}
    if(R==="IT"){var cp=el("rect",{x:190,y:170,width:80,height:36,rx:5,fill:et.cpi?"#f4c430":"#fff",stroke:"#1b1a17","stroke-width":2});if(et.cpi&&!coupe)cp.setAttribute("class","clign");
      el("text",{x:230,y:193,"text-anchor":"middle","font-size":12,"font-weight":700},et.cpi?"CPI : ALARME":"CPI");poly([[230,170],[230,140],[150,140]],{stroke:"#999","stroke-width":1.5,"stroke-dasharray":"3 3"});}
    // machine de Marie
    el("rect",{x:560,y:50,width:140,height:140,rx:8,fill:et.marie&&!coupe?"#f6d5d0":"#e9ebee",stroke:"#8a8f96","stroke-width":6});
    el("text",{x:630,y:42,"text-anchor":"middle","font-size":13,"font-weight":700},"Machine de Marie");
    el("text",{x:692,y:66,"text-anchor":"end","font-size":10,fill:"#6b665c"},"carcasse en métal");
    el("circle",{cx:650,cy:120,r:22,fill:"#fff",stroke:"#1b1a17","stroke-width":2});el("text",{x:650,y:126,"text-anchor":"middle","font-size":15,"font-weight":800},"M");
    poly([[560,80],[600,80],[630,100]],{stroke:"#6b4f2a"});poly([[560,120],[628,120]],{stroke:"#1f5f99"});
    if(i>0||et.coupe){poly([[600,105],[580,165]],{stroke:"#d9822b","stroke-dasharray":"4 3"});el("text",{x:566,y:182,"font-size":20,fill:"#d9822b"},"⚡");}
    // PE
    if(R==="TN"){pe([[630,190],[630,235],[150,235]]);el("text",{x:330,y:228,"font-size":13,"font-weight":700,fill:"#2e7d32"},"PE relié au neutre de la source");}
    else{pe([[630,190],[630,290]]);resist(630,290,335,"R_A",R==="TT"?"terre machine · 30 Ω":R==="IT"?"terre machine · 20 Ω":"terre machine");poly([[630,335],[630,345]],{stroke:"#1b1a17","stroke-width":2});terre(630,345);el("text",{x:638,y:220,"font-size":13,"font-weight":700,fill:"#2e7d32"},"PE");}
    if(R==="IT"){el("rect",{x:400,y:230,width:100,height:70,rx:6,fill:"#e9ebee",stroke:"#8a8f96","stroke-width":5});el("text",{x:450,y:318,"text-anchor":"middle","font-size":12,"font-weight":700},"Machine B : moteur triphasé");el("text",{x:450,y:334,"text-anchor":"middle","font-size":11,fill:"#6b665c"},"L1, L2, L3, pas de neutre");pe([[500,265],[630,265]]);
      if(et.ch.indexOf("IT2")>=0||(et.coupe&&i>4)){el("text",{x:428,y:262,"font-size":18,fill:"#d9822b"},"⚡");}}
    // Marie
    var danger=et.marie&&!coupe, col=danger?"#c0392b":"#1b1a17";
    el("circle",{cx:745,cy:200,r:13,fill:"#fff",stroke:col,"stroke-width":2});
    [[745,213,745,285],[745,230,702,180],[745,230,770,265],[745,285,728,360],[745,285,762,360]].forEach(function(l){el("line",{x1:l[0],y1:l[1],x2:l[2],y2:l[3],stroke:col,"stroke-width":3});});
    el("text",{x:792,y:384,"text-anchor":"end","font-size":13,"font-weight":700,fill:col},danger?"Marie : danger !":"Marie");
    if(coupe)el("text",{x:745,y:178,"text-anchor":"middle","font-size":13,"font-weight":700,fill:"#2e7d32"},"protégée !");
  }

  function animer(et){
    cancelAnimationFrame(raf);if(!et.ch.length)return;
    var pts=join.apply(null,et.ch),L=[0];for(var k=1;k<pts.length;k++)L.push(L[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));
    var tot=L[L.length-1];
    poly(pts,{stroke:et.c,"stroke-width":et.fort?9:et.faible?2:6,opacity:.45});
    var n=et.fort?16:et.faible?3:8,r=et.faible?5:9,v=et.fort?260:et.faible?60:140,dots=[];
    for(k=0;k<n;k++){var g=el("g",{});el("circle",{r:r,fill:"#f4c430",stroke:"#1b1a17","stroke-width":1.5},null,g);if(r>7)el("text",{"text-anchor":"middle",y:4,"font-size":10,"font-weight":800},"e⁻",g);dots.push(g);}
    function pos(d){d=((d%tot)+tot)%tot;for(var k=1;k<L.length;k++)if(d<=L[k]){var f=(d-L[k-1])/((L[k]-L[k-1])||1);return[pts[k-1][0]+f*(pts[k][0]-pts[k-1][0]),pts[k-1][1]+f*(pts[k][1]-pts[k-1][1])];}return pts[0];}
    var t0=performance.now();
    (function pas(t){if(!svg.isConnected)return;var d=(t-t0)/1000*v;dots.forEach(function(g,j){var p=pos(d+j*tot/n);g.setAttribute("transform","translate("+p[0]+","+p[1]+")");});raf=requestAnimationFrame(pas);})(t0);
  }

  function afficher(){
    var E=ETAPES[R],et=E[i];
    dessiner(et);animer(et);
    $("num").textContent="Régime "+R+" · étape "+(i+1)+" sur "+E.length;
    $("titre").textContent=et.t;$("texte").innerHTML=et.x;
    $("retenir").hidden=!et.r;if(et.r)$("retenir").textContent="À retenir : "+et.r;
    $("prec").disabled=i===0;$("suiv").disabled=i===E.length-1;
  }
  root.querySelectorAll("[data-r]").forEach(function(b){b.addEventListener("click",function(){R=b.dataset.r;i=0;root.querySelectorAll("[data-r]").forEach(function(x){x.setAttribute("aria-pressed",x===b);});afficher();});});
  $("prec").addEventListener("click",function(){if(i>0){i--;afficher();}});
  $("suiv").addEventListener("click",function(){if(i<ETAPES[R].length-1){i++;afficher();}});
  if (fixe) R = fixe;
  afficher();

  }
  window.COMPOSANTS = window.COMPOSANTS || {};
  window.COMPOSANTS["ou-passe-electron"] = simulateur;
})();
