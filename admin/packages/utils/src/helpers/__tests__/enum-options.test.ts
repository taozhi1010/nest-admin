import { describe, expect, it } from 'vitest';

import { optionsToEnum } from '../enum-options';

describe('optionsToEnum Test', () => {
  it('should return an enum object', () => {
    const genderOptions = [
      { label: '男', value: 1, enumName: 'GENDER_MALE' },
      { label: '女', value: 2, enumName: 'GENDER_FEMALE' },
    ] as const;

    const enumTest = optionsToEnum(genderOptions);
    const male = enumTest.GENDER_MALE;
    const female = enumTest.GENDER_FEMALE;

    expect(male).toBe(1);
    expect(female).toBe(2);
  });
});
