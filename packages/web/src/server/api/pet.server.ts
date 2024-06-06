'use server';

import { json } from '@solidjs/router';
import * as v from 'valibot';

import { getRequestUser } from '~/server/auth/request-user';
import { petCreate } from '~/server/db/queries/petCreate';
import { petUpdate } from '~/server/db/queries/petUpdate';
import { userPets } from '~/server/db/queries/userPets';
import { getDictionary } from '~/server/i18n/dict';
import { translateErrorTokens, type ErrorKeys } from '~/server/utils';

import { getUserPets } from './pet';

export const getUserPetsServer = async () => {
  const currentUser = await getRequestUser();
  const pets = await userPets(currentUser.userId);
  return pets;
};

export const createPetServer = async (formData: FormData) => {
  const currentUser = await getRequestUser();
  try {
    const pet = await petCreate(
      {
        name: formData.get('name'),
        type: formData.get('type'),
        gender: formData.get('gender'),
      },
      currentUser.userId,
    );
    return json({ pet }, { revalidate: [getUserPets.key] });
  } catch (error) {
    if (v.isValiError(error)) {
      return json(
        { failed: true, errors: await translateErrorTokens(error) },
        { status: 500, revalidate: [] },
      );
    } else {
      console.error(error);
      return json(
        { failed: true, errors: null },
        { status: 500, revalidate: [] },
      );
    }
  }
};

const PetUpdateSchema = v.object({
  petId: v.pipe(v.string(), v.transform(Number), v.integer()),
  breed: v.optional(
    v.pipe(
      v.string(),
      v.trim(),
      v.minLength(2, 'createPet.breed' satisfies ErrorKeys),
    ),
  ),
  weight: v.optional(
    v.pipe(
      v.string(),
      v.transform(Number),
      v.number('weight.range' satisfies ErrorKeys),
    ),
  ),
  birthDate: v.optional(
    v.object({
      bday: v.nullish(
        v.pipe(
          v.unknown(),
          v.transform(Number),
          v.number('bday' satisfies ErrorKeys),
          v.minValue(1, 'bday' satisfies ErrorKeys),
          v.maxValue(31, 'bday' satisfies ErrorKeys),
        ),
        1,
      ),
      bmonth: v.nullish(
        v.pipe(
          v.unknown(),
          v.transform(Number),
          v.number('bmonth' satisfies ErrorKeys),
          v.minValue(0, 'bmonth' satisfies ErrorKeys),
          v.maxValue(new Date().getFullYear(), 'bmonth' satisfies ErrorKeys),
        ),
        0,
      ),
      byear: v.pipe(
        v.unknown(),
        v.transform(Number),
        v.number('byear' satisfies ErrorKeys),
        v.minValue(1980, 'byear' satisfies ErrorKeys),
        v.maxValue(new Date().getFullYear(), 'byear' satisfies ErrorKeys),
      ),
    }),
  ),
});

export const updatePetBirthDateServer = async (formData: FormData) => {
  try {
    const { petId, birthDate } = v.parse(PetUpdateSchema, {
      petId: formData.get('petId'),
      birthDate: {
        bday: formData.get('bday'),
        bmonth: formData.get('bmonth'),
        byear: formData.get('byear'),
      },
    });
    const dateOfBirth = new Date(
      Date.UTC(birthDate!.byear, birthDate!.bmonth, birthDate!.bday),
    );
    if (
      dateOfBirth.getDate() !== birthDate!.bday ||
      dateOfBirth.getMonth() !== birthDate!.bmonth
    ) {
      const dict = await getDictionary('errors');
      return json(
        { failed: true, errors: { bday: dict['bday'] } },
        { status: 422, revalidate: [] },
      );
    }
    const currentUser = await getRequestUser();
    const pet = await petUpdate(
      {
        dateOfBirth,
      },
      petId,
      currentUser.userId,
    );
    return json(
      { pet, failed: false, errors: null },
      { revalidate: [getUserPets.key] },
    );
  } catch (error) {
    if (v.isValiError(error)) {
      return json(
        { failed: true, errors: await translateErrorTokens(error) },
        { status: 422, revalidate: [] },
      );
    } else {
      console.error(error);
    }
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
};

export const updatePetWeightServer = async (formData: FormData) => {
  try {
    const { weight } = v.parse(PetUpdateSchema, {
      weight: formData.get('weight'),
    });
    const petId = Number(formData.get('petId'));
    if (Number.isNaN(petId)) {
      throw new Error('petId is not provided');
    }
    const currentUser = await getRequestUser();
    const pet = await petUpdate(
      {
        weight,
      },
      petId,
      currentUser.userId,
    );
    return json(
      { pet, failed: false, errors: null },
      { revalidate: [getUserPets.key] },
    );
  } catch (error) {
    if (v.isValiError(error)) {
      return json(
        { failed: true, errors: await translateErrorTokens(error) },
        { status: 422, revalidate: [] },
      );
    } else {
      console.error(error);
    }
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
};

export const updatePetBreedServer = async (formData: FormData) => {
  try {
    const { petId, breed } = v.parse(PetUpdateSchema, {
      petId: formData.get('petId'),
      breed: formData.get('breed'),
    });
    const currentUser = await getRequestUser();
    const pet = await petUpdate(
      {
        breed,
      },
      petId,
      currentUser.userId,
    );
    return json(
      { pet, failed: false, errors: null },
      { revalidate: [getUserPets.key] },
    );
  } catch (error) {
    if (v.isValiError(error)) {
      return json(
        { failed: true, errors: await translateErrorTokens(error) },
        { status: 422, revalidate: [] },
      );
    } else {
      return json(
        { failed: true, errors: null },
        { status: 500, revalidate: [] },
      );
    }
  }
};
