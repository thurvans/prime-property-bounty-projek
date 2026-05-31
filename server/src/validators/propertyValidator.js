import { z } from 'zod';
import { normalizeText } from '../utils/formatters.js';

export const directionOptions = ['Utara', 'Selatan', 'Timur', 'Barat'];
export const typeOptions = ['Ruko', 'Villa'];
export const statusOptions = ['in_stock', 'sold_out'];
export const readyOptions = ['siap_huni', 'siap_kosong', 'siap_huni_renovasi'];

const decimalMax = (places) => (value) => {
  const [, decimals = ''] = String(value).split('.');
  return decimals.length <= places;
};

const stringOrNull = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    const normalized = normalizeText(value);
    return normalized.length ? normalized : null;
  });

export const propertySchema = z.object({
  nama_property: z.string().trim().min(3).max(100).transform(normalizeText),
  group: stringOrNull,
  lebar: z.coerce.number().positive().refine(decimalMax(2), 'Maksimal 2 desimal.'),
  panjang: z.coerce.number().positive().refine(decimalMax(2), 'Maksimal 2 desimal.'),
  hadap: z.array(z.enum(directionOptions)).min(1),
  tipe: z.enum(typeOptions),
  tingkat: z.coerce.number().min(1).max(10).refine(decimalMax(1), 'Maksimal 1 desimal.'),
  price: z.coerce.number().int().positive(),
  carport: z.coerce.boolean(),
  status: z.enum(statusOptions),
  siap: z.enum(readyOptions),
  maps_link: z
    .string()
    .trim()
    .url()
    .refine((value) => value.includes('google.com/maps'), 'Link harus dari google.com/maps.'),
  kawasan: z.array(z.string().trim().min(1).transform(normalizeText)).min(1),
  unit: stringOrNull,
  highlighted: z.coerce.boolean().optional().default(false)
});

export function parsePropertyPayload(body) {
  const parsed = propertySchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors
    };
  }

  return { ok: true, data: parsed.data };
}
