/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * @since       v1.5.0
 * ---------------------------------------------------------------------------- */

/**
 * Booking weekly grid — replaces the flatpickr calendar + time-slot list in Step 2.
 *
 * Rows = time slots, columns = 7 days, available cells shown with 〇.
 *
 * #select-date (flatpickr) and #available-hours are kept off-screen so that
 * existing booking.js validation and confirm-frame logic continue to work.
 *
 * IMPORTANT: App.Http.Booking.getAvailableHours is overridden at IIFE level
 * (before DOMContentLoaded) so booking.js cannot auto-populate #available-hours.
 */
App.Pages.BookingWeeklyGrid = (function () {
    'use strict';

    const moment = window.moment;

    // ── Override BEFORE DOMContentLoaded so booking.js init cannot fire the original ──
    if (App && App.Http && App.Http.Booking) {
        App.Http.Booking.getAvailableHours = function () {};
    }

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────
    let weekStart = null;   // moment (Monday)
    let selDate   = null;   // 'YYYY-MM-DD'
    let selTime   = null;   // 'HH:mm'
    let cache     = {};     // { 'YYYY-MM-DD': [{value, display}, …] }
    let busy      = false;
    let loaded    = false;  // set true once loadWeek() has been called successfully

    // DOM refs — populated in initialize()
    let $svc, $prov, $tz, $hours, $fpDate;
    let $grid, $prev, $next, $label, $err;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    function timeFmt() {
        return 'HH:mm';
    }

    function svcDuration() {
        const id  = $svc.val();
        const svc = (vars('available_services') || []).find((s) => Number(s.id) === Number(id));
        return svc ? svc.duration : 15;
    }

    function provTz() {
        let pid = $prov.val();
        const sid = $svc.val();
        if (pid === 'any-provider') {
            for (const p of vars('available_providers') || []) {
                if (p.services.includes(Number(sid))) { pid = p.id; break; }
            }
        }
        const p = (vars('available_providers') || []).find((p) => Number(p.id) === Number(pid));
        return p ? p.timezone : 'UTC';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API
    // ─────────────────────────────────────────────────────────────────────────
    function fetchDay(dateStr) {
        if (cache[dateStr] !== undefined) return Promise.resolve(cache[dateStr]);

        return new Promise((resolve) => {
            $.post(App.Utils.Url.siteUrl('booking/get_available_hours'), {
                csrf_token:       vars('csrf_token'),
                service_id:       $svc.val(),
                provider_id:      $prov.val(),
                selected_date:    dateStr,
                service_duration: svcDuration(),
                manage_mode:      Number(vars('manage_mode') || 0),
                appointment_id:   vars('manage_mode') ? vars('appointment_data').id : null,
            })
                .done((res) => {
                    const ptz = provTz();
                    const utz = $tz.val() || 'UTC';
                    const fmt = timeFmt();
                    const hours = [];

                    if (Array.isArray(res)) {
                        res.forEach((h) => {
                            const m = moment.tz(dateStr + ' ' + h + ':00', ptz).tz(utz);
                            hours.push({ value: h, display: m.format(fmt) });
                        });
                    }

                    cache[dateStr] = hours;
                    resolve(hours);
                })
                .fail(() => { cache[dateStr] = []; resolve([]); });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    function render(days, data) {
        $grid.empty();

        const today  = moment().format('YYYY-MM-DD');
        const minDay = moment().startOf('day');
        const maxDay = vars('future_booking_limit')
            ? moment().add(vars('future_booking_limit'), 'days') : null;

        // Collect all unique times
        const timesSet = new Set();
        data.forEach((d) => d.forEach((h) => timesSet.add(h.value)));
        const times = [...timesSet].sort();

        // Row 0: corner + day headers
        $grid.append('<div class="wg-corner"></div>');
        days.forEach((d) => {
            const ds  = d.format('YYYY-MM-DD');
            const cls = 'wg-header' + (ds === today ? ' wg-today' : '');
            $grid.append(
                '<div class="' + cls + '">' +
                '<span class="wg-wday">' + d.format('ddd') + '</span>' +
                '<span class="wg-date">' + d.format('M/D') + '</span>' +
                '</div>',
            );
        });

        // No slots
        if (times.length === 0) {
            $grid.append('<div class="wg-msg">' + lang('no_available_hours') + '</div>');
            return;
        }

        // Time rows
        times.forEach((t) => {
            $grid.append('<div class="wg-time">' + moment(t, 'HH:mm').format(timeFmt()) + '</div>');

            days.forEach((d, i) => {
                const ds    = d.format('YYYY-MM-DD');
                const slot  = data[i].find((h) => h.value === t);
                const past  = d.isBefore(minDay);
                const over  = maxDay && d.isAfter(maxDay);
                const avail = Boolean(slot) && !past && !over;
                const sel   = ds === selDate && t === selTime;

                const cls  = 'wg-cell' + (avail ? ' wg-avail' : '') + (sel ? ' wg-sel' : '');
                const attr = avail ? ' data-date="' + ds + '" data-time="' + t + '"' : '';

                $grid.append(
                    '<div class="' + cls + '"' + attr + '>' +
                    '<span class="wg-mark">' + (avail ? '〇' : '') + '</span>' +
                    '</div>',
                );
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Load week
    // ─────────────────────────────────────────────────────────────────────────
    function loadWeek() {
        if (busy) return;
        if (!$svc || !$svc.val() || !$prov || !$prov.val()) return;

        busy = true;
        loaded = true;
        $prev.prop('disabled', true);
        $next.prop('disabled', true);
        $err.hide();

        const days = [];
        for (let i = 0; i < 7; i++) days.push(weekStart.clone().add(i, 'days'));

        $label.text(days[0].format('M/D') + ' – ' + days[6].format('M/D') + '  ' + weekStart.format('YYYY'));
        $grid.html('<div class="wg-msg"><i class="fas fa-spinner fa-spin me-1"></i></div>');

        Promise.all(days.map((d) => fetchDay(d.format('YYYY-MM-DD')))).then((data) => {
            render(days, data);
            busy = false;
            $prev.prop('disabled', weekStart.isSameOrBefore(moment().startOf('isoWeek')));
            $next.prop('disabled', false);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Select a cell
    // ─────────────────────────────────────────────────────────────────────────
    function selectCell(dateStr, timeVal) {
        selDate = dateStr;
        selTime = timeVal;
        $err.hide();

        // Update hidden flatpickr (false = no onChange)
        if ($fpDate.length && $fpDate[0]._flatpickr) {
            $fpDate[0]._flatpickr.setDate(new Date(dateStr + 'T00:00'), false);
        }

        // Update hidden #available-hours for validation + confirm frame
        $hours.empty();
        $('<button>', { class: 'available-hour selected-hour', text: moment(timeVal, 'HH:mm').format(timeFmt()) })
            .data('value', timeVal)
            .appendTo($hours);

        // Visual
        $grid.find('.wg-sel').removeClass('wg-sel');
        $grid.find('[data-date="' + dateStr + '"][data-time="' + timeVal + '"]').addClass('wg-sel');

        App.Pages.Booking.updateConfirmFrame();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reset
    // ─────────────────────────────────────────────────────────────────────────
    function reset() {
        cache   = {};
        selDate = null;
        selTime = null;
        loaded  = false;
        weekStart = moment().startOf('isoWeek');
        if ($hours) $hours.empty();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Activate — called by polling interval and MutationObserver
    // ─────────────────────────────────────────────────────────────────────────
    function activate() {
        if (loaded || busy) return;
        if (!$grid || !$grid.length) return;
        if (!$svc || !$prov) return;

        const svcVal  = $svc.val();
        const provVal = $prov.val();

        if (!svcVal || !provVal) return;

        loadWeek();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Initialize
    // ─────────────────────────────────────────────────────────────────────────
    function initialize() {
        $svc    = $('#select-service');
        $prov   = $('#select-provider');
        $tz     = $('#select-timezone');
        $hours  = $('#available-hours');
        $fpDate = $('#select-date');
        $grid   = $('#weekly-grid-container');
        $prev   = $('#week-prev');
        $next   = $('#week-next');
        $label  = $('#week-range-label');
        $err    = $('#weekly-grid-error');

        if (!$grid.length) return;

        weekStart = moment().startOf('isoWeek');

        // ── Manage mode: pre-select existing appointment ──
        if (vars('manage_mode') && vars('appointment_data')) {
            const appt = vars('appointment_data');
            selDate   = moment(appt.start_datetime).format('YYYY-MM-DD');
            selTime   = moment(appt.start_datetime).format('HH:mm');
            weekStart = moment(selDate).startOf('isoWeek');

            $hours.empty();
            $('<button>', { class: 'available-hour selected-hour', text: moment(selTime, 'HH:mm').format(timeFmt()) })
                .data('value', selTime).appendTo($hours);
        }

        // ── Navigation ──
        $prev.on('click', () => {
            const min = moment().startOf('isoWeek');
            if (weekStart.isAfter(min)) { weekStart.subtract(1, 'week'); cache = {}; loadWeek(); }
        });
        $next.on('click', () => { weekStart.add(1, 'week'); cache = {}; loadWeek(); });

        // ── Cell click ──
        $grid.on('click', '.wg-avail', function () {
            selectCell($(this).data('date'), $(this).data('time'));
        });

        // ── Timezone change ──
        $tz.on('change', () => { cache = {}; if (loaded) { loaded = false; loadWeek(); } });

        // ── Service/provider change → reset ──
        $svc.add($prov).on('change', () => { reset(); });

        // ── Validation error message in visible area ──
        $(document).on('click', '#button-next-2', () => {
            if (!$('.selected-hour').length) $err.text(lang('appointment_hour_missing')).show();
        });

        // ── Polling: try activate() every 100ms until loaded ──
        const pollInterval = setInterval(() => {
            if (loaded) { clearInterval(pollInterval); return; }
            activate();
        }, 100);

        // Stop polling after 10 seconds regardless
        setTimeout(() => clearInterval(pollInterval), 10000);

        // ── MutationObserver on #step-2 class ──
        const step2El = document.getElementById('step-2');
        if (step2El) {
            new MutationObserver(() => {
                if (step2El.classList.contains('active-step')) {
                    setTimeout(activate, 50);
                }
            }).observe(step2El, { attributes: true, attributeFilter: ['class'] });
        }

        // Catch already-active case
        if (step2El && step2El.classList.contains('active-step')) {
            setTimeout(activate, 50);
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);

    // Expose for console debugging
    window.wg = {
        loadWeek: () => loadWeek(),
        activate: () => activate(),
        state: () => ({
            svc:   $('#select-service').val(),
            prov:  $('#select-provider').val(),
            busy,
            loaded,
            weekStart: weekStart ? weekStart.format('YYYY-MM-DD') : null,
        }),
    };

    return { activate, reset };
})();
