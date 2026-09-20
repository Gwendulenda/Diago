/* =====================================================================
   DIAGO — SUIVI (consentement, Google Ads, Google Analytics, Clarity)
   ---------------------------------------------------------------------
   Ce fichier est chargé en premier dans le <head> de TOUTES les pages.
   C'est le SEUL endroit où se trouvent les codes de suivi.
   Pour modifier un identifiant, modifiez uniquement le bloc CONFIG.
   ===================================================================== */
(function () {
    'use strict';

    // ------------------------------------------------------------------
    // CONFIG — les seules lignes que vous aurez éventuellement à modifier
    // ------------------------------------------------------------------
    var CONFIG = {
        googleAds: 'AW-17902488856',
        googleAnalytics: 'G-VTEGEBEJJP',
        clarity: 'v8ih3ie254',

        // Conversion « Demande de diagnostic » (formulaire envoyé → page merci)
        conversionFormulaire: 'AW-17902488856/LjcRCMzd-OsbEJiaydhC',

        // Conversion « Clic sur Appeler » : à créer dans Google Ads, puis
        // coller ici l'étiquette complète (ex : 'AW-17902488856/AbCdEf123').
        // Tant que c'est vide, le clic est seulement mesuré dans Analytics.
        conversionAppel: ''
    };

    var CONSENT_KEY = 'diago_consent';

    // ------------------------------------------------------------------
    // Petits utilitaires (protégés : ne plantent jamais la page)
    // ------------------------------------------------------------------
    function lire(stockage, cle) {
        try { return window[stockage].getItem(cle); } catch (e) { return null; }
    }
    function ecrire(stockage, cle, valeur) {
        try { window[stockage].setItem(cle, valeur); } catch (e) { /* ignoré */ }
    }

    // ------------------------------------------------------------------
    // 1. CONSENTEMENT — doit être déclaré AVANT tout chargement Google
    // ------------------------------------------------------------------
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    var choix = lire('localStorage', CONSENT_KEY);
    if (!choix) {
        // Reprise des choix enregistrés par les anciennes bannières du site
        var ancien = lire('localStorage', 'cookie_consent') || lire('localStorage', 'cookie_consent_ga4');
        if (ancien === 'granted' || ancien === 'accepted') { choix = 'granted'; }
        if (ancien === 'denied' || ancien === 'refused') { choix = 'denied'; }
        if (choix) { ecrire('localStorage', CONSENT_KEY, choix); }
    }
    var accepte = (choix === 'granted');
    var etat = accepte ? 'granted' : 'denied';

    gtag('consent', 'default', {
        ad_storage: etat,
        ad_user_data: etat,
        ad_personalization: etat,
        analytics_storage: etat,
        wait_for_update: 500
    });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', true);

    // ------------------------------------------------------------------
    // 2. CHARGEMENT UNIQUE de la balise Google (Ads + Analytics)
    // ------------------------------------------------------------------
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.googleAds;
    document.head.appendChild(gs);

    gtag('js', new Date());
    gtag('config', CONFIG.googleAnalytics);
    gtag('config', CONFIG.googleAds);

    // ------------------------------------------------------------------
    // 3. MICROSOFT CLARITY — chargé uniquement après acceptation
    // ------------------------------------------------------------------
    var clarityCharge = false;
    function chargerClarity() {
        if (clarityCharge || !CONFIG.clarity) { return; }
        clarityCharge = true;
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', CONFIG.clarity);
        window.clarity('consent');
    }
    if (accepte) { chargerClarity(); }

    function enregistrerChoix(valeur) {
        ecrire('localStorage', CONSENT_KEY, valeur);
        var e = (valeur === 'granted') ? 'granted' : 'denied';
        gtag('consent', 'update', {
            ad_storage: e,
            ad_user_data: e,
            ad_personalization: e,
            analytics_storage: e
        });
        if (valeur === 'granted') { chargerClarity(); }
    }

    // ------------------------------------------------------------------
    // 4. ORIGINE DU VISITEUR (mémorisée pour la durée de la visite)
    //    Permet de savoir si une demande vient de Google Ads, d'une IA
    //    (ChatGPT, Gemini, Perplexity…), de Google naturel, etc.
    // ------------------------------------------------------------------
    function detecterOrigine() {
        var params = new URLSearchParams(window.location.search);
        var ref = '';
        try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { ref = ''; }
        if (ref === window.location.hostname) { ref = ''; }

        var utmSource = (params.get('utm_source') || '').toLowerCase();
        var utmMedium = (params.get('utm_medium') || '').toLowerCase();
        var ia = /chatgpt|openai|perplexity|gemini|bard|copilot|claude|mistral|you\.com|phind/;
        var moteurs = /google\.|bing\.|qwant\.|duckduckgo\.|ecosia\.|yahoo\./;

        var canal;
        if (params.get('gclid') || params.get('gbraid') || params.get('wbraid') || utmMedium === 'cpc') {
            canal = 'Google Ads';
        } else if (ia.test(utmSource) || ia.test(ref)) {
            canal = 'IA (' + (utmSource || ref) + ')';
        } else if (moteurs.test(ref)) {
            canal = 'Recherche naturelle (' + ref.replace('www.', '') + ')';
        } else if (ref) {
            canal = 'Site référent (' + ref.replace('www.', '') + ')';
        } else if (utmSource) {
            canal = 'Lien suivi (' + utmSource + ')';
        } else {
            canal = 'Accès direct';
        }
        return canal + ' | arrivée : ' + window.location.pathname;
    }

    if (!lire('sessionStorage', 'diago_origine')) {
        ecrire('sessionStorage', 'diago_origine', detecterOrigine());
    }

    // ------------------------------------------------------------------
    // 5. CLICS SUR LES BOUTONS « APPELER »
    // ------------------------------------------------------------------
    document.addEventListener('click', function (evt) {
        var lien = evt.target && evt.target.closest ? evt.target.closest('a') : null;
        if (!lien) { return; }
        var href = lien.getAttribute('href') || '';
        var estAppel = (lien.id && lien.id.indexOf('btn-appel') === 0) || href.indexOf('tel:') === 0 || lien.hasAttribute('data-appel');
        if (!estAppel) { return; }

        gtag('event', 'clic_appel', {
            emplacement: lien.id || 'lien-tel',
            page_path: window.location.pathname
        });
        if (CONFIG.conversionAppel) {
            gtag('event', 'conversion', { send_to: CONFIG.conversionAppel });
        }
    }, true);

    // ------------------------------------------------------------------
    // 6. BANNIÈRE COOKIES (une seule, identique sur tout le site)
    // ------------------------------------------------------------------
    function afficherBanniere() {
        if (document.getElementById('diago-cookies')) { return; }

        var style = document.createElement('style');
        style.textContent =
            '#diago-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;max-width:720px;margin:0 auto;' +
            'background:#003366;color:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.25);padding:16px 18px;' +
            'font-family:Inter,-apple-system,"Segoe UI",sans-serif;font-size:14px;line-height:1.5;display:flex;flex-wrap:wrap;gap:12px;align-items:center}' +
            '#diago-cookies p{margin:0;flex:1 1 320px}' +
            '#diago-cookies a{color:#bfe0ff;text-decoration:underline}' +
            '#diago-cookies .dc-btns{display:flex;gap:8px;flex:0 0 auto}' +
            '#diago-cookies button{font:inherit;font-weight:700;border:0;border-radius:8px;padding:10px 16px;cursor:pointer}' +
            '#diago-cookies .dc-refuser{background:#fff;color:#003366}' +
            '#diago-cookies .dc-accepter{background:#10b981;color:#fff}';
        document.head.appendChild(style);

        var bloc = document.createElement('div');
        bloc.id = 'diago-cookies';
        bloc.setAttribute('role', 'dialog');
        bloc.setAttribute('aria-label', 'Choix des cookies');
        bloc.innerHTML =
            '<p>Nous utilisons des cookies pour mesurer l’audience du site et l’efficacité de nos annonces. ' +
            'Vous pouvez accepter ou refuser. <a href="/mentions-legales.html">En savoir plus</a></p>' +
            '<div class="dc-btns"><button type="button" class="dc-refuser">Refuser</button>' +
            '<button type="button" class="dc-accepter">Accepter</button></div>';
        document.body.appendChild(bloc);

        bloc.querySelector('.dc-accepter').addEventListener('click', function () {
            enregistrerChoix('granted');
            bloc.remove();
        });
        bloc.querySelector('.dc-refuser').addEventListener('click', function () {
            enregistrerChoix('denied');
            bloc.remove();
        });
    }

    function ajouterLienGestion() {
        var cible = document.querySelector('.footer-bottom');
        if (!cible || cible.querySelector('[data-cookies]')) { return; }
        var p = document.createElement('p');
        p.style.marginTop = '6px';
        p.innerHTML = '<a href="#" data-cookies style="color:inherit;text-decoration:underline">Gérer les cookies</a>';
        cible.appendChild(p);
        p.querySelector('a').addEventListener('click', function (e) {
            e.preventDefault();
            afficherBanniere();
        });
    }

    function auChargement() {
        if (!choix) { afficherBanniere(); }
        ajouterLienGestion();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', auChargement);
    } else {
        auChargement();
    }

    // ------------------------------------------------------------------
    // 7. FONCTIONS UTILISÉES PAR LE FORMULAIRE ET LA PAGE MERCI
    // ------------------------------------------------------------------
    window.DiagoTracking = {
        origine: function () {
            return lire('sessionStorage', 'diago_origine') || detecterOrigine();
        },
        marquerDemande: function () {
            ecrire('sessionStorage', 'diago_demande', String(Date.now()));
        },
        confirmerDemande: function () {
            // Ne compte la conversion qu'une seule fois, et seulement si
            // un formulaire vient réellement d'être envoyé.
            var id = lire('sessionStorage', 'diago_demande');
            if (!id) { return false; }
            try { window.sessionStorage.removeItem('diago_demande'); } catch (e) { /* ignoré */ }
            gtag('event', 'conversion', {
                send_to: CONFIG.conversionFormulaire,
                value: 1.0,
                currency: 'EUR',
                transaction_id: 'diago-' + id
            });
            gtag('event', 'generate_lead', { value: 1.0, currency: 'EUR' });
            return true;
        }
    };
})();
