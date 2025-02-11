(function(w, d){
    var identificator = 'smart-eu-cookies';
    var userVariable = 'smart_eu_config';
    var noShowEvent = 'no-show';
    var showEvent = 'show';
    var hideEvent = 'hide';
    var consentReason = 'consent';
    var cookiesOK = 'CookiesOK';
    var DOMContentLoaded = 'DOMContentLoaded';
    var load = 'load';
    var click = 'click';

    var includes = {
        "version": "0.9.2",
        "css": ".smart-eu-cookies{display:flex;flex-wrap:wrap;justify-content:center;background:white;box-shadow:0 0 19px #000;align-items:baseline;color:#323232;padding:.7em 0;z-index:1000;position:fixed;bottom:0;width:100%;font:normal 14px sans-serif;left:0;right:0;}.smart-eu-cookies span{text-align:center;padding:13px 7px}.smart-eu-cookies button{font-size:13px;cursor:pointer;background:#000;color:white;border:1px solid black;margin:0 5px;padding:5px 15px;letter-spacing:.05em}.smart-eu-cookies button:hover{background:#000000}",
        "l18n": {
            "text": "Tento web by rád používal k poskytování služeb, personalizaci reklam a analýze návštěvnosti soubory cookie.",
            "accept": "Souhlasím",
            "disagree": "Nesouhlasím",
            "more": "Více informací",
            "link": "https://policies.google.com/technologies/cookies?hl=cs"
        },
        "options": {
            "popupMore": false,
            "callback": null,
            "dataLayerName": null,
            "insertTo": "body-begin"
        }
    };

    var config = {};

    function init() {
        w[userVariable] = w[userVariable] || {};
        config = buildConfig(includes, w[userVariable]);

        invokeEvent('init', includes.version);

        if(d.cookie.indexOf(identificator) !== -1) {
            invokeEvent(noShowEvent, consentReason);
            return;
        }

        if(navigator[cookiesOK]) {
            addCookie( 'auto-'+cookiesOK );
            invokeEvent(noShowEvent, 'plugin '+cookiesOK);
            return;
        }

        if( !w.addEventListener ) {
            //To keep things simple are old browsers unsupported
            invokeEvent(noShowEvent, 'unsupported browser');
            return;
        }

        if ( d.readyState === 'complete' ) {
            setTimeout( dry );
        } else {
            d.addEventListener( DOMContentLoaded, completed, false );
            w.addEventListener( load, completed, false );
        }
    }

    function completed() {
        d.removeEventListener( DOMContentLoaded, completed, false );
        w.removeEventListener( load, completed, false );
        dry();
    }

    function dry(){
        invokeEvent(showEvent);

        let html = '<span>%t <a href="%l">%m</a></span> ' + '<button id="smart-eu-disagree">%d</button><button id="smart-eu-accept">%a</button>';
        html = html
            .replace('%t', config.l18n.text)
            .replace('%l', config.l18n.link)
            .replace('%m', config.l18n.more)
            .replace('%a', config.l18n.accept)
            .replace('%d', config.l18n.disagree);
        const body = d.body;
        const head = d.head;
        const style = document.createElement('style');
        style.appendChild(d.createTextNode(includes.css));

        const div = d.createElement('div');
        div.className = identificator + ' smart-priority';
        div.setAttribute('data-version', includes.version);
        div.setAttribute('data-nosnippet', 'data-nosnippet');
        div.innerHTML = html;
        head.appendChild(style);
        const insertTo = config.options.insertTo;
        let targetElement;
        if (insertTo === 'body-begin') {
            body.insertBefore(div, body.firstChild);
        } else if (insertTo === 'body-end') {
            body.insertBefore(div, null);
        } else if (targetElement = document.getElementById(insertTo)) {
            targetElement.insertBefore(div, null);
        }
        document.getElementById('smart-eu-accept').addEventListener(click, function(){ consent( div, true ); });
        document.getElementById('smart-eu-disagree').addEventListener(click, function(){ consent( div, false); });
        const a = div.getElementsByTagName('a')[0];
        a.addEventListener(click, function(){ invokeEvent('open-more'); });
        if(config.options.popupMore) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        }
    }

    function buildConfig(defaults, mods) {
        var config = {};
        for(key in defaults) {
            if( typeof mods[key] === 'undefined' ) {
                config[key] = defaults[key];
            }
            else if(typeof mods[key] === 'object'){
                config[key] = buildConfig(defaults[key], mods[key]);
            }
            else {
                config[key] = mods[key];
            }
        }
        return config;
    }

    function invokeEvent( action, label ) {
        if (typeof(config.options.callback) === 'function') {
            config.options.callback( action, label );
        }
        const dataLayer = config.options.dataLayerName;
        if (dataLayer && w[dataLayer] && typeof(w[dataLayer].push) === 'function') {
            w[dataLayer].push({
                'event': identificator,
                'action': action,
                'label': label
            });
        }
    }

    function consent( div, ok ) {
        div.parentNode.removeChild( div );
        if (ok) {
            invokeEvent(hideEvent, consentReason);
        }
        addCookie( ok ? '1' : '0' );
        const gt = ok ? 'granted' : 'denied';
        if (typeof(gtag) === 'function') {
            gtag('consent', 'update', {
                'ad_storage': gt,
                'analytics_storage': gt,
                'personalization_storage': gt,
                'ad_personalization': gt,
                'ad_user_data': gt
            });    // updated to consent mode v2
        }
    }

    function addCookie( reason ) {
        if (typeof reason === 'undefined') {
            reason = '1';
        }
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        const expires = '; expires=' + date.toGMTString();
        d.cookie = identificator + '=' + encodeURIComponent(reason) + expires + '; path=/';
    }

    init();

})(window, window.document);
