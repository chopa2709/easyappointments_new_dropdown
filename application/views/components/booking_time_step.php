<?php
/**
 * Local variables.
 *
 * @var array $grouped_timezones
 */
?>

<div id="wizard-frame-2" class="wizard-frame" style="display:none;">
    <div class="frame-container">

        <h2 class="frame-title"><?= lang('appointment_date_and_time') ?></h2>

        <div class="frame-content">
            <div class="mb-3">
                <label for="select-timezone" class="form-label">
                    <?= lang('timezone') ?>
                </label>
                <?php component('timezone_dropdown', [
                    'attributes' => 'id="select-timezone" class="form-select" value="UTC"',
                    'grouped_timezones' => $grouped_timezones,
                ]); ?>
            </div>

            <?php slot('after_select_timezone'); ?>
            <?php slot('after_select_date'); ?>
            <?php slot('after_available_hours'); ?>

            <div id="weekly-grid-wrapper">
                <div id="weekly-grid-nav">
                    <button id="week-prev" class="btn btn-outline-secondary btn-sm" type="button">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span id="week-range-label"></span>
                    <button id="week-next" class="btn btn-outline-secondary btn-sm" type="button">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div id="weekly-grid-scroll">
                    <div id="weekly-grid-container"></div>
                </div>
                <p id="weekly-grid-error" class="text-danger small mt-2 mb-0" style="display:none;"></p>
            </div>
        </div>
    </div>

    <!-- flatpickr + available-hours: hidden but required by existing JS -->
    <div id="booking-js-anchors">
        <div id="select-date"></div>
        <div id="available-hours"></div>
    </div>

    <div class="command-buttons">
        <button type="button" id="button-back-2" class="btn button-back btn-outline-secondary"
                data-step_index="2">
            <i class="fas fa-chevron-left me-2"></i>
            <?= lang('back') ?>
        </button>
        <button type="button" id="button-next-2" class="btn button-next btn-dark"
                data-step_index="2">
            <?= lang('next') ?>
            <i class="fas fa-chevron-right ms-2"></i>
        </button>
    </div>
</div>
