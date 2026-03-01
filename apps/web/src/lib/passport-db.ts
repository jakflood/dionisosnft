import { PassportSchema, type Passport } from '@dionisos/shared';

export type PassportRow = {
  id: string;
  tag_id: string;
  standard: 'ERC721' | 'ERC1155' | null;
  chain_id: number | null;
  contract_address: string | null;
  token_id: string | null;

  producer: string;
  label: string;
  vintage: number | null;
  region: string | null;
  country: string | null;
  size_ml: number;
  lot: string | null;
  notes: string | null;

  custody: 'in_hand' | 'in_storage' | 'redeemed' | 'disputed';

  front_image_url: string | null;
  back_image_url: string | null;
  capsule_image_url: string | null;

  created_at: string;
  updated_at: string;
};

/**
 * Convert DB row -> shared Passport schema.
 *
 * This keeps all “shape decisions” in one place and makes the API route and
 * pages stable.
 */
export function passportFromRow(row: PassportRow): Passport | null {
  const token =
    row.standard && row.chain_id !== null && row.contract_address && row.token_id !== null
      ? {
          chainId: row.chain_id,
          contract: row.contract_address,
          tokenId: row.token_id,
          standard: row.standard,
        }
      : undefined;

  const parsed = PassportSchema.safeParse({
    id: row.id,
    tagId: row.tag_id,
    token,
    bottle: {
      producer: row.producer,
      label: row.label,
      vintage: row.vintage,
      region: row.region,
      country: row.country,
      sizeMl: row.size_ml,
      lot: row.lot,
      notes: row.notes,
    },
    media: {
      frontImageUrl: row.front_image_url,
      backImageUrl: row.back_image_url,
      capsuleImageUrl: row.capsule_image_url,
    },
    custody: row.custody,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  if (!parsed.success) {
    console.error('[passport] invalid passport row', parsed.error.flatten());
    return null;
  }
  return parsed.data;
}
