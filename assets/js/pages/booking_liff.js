/* ----------------------------------------------------------------------------
 * LINE LIFF profile auto-fill for the booking form.
 *
 * When the booking page is opened inside the LINE app via LIFF, this script
 * fetches the user's LINE display name and pre-fills the #first-name field.
 * It silently does nothing when accessed from a regular browser.
 * ---------------------------------------------------------------------------- */

(function () {
    'use strict';

    const LIFF_ID = '2010079125-mOLd6Nbp';

    function fillName(displayName) {
        const field = document.getElementById('first-name');
        if (field && !field.value) {
            field.value = displayName;
        }
    }

    function watchStep3(displayName) {
        const frame = document.getElementById('wizard-frame-3');
        if (!frame) return;

        // Fill immediately in case step-3 is already visible (manage mode)
        fillName(displayName);

        // Also fill when step-3 is shown (style/class change)
        new MutationObserver(() => fillName(displayName)).observe(frame, {
            attributes: true,
            attributeFilter: ['style', 'class'],
        });
    }

    liff.init({ liffId: LIFF_ID })
        .then(() => {
            console.log('[LIFF] init ok / isInClient:', liff.isInClient(), '/ isLoggedIn:', liff.isLoggedIn());
            if (!liff.isLoggedIn()) {
                if (liff.isInClient()) liff.login();
                return null;
            }
            return liff.getProfile();
        })
        .then((profile) => {
            if (!profile) { console.log('[LIFF] no profile'); return; }
            console.log('[LIFF] displayName:', profile.displayName);
            document.addEventListener('DOMContentLoaded', () => watchStep3(profile.displayName));
            if (document.readyState !== 'loading') watchStep3(profile.displayName);
        })
        .catch((e) => console.error('[LIFF] error:', e));
})();
