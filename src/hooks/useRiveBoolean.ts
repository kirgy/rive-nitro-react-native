import {
  type ViewModelBooleanProperty,
  type ViewModelInstance,
} from '../specs/ViewModel.nitro';
import type { UseRivePropertyResult } from '../types';
import { useRiveProperty } from './useRiveProperty';
import type { InstancePathsOfKind } from '../core/TypedViewModelInstance';

const getBooleanProperty = (vmi: ViewModelInstance, p: string) =>
  vmi.booleanProperty(p);

/**
 * Hook for interacting with boolean ViewModel instance properties.
 *
 * @param path - The path to the boolean property. With a typed instance, one of its boolean paths.
 * @param viewModelInstance - The ViewModelInstance containing the boolean property to operate on
 * @returns An object with the boolean value, a setter function, and an error if the property is not found
 */
export function useRiveBoolean<I extends ViewModelInstance>(
  path: InstancePathsOfKind<I, 'boolean'>,
  viewModelInstance?: I | null
): UseRivePropertyResult<boolean>;
export function useRiveBoolean(
  path: string,
  viewModelInstance?: ViewModelInstance | null
): UseRivePropertyResult<boolean> {
  const [value, setValue, error] = useRiveProperty<
    ViewModelBooleanProperty,
    boolean
  >(viewModelInstance, path, getBooleanProperty);
  return { value, setValue, error };
}
