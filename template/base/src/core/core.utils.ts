import * as bcrypt from 'bcrypt';
import { plural } from 'pluralize';
import { v1 as uuidv1 } from 'uuid';

const saltOrRounds = 10;

export async function generateHash(text: string): Promise<string> {
  return await bcrypt.hash(text, saltOrRounds);
}

export async function compareHash(
  text: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(text, hash);
}

export const uuid = (): string => uuidv1();

export const otp = (length = 6): string =>
  !!process.env.OTP_TEST_MODE
    ? Array(length)
        .fill(null)
        .map((e, i) => i + 1)
        .join('')
    : `${Math.floor(
        Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
      )}`;

export const randomString = (length = 10): string =>
  Math.random()
    .toString(36)
    .substring(2, length + 2);

export const snakeCase = (str: string): string =>
  str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();

export const isPrimaryInstance = (): boolean =>
  typeof process.env.NODE_APP_INSTANCE === 'undefined' ||
  process.env.NODE_APP_INSTANCE === '0';

export const pluralizeString = (str: string): string => plural(str);

export const addDays = (days: number) => {
  return new Date().setDate(new Date().getDate() + days) || undefined;
};
