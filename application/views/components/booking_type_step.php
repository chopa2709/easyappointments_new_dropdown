<?php
/**
 * Local variables.
 *
 * @var array $available_services
 * @var array $available_providers
 */
?>

<div id="wizard-frame-1" class="wizard-frame" style="visibility: hidden;">
    <div class="frame-container">
        <h2 class="frame-title mt-md-5"><?= lang('service_and_provider') ?></h2>

        <div class="row frame-content">
            <div class="col col-md-8 offset-md-2">

                <!-- Provider shown first -->
                <div class="mb-3">
                    <label for="select-provider">
                        <strong>マシン</strong>
                    </label>

                    <select id="select-provider" class="form-select">
                        <option value="">
                            <?= lang('please_select') ?>
                        </option>
                        <?php foreach ($available_providers as $provider): ?>
                            <option value="<?= $provider['id'] ?>">
                                <?= e($provider['first_name'] . ' ' . $provider['last_name']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <?php slot('after_select_provider'); ?>

                <!-- Service shown after provider is selected (hidden initially) -->
                <div class="mb-3" hidden>
                    <label for="select-service">
                        <strong>利用時間</strong>
                    </label>

                    <select id="select-service" class="form-select">
                        <option value="">
                            <?= lang('please_select') ?>
                        </option>
                    </select>
                </div>

                <?php slot('after_select_service'); ?>

                <div id="service-description" class="small">
                    <!-- JS -->
                </div>

                <?php slot('after_service_description'); ?>

            </div>
        </div>
    </div>

    <div class="command-buttons">
        <span>&nbsp;</span>

        <button type="button" id="button-next-1" class="btn button-next btn-dark"
                data-step_index="1">
            <?= lang('next') ?>
            <i class="fas fa-chevron-right ms-2"></i>
        </button>
    </div>
</div>
