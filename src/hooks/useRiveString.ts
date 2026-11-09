import {
  type ViewModelInstance,
  type ViewModelStringProperty,
} from '../specs/ViewModel.nitro';
import type { UseRivePropertyResult } from '../types';
import { useRiveProperty } from './useRiveProperty';
import type { InstancePathsOfKind } from '../core/TypedViewModelInstance';

const getStringProperty = (vmi: ViewModelInstance, p: string) =>
  vmi.stringProperty(p);

/**
 * Hook for interacting with string ViewModel instance properties.
 *
 * @param path - The path to the string property. With a typed instance, one of its string paths.
 * @param viewModelInstance - The ViewModelInstance containing the string property to operate on
 * @returns An object with the number value, a setter function, and an error if the property is not found
 */
export function useRiveString<I extends ViewModelInstance>(
  path: InstancePathsOfKind<I, 'string'>,
  viewModelInstance?: I | null
): UseRivePropertyResult<string>;
export function useRiveString(
  path: string,
  viewModelInstance?: ViewModelInstance | null
): UseRivePropertyResult<string> {
  const [value, setValue, error] = useRiveProperty<
    ViewModelStringProperty,
    string
  >(viewModelInstance, path, getStringProperty);
  return { value, setValue, error };
}
