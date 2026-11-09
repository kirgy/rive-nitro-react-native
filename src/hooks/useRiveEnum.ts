import {
  type ViewModelEnumProperty,
  type ViewModelInstance,
} from '../specs/ViewModel.nitro';
import type { UseRivePropertyResult } from '../types';
import type {
  InstanceEnumValuesAt,
  InstancePathsOfKind,
} from '../core/TypedViewModelInstance';
import { useRiveProperty } from './useRiveProperty';

const getEnumProperty = (vmi: ViewModelInstance, p: string) =>
  vmi.enumProperty(p);

/**
 * Hook for interacting with enum ViewModel instance properties.
 *
 * @param path - The path to the enum property. With a typed instance, one of its enum paths.
 * @param viewModelInstance - The ViewModelInstance containing the enum property to operate on
 * @returns An object with the enum value, a setter function, and an error if the property is not found.
 * With a typed instance, the value and setter are narrowed to the enum's values.
 */
export function useRiveEnum<
  I extends ViewModelInstance,
  P extends InstancePathsOfKind<I, 'enum'>,
>(
  path: P,
  viewModelInstance?: I | null
): UseRivePropertyResult<InstanceEnumValuesAt<I, P>>;
export function useRiveEnum(
  path: string,
  viewModelInstance?: ViewModelInstance | null
): UseRivePropertyResult<string> {
  const [value, setValue, error] = useRiveProperty<
    ViewModelEnumProperty,
    string
  >(viewModelInstance, path, getEnumProperty);
  return { value, setValue, error };
}
