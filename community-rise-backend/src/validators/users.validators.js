import { z } from 'zod';

export const preferencesSchema = z.strictObject({
  teaching_updates: z.boolean({ error: 'Teaching updates must be true or false' }),
});
