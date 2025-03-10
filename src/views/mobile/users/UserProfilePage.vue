<template>
    <f7-page @page:afterin="onPageAfterIn">
        <f7-navbar>
            <f7-nav-left :back-link="tt('Back')"></f7-nav-left>
            <f7-nav-title :title="tt('User Profile')"></f7-nav-title>
            <f7-nav-right class="navbar-compact-icons">
                <f7-link icon-f7="ellipsis" :class="{ 'disabled': !isUserVerifyEmailEnabled() || loading || emailVerified }" @click="showMoreActionSheet = true"></f7-link>
                <f7-link :class="{ 'disabled': inputIsNotChanged || inputIsInvalid || saving }" :text="tt('Save')" @click="save"></f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-list strong inset dividers class="margin-vertical skeleton-text" v-if="loading">
            <f7-list-input label="Password" placeholder="Your password"></f7-list-input>
            <f7-list-input label="Confirm Password" placeholder="Re-enter the password"></f7-list-input>
            <f7-list-input label="E-mail" placeholder="Your email address"></f7-list-input>
            <f7-list-input label="Nickname" placeholder="Your nickname"></f7-list-input>
        </f7-list>

        <f7-list strong inset dividers class="margin-vertical skeleton-text" v-if="loading">
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Default Account" title="Unspecified"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Editable Transaction Range" title="All" link="#"></f7-list-item>
        </f7-list>

        <f7-list strong inset dividers class="margin-vertical skeleton-text" v-if="loading">
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Default Language" title="Language" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Default Currency" title="Currency" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="First Day of Week" title="Week Day" link="#"></f7-list-item>
        </f7-list>

        <f7-list strong inset dividers class="margin-vertical skeleton-text" v-if="loading">
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Long Date Format" title="YYYY-MM-DD" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Short Date Format" title="YYYY-MM-DD" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Long Time Format" title="HH:mm:ss" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Short Time Format" title="HH:mm" link="#"></f7-list-item>
        </f7-list>

        <f7-list strong inset dividers class="margin-vertical skeleton-text" v-if="loading">
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Currency Display Mode" title="Currency Symbol" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Digit Grouping" title="Thousands Separator" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Digit Grouping Symbol" title="Comma (,)" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Decimal Separator" title="Dot (.)" link="#"></f7-list-item>
        </f7-list>

        <f7-list strong inset dividers class="margin-vertical skeleton-text" v-if="loading">
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Expense Amount Color" title="Amount Color" link="#"></f7-list-item>
            <f7-list-item class="list-item-with-header-and-title list-item-no-item-after" header="Income Amount Color" title="Amount Color" link="#"></f7-list-item>
        </f7-list>

        <f7-list form strong inset dividers class="margin-vertical" v-if="!loading">
            <f7-list-input
                type="password"
                autocomplete="new-password"
                clear-button
                :label="tt('Password')"
                :placeholder="tt('Your password')"
                v-model:value="newProfile.password"
            ></f7-list-input>

            <f7-list-input
                type="password"
                autocomplete="new-password"
                clear-button
                :label="tt('Confirm Password')"
                :placeholder="tt('Re-enter the password')"
                v-model:value="newProfile.confirmPassword"
            ></f7-list-input>

            <f7-list-input
                type="email"
                autocomplete="email"
                clear-button
                :label="tt('E-mail') + ' ' + (emailVerified ? tt('(Verified)') : tt('(Not Verified)'))"
                :placeholder="tt('Your email address')"
                v-model:value="newProfile.email"
            ></f7-list-input>

            <f7-list-input
                type="text"
                autocomplete="nickname"
                clear-button
                :label="tt('Nickname')"
                :placeholder="tt('Your nickname')"
                v-model:value="newProfile.nickname"
            ></f7-list-input>

            <f7-list-item class="ebk-list-item-error-info" v-if="inputIsInvalid" :footer="tt(inputInvalidProblemMessage || '')"></f7-list-item>
        </f7-list>

        <f7-list form strong inset dividers class="margin-vertical" v-if="!loading">
            <f7-list-item
                class="list-item-with-header-and-title"
                link="#" no-chevron
                :class="{ 'disabled': !allVisibleAccounts.length }"
                :header="tt('Default Account')"
                :title="Account.findAccountNameById(allAccounts, newProfile.defaultAccountId, tt('Unspecified'))"
                @click="showAccountSheet = true"
            >
                <two-column-list-item-selection-sheet primary-key-field="id" primary-value-field="category"
                                                      primary-title-field="name"
                                                      primary-icon-field="icon" primary-icon-type="account"
                                                      primary-sub-items-field="accounts"
                                                      :primary-title-i18n="true"
                                                      secondary-key-field="id" secondary-value-field="id"
                                                      secondary-title-field="name"
                                                      secondary-icon-field="icon" secondary-icon-type="account" secondary-color-field="color"
                                                      :enable-filter="true" :filter-placeholder="tt('Find account')" :filter-no-items-text="tt('No available account')"
                                                      :items="allVisibleCategorizedAccounts"
                                                      v-model:show="showAccountSheet"
                                                      v-model="newProfile.defaultAccountId">
                </two-column-list-item-selection-sheet>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Editable Transaction Range')"
                :title="findDisplayNameByType(allTransactionEditScopeTypes, newProfile.transactionEditScope)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Date Range'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Editable Transaction Range'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.transactionEditScope">
                    <option :value="option.type"
                            :key="option.type"
                            v-for="option in allTransactionEditScopeTypes">{{ option.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item class="ebk-list-item-error-info" v-if="extendInputIsInvalid" :footer="tt(extendInputInvalidProblemMessage || '')"></f7-list-item>
        </f7-list>

        <f7-list form strong inset dividers class="margin-vertical" v-if="!loading">
            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                link="#"
                :header="languageTitle"
                :title="currentLanguageName"
                @click="showLanguagePopup = true"
            >
                <list-item-selection-popup value-type="item"
                                           key-field="languageTag" value-field="languageTag"
                                           title-field="nativeDisplayName" after-field="displayName"
                                           :title="languageTitle"
                                           :enable-filter="true"
                                           :filter-placeholder="tt('Language')"
                                           :filter-no-items-text="tt('No results')"
                                           :items="allLanguages"
                                           v-model:show="showLanguagePopup"
                                           v-model="newProfile.language">
                </list-item-selection-popup>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                link="#"
                :header="tt('Default Currency')"
                @click="showDefaultCurrencyPopup = true"
            >
                <template #title>
                    <f7-block class="no-padding no-margin">
                        <span>{{ getCurrencyName(newProfile.defaultCurrency) }}&nbsp;</span>
                        <small class="smaller">{{ newProfile.defaultCurrency }}</small>
                    </f7-block>
                </template>
                <list-item-selection-popup value-type="item"
                                           key-field="currencyCode" value-field="currencyCode"
                                           title-field="displayName" after-field="currencyCode"
                                           :title="tt('Default Currency')"
                                           :enable-filter="true"
                                           :filter-placeholder="tt('Currency Name')"
                                           :filter-no-items-text="tt('No results')"
                                           :items="allCurrencies"
                                           v-model:show="showDefaultCurrencyPopup"
                                           v-model="newProfile.defaultCurrency">
                </list-item-selection-popup>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('First Day of Week')"
                :title="currentDayOfWeekName"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Date'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('First Day of Week'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.firstDayOfWeek">
                    <option :value="weekDay.type"
                            :key="weekDay.type"
                            v-for="weekDay in allWeekDays">{{ weekDay.displayName }}</option>
                </select>
            </f7-list-item>
        </f7-list>

        <f7-list form strong inset dividers class="margin-vertical" v-if="!loading">
            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Long Date Format')"
                :title="findDisplayNameByType(allLongDateFormats, newProfile.longDateFormat)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Long Date Format'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Long Date Format'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.longDateFormat">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allLongDateFormats">{{ format.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Short Date Format')"
                :title="findDisplayNameByType(allShortDateFormats, newProfile.shortDateFormat)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Short Date Format'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Short Date Format'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.shortDateFormat">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allShortDateFormats">{{ format.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Long Time Format')"
                :title="findDisplayNameByType(allLongTimeFormats, newProfile.longTimeFormat)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Long Time Format'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Long Time Format'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.longTimeFormat">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allLongTimeFormats">{{ format.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Short Time Format')"
                :title="findDisplayNameByType(allShortTimeFormats, newProfile.shortTimeFormat)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Short Time Format'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Short Time Format'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.shortTimeFormat">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allShortTimeFormats">{{ format.displayName }}</option>
                </select>
            </f7-list-item>
        </f7-list>

        <f7-list form strong inset dividers class="margin-vertical" v-if="!loading">
            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Currency Display Mode')"
                :title="findDisplayNameByType(allCurrencyDisplayTypes, newProfile.currencyDisplayType)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Currency Display Mode'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Currency Display Mode'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.currencyDisplayType">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allCurrencyDisplayTypes">{{ format.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Digit Grouping')"
                :title="findDisplayNameByType(allDigitGroupingTypes, newProfile.digitGrouping)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Digit Grouping'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Digit Grouping'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.digitGrouping">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allDigitGroupingTypes">{{ format.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :disabled="!supportDigitGroupingSymbol"
                :header="tt('Digit Grouping Symbol')"
                :title="findDisplayNameByType(allDigitGroupingSymbols, newProfile.digitGroupingSymbol)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Digit Grouping Symbol'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Digit Grouping Symbol'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.digitGroupingSymbol">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allDigitGroupingSymbols">{{ format.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Decimal Separator')"
                :title="findDisplayNameByType(allDecimalSeparators, newProfile.decimalSeparator)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Decimal Separator'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Decimal Separator'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.decimalSeparator">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allDecimalSeparators">{{ format.displayName }}</option>
                </select>
            </f7-list-item>
        </f7-list>

        <f7-list form strong inset dividers class="margin-vertical" v-if="!loading">
            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Expense Amount Color')"
                :title="findDisplayNameByType(allExpenseAmountColorTypes, newProfile.expenseAmountColor)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Color'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Expense Amount Color'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.expenseAmountColor">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allExpenseAmountColorTypes">{{ format.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item
                class="list-item-with-header-and-title list-item-no-item-after"
                :header="tt('Income Amount Color')"
                :title="findDisplayNameByType(allIncomeAmountColorTypes, newProfile.incomeAmountColor)"
                smart-select :smart-select-params="{ openIn: 'popup', popupPush: true, closeOnSelect: true, scrollToSelectedItem: true, searchbar: true, searchbarPlaceholder: tt('Color'), searchbarDisableText: tt('Cancel'), appendSearchbarNotFound: tt('No results'), pageTitle: tt('Income Amount Color'), popupCloseLinkText: tt('Done') }"
            >
                <select v-model="newProfile.incomeAmountColor">
                    <option :value="format.type"
                            :key="format.type"
                            v-for="format in allIncomeAmountColorTypes">{{ format.displayName }}</option>
                </select>
            </f7-list-item>

            <f7-list-item class="ebk-list-item-error-info" v-if="langAndRegionInputIsInvalid" :footer="tt(langAndRegionInputInvalidProblemMessage || '')"></f7-list-item>
        </f7-list>

        <f7-actions close-by-outside-click close-on-escape :opened="showMoreActionSheet" @actions:closed="showMoreActionSheet = false">
            <f7-actions-group>
                <f7-actions-button :class="{ 'disabled': loading || resending }" @click="resendVerifyEmail"
                                   v-if="isUserVerifyEmailEnabled() && !loading && !emailVerified"
                >{{ tt('Resend Validation Email') }}</f7-actions-button>
            </f7-actions-group>
            <f7-actions-group>
                <f7-actions-button bold close>{{ tt('Cancel') }}</f7-actions-button>
            </f7-actions-group>
        </f7-actions>

        <password-input-sheet :title="tt('Modify Password')"
                              :hint="tt('Please enter your current password when modifying your password')"
                              :confirm-disabled="saving"
                              :cancel-disabled="saving"
                              v-model:show="showInputPasswordSheet"
                              v-model="currentPassword"
                              @password:confirm="save()">
        </password-input-sheet>
    </f7-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Router } from 'framework7/types';

import type { LanguageOption } from '@/locales/index.ts';
import { useI18n } from '@/locales/helpers.ts';
import { useI18nUIComponents, showLoading, hideLoading } from '@/lib/ui/mobile.ts';
import { useUserProfilePageBase } from '@/views/base/users/UserProfilePageBase.ts';

import { useRootStore } from '@/stores/index.ts';
import { useUserStore } from '@/stores/user.ts';
import { useAccountsStore } from '@/stores/account.ts';

import type { LocalizedCurrencyInfo } from '@/core/currency.ts';

import type { UserProfileResponse } from '@/models/user.ts';
import { Account } from '@/models/account.ts';

import { findDisplayNameByType } from '@/lib/common.ts';
import { isUserVerifyEmailEnabled } from '@/lib/server_settings.ts';

const props = defineProps<{
    f7router: Router.Router;
}>();

const { tt, getAllLanguageOptions, getAllCurrencies, getCurrencyName } = useI18n();
const { showAlert, showToast, routeBackOnError } = useI18nUIComponents();

const {
    newProfile,
    emailVerified,
    loading,
    resending,
    saving,
    allAccounts,
    allVisibleAccounts,
    allVisibleCategorizedAccounts,
    allWeekDays,
    allLongDateFormats,
    allShortDateFormats,
    allLongTimeFormats,
    allShortTimeFormats,
    allDecimalSeparators,
    allDigitGroupingSymbols,
    allDigitGroupingTypes,
    allCurrencyDisplayTypes,
    allExpenseAmountColorTypes,
    allIncomeAmountColorTypes,
    allTransactionEditScopeTypes,
    languageTitle,
    supportDigitGroupingSymbol,
    inputIsNotChangedProblemMessage,
    inputInvalidProblemMessage,
    langAndRegionInputInvalidProblemMessage,
    extendInputInvalidProblemMessage,
    inputIsNotChanged,
    inputIsInvalid,
    langAndRegionInputIsInvalid,
    extendInputIsInvalid,
    setCurrentUserProfile,
    doAfterProfileUpdate
} = useUserProfilePageBase();

const rootStore = useRootStore();
const userStore = useUserStore();
const accountsStore = useAccountsStore();

const currentPassword = ref<string>('');
const loadingError = ref<unknown | null>(null);
const showInputPasswordSheet = ref<boolean>(false);
const showAccountSheet = ref<boolean>(false);
const showLanguagePopup = ref<boolean>(false);
const showDefaultCurrencyPopup = ref<boolean>(false);
const showMoreActionSheet = ref<boolean>(false);

const allLanguages = computed<LanguageOption[]>(() => getAllLanguageOptions(true));
const allCurrencies = computed<LocalizedCurrencyInfo[]>(() => getAllCurrencies());

const currentLanguageName = computed<string>(() => {
    for (let i = 0; i < allLanguages.value.length; i++) {
        if (allLanguages.value[i].languageTag === newProfile.value.language) {
            return allLanguages.value[i].nativeDisplayName;
        }
    }

    return tt('Unknown');
});

const currentDayOfWeekName = computed<string | null>(() => findDisplayNameByType(allWeekDays.value, newProfile.value.firstDayOfWeek));

function init(): void {
    loading.value = true;

    const promises = [
        accountsStore.loadAllAccounts({ force: false }),
        userStore.getCurrentUserProfile()
    ];

    Promise.all(promises).then(responses => {
        const profile = responses[1] as UserProfileResponse;
        setCurrentUserProfile(profile);
        loading.value = false;
    }).catch(error => {
        if (error.processed) {
            loading.value = false;
        } else {
            loadingError.value = error;
            showToast(error.message || error);
        }
    });
}

function save(): void {
    const router = props.f7router;

    showInputPasswordSheet.value = false;

    const problemMessage = inputIsNotChangedProblemMessage.value || inputInvalidProblemMessage.value || extendInputInvalidProblemMessage.value || langAndRegionInputInvalidProblemMessage.value;

    if (problemMessage) {
        showAlert(problemMessage);
        return;
    }

    if (newProfile.value.password && !currentPassword.value) {
        showInputPasswordSheet.value = true;
        return;
    }

    saving.value = true;
    showLoading(() => saving.value);

    rootStore.updateUserProfile(newProfile.value.toProfileUpdateRequest(currentPassword.value)).then(response => {
        saving.value = false;
        hideLoading();
        currentPassword.value = '';

        doAfterProfileUpdate(response.user);
        showToast('Your profile has been successfully updated');
        router.back();
    }).catch(error => {
        saving.value = false;
        hideLoading();
        currentPassword.value = '';

        if (!error.processed) {
            showToast(error.message || error);
        }
    });
}

function resendVerifyEmail(): void {
    resending.value = true;
    showLoading(() => resending.value);

    rootStore.resendVerifyEmailByLoginedUser().then(() => {
        resending.value = false;
        hideLoading();

        showToast('Validation email has been sent');
    }).catch(error => {
        resending.value = false;
        hideLoading();

        if (!error.processed) {
            showToast(error.message || error);
        }
    });
}

function onPageAfterIn(): void {
    routeBackOnError(props.f7router, loadingError);
}

init();
</script>
