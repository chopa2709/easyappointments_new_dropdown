<?php
/**
 * Local variables.
 *
 * @var string $company_name
 */
?>

<div id="header">
    <div id="company-name">
        <img src="<?= vars('company_logo') ?: base_url('assets/img/logo.png') ?>" alt="logo" id="company-logo">

        <div class="brand-text">
            <span class="brand-name"><?= e($company_name) ?></span>
            <span class="display-booking-selection">
                利用時間 │ マシン
            </span>
        </div>
    </div>

    <div id="steps">
        <div id="step-1" class="book-step active-step"
             data-tippy-content="<?= lang('service_and_provider') ?>">
            <strong>1</strong>
        </div>

        <div id="step-2" class="book-step"
             data-tippy-content="<?= lang('appointment_date_and_time') ?>">
            <strong>2</strong>
        </div>

        <div id="step-3" class="book-step"
             data-tippy-content="<?= lang('customer_information') ?>">
            <strong>3</strong>
        </div>

        <div id="step-4" class="book-step"
             data-tippy-content="<?= lang('appointment_confirmation') ?>">
            <strong>4</strong>
        </div>
    </div>
</div>
