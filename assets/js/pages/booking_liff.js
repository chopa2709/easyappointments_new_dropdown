/* ----------------------------------------------------------------------------
 * LINE LIFF profile auto-fill for the booking form.
 * ---------------------------------------------------------------------------- */

(function () {
    'use strict';

    const LIFF_ID = '2010079125-mOLd6Nbp';

    function dbg(msg) {
        var d = document.getElementById('liff-dbg');
        if (!d) {
            d = document.createElement('div');
            d.id = 'liff-dbg';
            d.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#facc15;color:#000;font-size:11px;padding:4px 8px;z-index:9999;';
            document.body.appendChild(d);
        }
        d.textContent = msg;
    }

    function fillName(displayName) {
        const field = document.getElementById('first-name');
        if (field && !field.value) {
            field.value = displayName;
        }
    }

    function watchStep3(displayName) {
        const frame = document.getElementById('wizard-frame-3');
        if (!frame) return;

        fillName(displayName);

        new MutationObserver(() => fillName(displayName)).observe(frame, {
            attributes: true,
            attributeFilter: ['style', 'class'],
        });
    }

    liff.init({ liffId: LIFF_ID })
        .then(() => {
            dbg('init OK | inClient:' + liff.isInClient() + ' loggedIn:' + liff.isLoggedIn());
            if (!liff.isLoggedIn()) {
                if (liff.isInClient()) liff.login();
                return null;
            }
            return liff.getProfile();
        })
        .then((profile) => {
            if (!profile) { dbg('no profile'); return; }
            dbg('profile: ' + profile.displayName);
            document.addEventListener('DOMContentLoaded', () => watchStep3(profile.displayName));
            if (document.readyState !== 'loading') watchStep3(profile.displayName);
        })
        .catch((e) => dbg('error: ' + e));
})();
