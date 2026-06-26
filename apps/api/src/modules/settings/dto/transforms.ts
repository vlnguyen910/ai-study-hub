import type { TransformFnParams } from 'class-transformer';

export const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export const uppercaseString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export const uppercaseStringArray = ({ value }: TransformFnParams): unknown =>
  Array.isArray(value)
    ? value.map((item) =>
        typeof item === 'string' ? item.trim().toUpperCase() : item,
      )
    : value;

export const normalizeFileExtension = ({
  value,
}: TransformFnParams): unknown =>
  typeof value === 'string'
    ? value.trim().replace(/^\.+/, '').toUpperCase()
    : value;
