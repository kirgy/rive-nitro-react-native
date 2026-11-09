/**
 * tsd pins for the schema-aware data-binding hooks (`yarn typetest`).
 *
 * Every `useRive*` hook takes its valid paths from the instance: a typed
 * instance narrows `path` to the schema's paths of that kind, an untyped one
 * accepts any string. Where the compiler reports a wrong path (on the path,
 * not the hook) is pinned in scripts/__tests__/typed-hooks-diagnostics.test.ts.
 */
import {
  expectType,
  expectError,
  expectNotDeprecated,
  expectAssignable,
} from 'tsd';
import type { RiveFileSource } from '../core/TypedRiveFile';
import type {
  TypedViewModelInstance,
  TypedViewModelOf,
  UntypedViewModelInstance,
} from '../core/TypedViewModelInstance';
import type { ViewModelInstance } from '../specs/ViewModel.nitro';
import type {
  UseRivePropertyResult,
  UseRiveListResult,
  UseRiveTriggerResult,
} from '../types';
import {
  useRiveBoolean,
  useRiveColor,
  useRiveEnum,
  useRiveList,
  useRiveNumber,
  useRiveString,
  useRiveTrigger,
  useViewModelInstance,
  type RiveViewRef,
} from '../index';
import type { UseRiveColorResult } from '../hooks/useRiveColor';
import blinkoRiv from '../../example/assets/rive/blinko.riv';
import rewardsRiv from '../../example/assets/rive/rewards.riv';

declare const storeVM: TypedViewModelOf<typeof blinkoRiv, 'storeVM'>;
declare const storeItemVM: TypedViewModelOf<typeof blinkoRiv, 'StoreItemVM'>;
declare const rewardsVM: TypedViewModelOf<typeof rewardsRiv, 'Rewards'>;
declare const untypedInstance: UntypedViewModelInstance;
declare const plainInstance: ViewModelInstance | null | undefined;
declare const anyInstance: any;

// ============================================================
// Typed instance → paths of the hook's kind only
// ============================================================

expectType<UseRivePropertyResult<boolean>>(
  useRiveBoolean('storeOpen', storeVM)
);
expectError(useRiveBoolean('multiplierValue', storeVM)); // a number
expectError(useRiveBoolean('storeOpn', storeVM));

expectType<UseRivePropertyResult<string>>(
  useRiveString('description', storeItemVM)
);
expectError(useRiveString('cost', storeItemVM));

expectType<UseRiveColorResult>(useRiveColor('Color', rewardsVM));
expectError(useRiveColor('Height', rewardsVM));

expectType<UseRiveTriggerResult>(useRiveTrigger('xbuttonClick', storeVM));
expectType<UseRiveTriggerResult>(
  useRiveTrigger('property of pegVM/blink', storeVM, { onTrigger: () => {} })
);
expectError(useRiveTrigger('storeOpen', storeVM));

expectType<UseRiveListResult>(useRiveList('items', storeVM));
expectError(useRiveList('storeOpen', storeVM));

// Enum value and setter narrow to the enum's values
expectType<UseRivePropertyResult<'Coin' | 'Gem'>>(
  useRiveEnum('Item_Selection/Item_Selection', rewardsVM)
);
expectError(useRiveEnum('Price_Value', rewardsVM));

// A nullable typed instance (as returned while loading) keeps its paths
declare const loadingVM: typeof storeVM | null | undefined;
expectType<UseRivePropertyResult<boolean>>(
  useRiveBoolean('storeOpen', loadingVM)
);
expectError(useRiveBoolean('storeOpn', loadingVM));

// ============================================================
// Untyped instances keep accepting any string (backward compat)
// ============================================================

expectType<UseRivePropertyResult<boolean>>(
  useRiveBoolean('any', untypedInstance)
);
expectType<UseRivePropertyResult<boolean>>(
  useRiveBoolean('any', plainInstance)
);
expectType<UseRivePropertyResult<boolean>>(useRiveBoolean('any', anyInstance));
expectType<UseRivePropertyResult<boolean>>(useRiveBoolean('any', null));
expectType<UseRivePropertyResult<boolean>>(useRiveBoolean('any'));
expectType<UseRivePropertyResult<string>>(useRiveEnum('any', plainInstance));
expectType<UseRiveTriggerResult>(useRiveTrigger('any', plainInstance));
expectType<UseRiveListResult>(useRiveList('any', plainInstance));
declare const dynamicPath: string;
expectType<UseRivePropertyResult<number>>(
  useRiveNumber(dynamicPath, plainInstance)
);

// ============================================================
// useViewModelInstance(RiveViewRef, { asset, viewModelName })
// ============================================================

declare const ref: RiveViewRef;
declare const nullableRef: RiveViewRef | null | undefined;
type BlinkoSchema =
  typeof blinkoRiv extends RiveFileSource<infer T> ? T : never;

{
  const { instance } = useViewModelInstance(nullableRef, {
    async: true,
    asset: blinkoRiv,
    viewModelName: 'storeVM',
  });
  expectType<
    TypedViewModelInstance<BlinkoSchema, 'storeVM'> | null | undefined
  >(instance);
  // The typed instance flows into the hooks
  expectType<UseRivePropertyResult<boolean>>(
    useRiveBoolean('storeOpen', instance)
  );
  expectError(useRiveBoolean('storeOpn', instance));
}

// required narrows out null, like the file overloads
{
  const { instance } = useViewModelInstance(ref, {
    async: true,
    required: true,
    asset: blinkoRiv,
    viewModelName: 'storeVM',
  });
  expectType<TypedViewModelInstance<BlinkoSchema, 'storeVM'> | undefined>(
    instance
  );
}

expectNotDeprecated(
  useViewModelInstance(ref, {
    async: true,
    asset: blinkoRiv,
    viewModelName: 'storeVM',
  })
);

// Unknown ViewModel name
expectError(
  useViewModelInstance(ref, {
    async: true,
    asset: blinkoRiv,
    viewModelName: 'NotAViewModel',
  })
);

// viewModelName is required with asset (the schema can't tell which
// ViewModel the view's artboard is bound to)
expectError(useViewModelInstance(ref, { async: true, asset: blinkoRiv }));

// Assets without a generated schema can't type the instance
declare const plainAsset: number;
declare const anyAsset: any;
expectError(
  useViewModelInstance(ref, {
    async: true,
    asset: plainAsset,
    viewModelName: 'storeVM',
  })
);
expectError(
  useViewModelInstance(ref, {
    async: true,
    asset: anyAsset,
    viewModelName: 'storeVM',
  })
);

// Without asset the view ref still returns an untyped instance
{
  const { instance } = useViewModelInstance(ref, { async: true });
  expectAssignable<ViewModelInstance | null | undefined>(instance);
  expectType<UseRivePropertyResult<boolean>>(useRiveBoolean('any', instance));
}
