<template>
    <f7-icon :f7="f7IconValue" :icon="icon" :style="style">
        <slot></slot>
    </f7-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type CommonIconProps, useItemIconBase } from '@/components/base/ItemIconBase.ts';

const props = defineProps<CommonIconProps>();
const { style, getAccountIcon, getCategoryIcon } = useItemIconBase(props);

const f7IconValue = computed<string>(() => {
    if (props.iconType === 'fixed-f7') {
        return props.iconId.toString();
    } else {
        return '';
    }
});

const icon = computed<string>(() => {
    if (props.iconType === 'account') {
        return getAccountIcon(props.iconId);
    } else if (props.iconType === 'category') {
        return getCategoryIcon(props.iconId);
    } else if (props.iconType === 'fixed') {
        return props.iconId.toString();
    } else {
        return '';
    }
});
</script>
