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
            const wrapper = field.closest('.mb-3');
            if (wrapper) wrapper.hidden = true;
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

    function applyLiffLayout() {
        document.body.classList.add('liff-mode');
        const style = document.createElement('style');
        style.textContent = [
            '.liff-mode .command-buttons {',
            '  position: fixed; bottom: 0; left: 0; right: 0;',
            '  background: #fff; padding: 12px 16px;',
            '  box-shadow: 0 -2px 8px rgba(0,0,0,0.12); z-index: 200;',
            '}',
            '.liff-mode .wizard-frame { padding-bottom: 72px; }',
        ].join('\n');
        document.head.appendChild(style);
    }

    try {
        if (typeof liff === 'undefined') return;

        liff.init({ liffId: LIFF_ID })
            .then(() => {
                if (liff.isInClient()) applyLiffLayout();
                if (!liff.isLoggedIn()) {
                    if (liff.isInClient()) liff.login();
                    return null;
                }
                return liff.getProfile();
            })
            .then((profile) => {
                if (!profile) return;
                document.addEventListener('DOMContentLoaded', () => watchStep3(profile.displayName));
                if (document.readyState !== 'loading') watchStep3(profile.displayName);
            })
            .catch(() => {});
    } catch (e) {}
})();
