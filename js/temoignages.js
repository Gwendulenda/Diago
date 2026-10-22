// Affichage des avis clients publiés.
// Source : le Google Sheet « Avis DIAGO ». Seuls les avis avec l'accord du client
// ET « oui » dans la colonne « Publié sur le site ? » sont renvoyés par le script.
// - [data-avis-liste]  : zone où les avis sont affichés (data-max = nombre maximum)
// - [data-avis-bloc]   : bloc masqué tant qu'aucun avis n'est publié
// - [data-avis-resume] : ligne « note moyenne » (masquée s'il n'y a aucun avis)
// - [data-avis-vide]   : message affiché s'il n'y a aucun avis
// Si le script Google ne répond pas, la page garde ce qui est écrit dans le HTML.
(function () {
  'use strict';
  var URL_AVIS = window.DIAGO_AVIS_URL || '';
  var DUREE_PUBLICATION = 3 * 365 * 24 * 3600 * 1000; // 3 ans (voir modalités)
  var listes = document.querySelectorAll('[data-avis-liste]');
  if (!listes.length || URL_AVIS.indexOf('https://script.google.com/') !== 0 || !window.fetch) {
    return;
  }

  function element(balise, classe, texte) {
    var el = document.createElement(balise);
    if (classe) { el.className = classe; }
    if (texte) { el.textContent = texte; }
    return el;
  }

  function carte(a) {
    var article = element('article', 'avis-carte');
    var note = Math.max(0, Math.min(5, Math.round(Number(a.note) || 0)));
    if (note) {
      var etoiles = element('p', 'avis-etoiles', '★★★★★'.slice(0, note) + '☆☆☆☆☆'.slice(0, 5 - note));
      etoiles.setAttribute('aria-label', 'Note : ' + note + ' sur 5');
      etoiles.setAttribute('role', 'img');
      article.appendChild(etoiles);
    }
    article.appendChild(element('blockquote', 'avis-texte', String(a.texte || '')));
    var auteur = [a.prenom, a.commune].filter(Boolean).join(', ');
    if (a.bien) { auteur += (auteur ? ' · ' : '') + a.bien; }
    if (auteur) { article.appendChild(element('p', 'avis-auteur', auteur)); }
    var dates = [];
    if (a.date) { dates.push('Avis déposé en ' + a.date); }
    if (a.intervention) { dates.push('diagnostic réalisé en ' + a.intervention); }
    if (dates.length) { article.appendChild(element('p', 'avis-dates', dates.join(' · '))); }
    return article;
  }

  function afficher(avis) {
    var maintenant = Date.now();
    avis = avis.filter(function (a) {
      return a && String(a.texte || '').trim() &&
        (!a.horodatage || maintenant - Number(a.horodatage) < DUREE_PUBLICATION);
    });
    Array.prototype.forEach.call(listes, function (liste) {
      var max = parseInt(liste.getAttribute('data-max'), 10) || 100;
      while (liste.firstChild) { liste.removeChild(liste.firstChild); }
      avis.slice(0, max).forEach(function (a) { liste.appendChild(carte(a)); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-avis-bloc]'), function (bloc) {
      bloc.hidden = avis.length === 0;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-avis-vide]'), function (vide) {
      vide.hidden = avis.length > 0;
    });
    var notes = avis.map(function (a) { return Number(a.note); }).filter(function (n) { return n >= 1 && n <= 5; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-avis-resume]'), function (resume) {
      if (!notes.length) { resume.hidden = true; return; }
      var moyenne = notes.reduce(function (s, n) { return s + n; }, 0) / notes.length;
      resume.textContent = 'Note moyenne : ' + moyenne.toFixed(1).replace('.', ',') + ' / 5 sur ' +
        avis.length + (avis.length > 1 ? ' avis publiés' : ' avis publié');
      resume.hidden = false;
    });
  }

  var controleur = window.AbortController ? new AbortController() : null;
  var delai = setTimeout(function () { if (controleur) { controleur.abort(); } }, 10000);
  fetch(URL_AVIS, { credentials: 'omit', signal: controleur ? controleur.signal : undefined })
    .then(function (reponse) { return reponse.json(); })
    .then(function (donnees) {
      clearTimeout(delai);
      if (donnees && Array.isArray(donnees.avis)) { afficher(donnees.avis); }
    })
    .catch(function () { clearTimeout(delai); });
})();
