import { CategoryType } from '@/core/category.ts';
import { TransactionType } from '@/core/transaction.ts';
import { type TransactionCategoriesWithVisibleCount, TransactionCategory } from '@/models/transaction_category.ts';

export function transactionTypeToCategoryType(transactionType: TransactionType): CategoryType | null {
    if (transactionType === TransactionType.Income) {
        return CategoryType.Income;
    } else if (transactionType === TransactionType.Expense) {
        return CategoryType.Expense;
    } else if (transactionType === TransactionType.Transfer) {
        return CategoryType.Transfer;
    } else {
        return null;
    }
}

export function categoryTypeToTransactionType(categoryType: CategoryType): TransactionType | null {
    if (categoryType === CategoryType.Income) {
        return TransactionType.Income;
    } else if (categoryType === CategoryType.Expense) {
        return TransactionType.Expense;
    } else if (categoryType === CategoryType.Transfer) {
        return TransactionType.Transfer;
    } else {
        return null;
    }
}

export function getTransactionPrimaryCategoryName(categoryId: string | null | undefined, allCategories: TransactionCategory[]): string {
    if (!allCategories) {
        return '';
    }

    for (let i = 0; i < allCategories.length; i++) {
        const subCategoryList = allCategories[i].secondaryCategories;

        if (!subCategoryList) {
            continue;
        }

        for (let j = 0; j < subCategoryList.length; j++) {
            const subCategory = subCategoryList[j];
            if (subCategory.id === categoryId) {
                return allCategories[i].name;
            }
        }
    }

    return '';
}

export function getTransactionSecondaryCategoryName(categoryId: string | null | undefined, allCategories: TransactionCategory[]): string {
    if (!allCategories) {
        return '';
    }

    for (let i = 0; i < allCategories.length; i++) {
        const subCategoryList = allCategories[i].secondaryCategories;

        if (!subCategoryList) {
            continue;
        }

        for (let j = 0; j < subCategoryList.length; j++) {
            const subCategory = subCategoryList[j];
            if (subCategory.id === categoryId) {
                return subCategory.name;
            }
        }
    }

    return '';
}

export function allTransactionCategoriesWithVisibleCount(allTransactionCategories: Record<number, TransactionCategory[]>, allowCategoryTypes: Record<number, boolean>): Record<number, TransactionCategoriesWithVisibleCount> {
    const ret: Record<string, TransactionCategoriesWithVisibleCount> = {};
    const hasAllowCategoryTypes = allowCategoryTypes
        && (allowCategoryTypes[CategoryType.Income]
            || allowCategoryTypes[CategoryType.Expense]
            || allowCategoryTypes[CategoryType.Transfer]);

    const allCategoryTypes = [ CategoryType.Income, CategoryType.Expense, CategoryType.Transfer ];

    for (let i = 0; i < allCategoryTypes.length; i++) {
        const categoryType = allCategoryTypes[i];

        if (!allTransactionCategories[categoryType]) {
            continue;
        }

        if (hasAllowCategoryTypes && !allowCategoryTypes[categoryType]) {
            continue;
        }

        const allCategories: TransactionCategory[] = allTransactionCategories[categoryType];
        const allSubCategories: Record<string, TransactionCategory[]> = {};
        const allVisibleSubCategoryCounts: Record<string, number> = {};
        const allFirstVisibleSubCategoryIndexes: Record<string, number> = {};
        let allVisibleCategoryCount = 0;
        let firstVisibleCategoryIndex = -1;

        for (let j = 0; j < allCategories.length; j++) {
            const category = allCategories[j];

            if (!category.hidden) {
                allVisibleCategoryCount++;

                if (firstVisibleCategoryIndex === -1) {
                    firstVisibleCategoryIndex = j;
                }
            }

            if (category.secondaryCategories) {
                let visibleSubCategoryCount = 0;
                let firstVisibleSubCategoryIndex = -1;

                for (let k = 0; k < category.secondaryCategories.length; k++) {
                    const subCategory = category.secondaryCategories[k];

                    if (!subCategory.hidden) {
                        visibleSubCategoryCount++;

                        if (firstVisibleSubCategoryIndex === -1) {
                            firstVisibleSubCategoryIndex = k;
                        }
                    }
                }

                if (category.secondaryCategories.length > 0) {
                    allSubCategories[category.id] = category.secondaryCategories;
                    allVisibleSubCategoryCounts[category.id] = visibleSubCategoryCount;
                    allFirstVisibleSubCategoryIndexes[category.id] = firstVisibleSubCategoryIndex;
                }
            }
        }

        ret[categoryType] = {
            type: categoryType,
            allCategories: allCategories,
            allVisibleCategoryCount: allVisibleCategoryCount,
            firstVisibleCategoryIndex: firstVisibleCategoryIndex,
            allSubCategories: allSubCategories,
            allVisibleSubCategoryCounts: allVisibleSubCategoryCounts,
            allFirstVisibleSubCategoryIndexes: allFirstVisibleSubCategoryIndexes
        };
    }

    return ret;
}

export function allVisiblePrimaryTransactionCategoriesByType(allTransactionCategories: Record<number, TransactionCategory[]>, categoryType: number): TransactionCategory[] {
    const allCategories = allTransactionCategories[categoryType];
    const visibleCategories: TransactionCategory[] = [];

    if (!allCategories) {
        return visibleCategories;
    }

    for (let i = 0; i < allCategories.length; i++) {
        const category = allCategories[i];

        if (category.hidden) {
            continue;
        }

        visibleCategories.push(category);
    }

    return visibleCategories;
}

export function getFinalCategoryIdsByFilteredCategoryIds(allTransactionCategoriesMap: Record<number, TransactionCategory>, filteredCategoryIds: Record<string, boolean>): string {
    let finalCategoryIds = '';

    if (!allTransactionCategoriesMap) {
        return finalCategoryIds;
    }

    for (const categoryId in allTransactionCategoriesMap) {
        if (!Object.prototype.hasOwnProperty.call(allTransactionCategoriesMap, categoryId)) {
            continue;
        }

        const category = allTransactionCategoriesMap[categoryId];

        if (filteredCategoryIds && !isCategoryOrSubCategoriesAllChecked(category, filteredCategoryIds)) {
            continue;
        }

        if (finalCategoryIds.length > 0) {
            finalCategoryIds += ',';
        }

        finalCategoryIds += category.id;
    }

    return finalCategoryIds;
}

export function isSubCategoryIdAvailable(categories: TransactionCategory[], categoryId: string): boolean {
    if (!categories || !categories.length) {
        return false;
    }

    for (let i = 0; i < categories.length; i++) {
        const primaryCategory = categories[i];

        if (primaryCategory.hidden) {
            continue;
        }

        const subCategoryList = primaryCategory.secondaryCategories;

        if (!subCategoryList) {
            continue;
        }

        for (let j = 0; j < subCategoryList.length; j++) {
            const secondaryCategory = subCategoryList[j];

            if (secondaryCategory.hidden) {
                continue;
            }

            if (secondaryCategory.id === categoryId) {
                return true;
            }
        }
    }

    return false;
}

export function getFirstAvailableCategoryId(categories: TransactionCategory[]): string {
    if (!categories || !categories.length) {
        return '';
    }

    for (let i = 0; i < categories.length; i++) {
        const primaryCategory = categories[i];

        if (primaryCategory.hidden) {
            continue;
        }

        const subCategoryList = primaryCategory.secondaryCategories;

        if (!subCategoryList) {
            continue;
        }

        for (let j = 0; j < subCategoryList.length; j++) {
            const secondaryCategory = subCategoryList[j];

            if (secondaryCategory.hidden) {
                continue;
            }

            return secondaryCategory.id;
        }
    }

    return '';
}

export function getFirstAvailableSubCategoryId(categories: TransactionCategory[], categoryId: string): string {
    if (!categories || !categories.length) {
        return '';
    }

    for (let i = 0; i < categories.length; i++) {
        const primaryCategory = categories[i];

        if (primaryCategory.hidden || primaryCategory.id !== categoryId) {
            continue;
        }

        const subCategoryList = primaryCategory.secondaryCategories;

        if (!subCategoryList) {
            return '';
        }

        for (let j = 0; j < subCategoryList.length; j++) {
            const secondaryCategory = subCategoryList[j];

            if (secondaryCategory.hidden) {
                continue;
            }

            return secondaryCategory.id;
        }

        return '';
    }

    return '';
}

export function isNoAvailableCategory(categories: TransactionCategory[], showHidden: boolean): boolean {
    for (let i = 0; i < categories.length; i++) {
        if (showHidden || !categories[i].hidden) {
            return false;
        }
    }

    return true;
}

export function getAvailableCategoryCount(categories: TransactionCategory[], showHidden: boolean): number {
    let count = 0;

    for (let i = 0; i < categories.length; i++) {
        if (showHidden || !categories[i].hidden) {
            count++;
        }
    }

    return count;
}

export function getFirstShowingId(categories: TransactionCategory[], showHidden: boolean): string | null {
    for (let i = 0; i < categories.length; i++) {
        if (showHidden || !categories[i].hidden) {
            return categories[i].id;
        }
    }

    return null;
}

export function getLastShowingId(categories: TransactionCategory[], showHidden: boolean): string | null {
    for (let i = categories.length - 1; i >= 0; i--) {
        if (showHidden || !categories[i].hidden) {
            return categories[i].id;
        }
    }

    return null;
}

export function hasAnyAvailableCategory(allTransactionCategories: Record<number, TransactionCategoriesWithVisibleCount>, showHidden: boolean): boolean {
    for (const type in allTransactionCategories) {
        if (!Object.prototype.hasOwnProperty.call(allTransactionCategories, type)) {
            continue;
        }

        const categoryType = allTransactionCategories[type];

        if (showHidden) {
            if (categoryType.allCategories && categoryType.allCategories.length > 0) {
                return true;
            }
        } else {
            if (categoryType.allVisibleCategoryCount > 0) {
                return true;
            }
        }
    }

    return false;
}

export function hasAvailableCategory(allTransactionCategories: Record<number, TransactionCategoriesWithVisibleCount>, showHidden: boolean): Record<number, boolean> {
    const result: Record<number, boolean> = {};

    for (const type in allTransactionCategories) {
        if (!Object.prototype.hasOwnProperty.call(allTransactionCategories, type)) {
            continue;
        }

        const categoryType = allTransactionCategories[type];

        if (showHidden) {
            result[type] = categoryType.allCategories && categoryType.allCategories.length > 0;
        } else {
            result[type] = categoryType.allVisibleCategoryCount > 0;
        }
    }

    return result;
}

export function selectSubCategories(filterCategoryIds: Record<string, boolean>, category: TransactionCategory, value: boolean): void {
    if (!category || !category.secondaryCategories || !category.secondaryCategories.length) {
        return;
    }

    for (let i = 0; i < category.secondaryCategories.length; i++) {
        const subCategory = category.secondaryCategories[i];
        filterCategoryIds[subCategory.id] = value;
    }
}

export function selectAll(filterCategoryIds: Record<string, boolean>, allTransactionCategoriesMap: Record<string, TransactionCategory>): void {
    for (const categoryId in filterCategoryIds) {
        if (!Object.prototype.hasOwnProperty.call(filterCategoryIds, categoryId)) {
            continue;
        }

        const category = allTransactionCategoriesMap[categoryId];

        if (category) {
            filterCategoryIds[category.id] = false;
        }
    }
}

export function selectNone(filterCategoryIds: Record<string, boolean>, allTransactionCategoriesMap: Record<string, TransactionCategory>): void {
    for (const categoryId in filterCategoryIds) {
        if (!Object.prototype.hasOwnProperty.call(filterCategoryIds, categoryId)) {
            continue;
        }

        const category = allTransactionCategoriesMap[categoryId];

        if (category) {
            filterCategoryIds[category.id] = true;
        }
    }
}

export function selectInvert(filterCategoryIds: Record<string, boolean>, allTransactionCategoriesMap: Record<string, TransactionCategory>): void {
    for (const categoryId in filterCategoryIds) {
        if (!Object.prototype.hasOwnProperty.call(filterCategoryIds, categoryId)) {
            continue;
        }

        const category = allTransactionCategoriesMap[categoryId];

        if (category) {
            filterCategoryIds[category.id] = !filterCategoryIds[category.id];
        }
    }
}

export function isCategoryOrSubCategoriesAllChecked(category: TransactionCategory, filterCategoryIds: Record<string, boolean>): boolean {
    if (!category.secondaryCategories || category.secondaryCategories.length < 1) {
        return !filterCategoryIds[category.id];
    }

    for (let i = 0; i < category.secondaryCategories.length; i++) {
        const subCategory = category.secondaryCategories[i];
        if (filterCategoryIds[subCategory.id]) {
            return false;
        }
    }

    return true;
}

export function isSubCategoriesAllChecked(category: TransactionCategory, filterCategoryIds: Record<string, boolean>): boolean {
    if (!category.secondaryCategories || category.secondaryCategories.length < 1) {
        return false;
    }

    for (let i = 0; i < category.secondaryCategories.length; i++) {
        const subCategory = category.secondaryCategories[i];
        if (filterCategoryIds[subCategory.id]) {
            return false;
        }
    }

    return true;
}

export function isSubCategoriesHasButNotAllChecked(category: TransactionCategory, filterCategoryIds: Record<string, boolean>): boolean {
    let checkedCount = 0;

    if (!category.secondaryCategories || category.secondaryCategories.length < 1) {
        return false;
    }

    for (let i = 0; i < category.secondaryCategories.length; i++) {
        const subCategory = category.secondaryCategories[i];
        if (!filterCategoryIds[subCategory.id]) {
            checkedCount++;
        }
    }

    return checkedCount > 0 && checkedCount < category.secondaryCategories.length;
}
