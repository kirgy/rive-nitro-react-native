import {
  type ViewModelInstance,
  type ViewModelNumberProperty,
} from '../specs/ViewModel.nitro';
import type { UseRivePropertyResult } from '../types';
import { useRiveProperty } from './useRiveProperty';
import type { InstancePathsOfKind } from '../core/TypedViewModelInstance';

const getNumberProperty = (vmi: ViewModelInstance, p: string) =>
  vmi.numberProperty(p);

/**
 * Hook for interacting with number ViewModel instance properties.
 *
 * @param path - The path to the number property. With a typed instance, one of its number paths.
 * @param viewModelInstance - The ViewModelInstance containing the number property to operate on
 * @returns An object with the number value, a setter function, and an error if the property is not found
 */
export function useRiveNumber<I extends ViewModelInstance>(
  path: InstancePathsOfKind<I, 'number'>,
  viewModelInstance?: I | null
): UseRivePropertyResult<number>;
export function useRiveNumber(
  path: string,
  viewModelInstance?: ViewModelInstance | null
): UseRivePropertyResult<number> {
  const [value, setValue, error] = useRiveProperty<
    ViewModelNumberProperty,
    number
  >(viewModelInstance, path, getNumberProperty);
  return { value, setValue, error };
}
