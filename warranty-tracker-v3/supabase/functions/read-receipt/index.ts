/* Reads a receipt with OpenAI and returns the fields the Add form needs.
   The OpenAI key lives only here, as a Supabase secret; the browser never sees it.
   Only signed-in users may call it, so nobody else can spend the credits.

   Secrets:  OPENAI_API_KEY (required), OPENAI_MODEL (optional, default below).
   Deploy:   supabase functions deploy read-receipt --no-verify-jwt
             (the function checks the user itself, which works with the new API keys) */

import { createClient } from 'npm:@supabase/supabase-js@2';

const MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4.1-mini';
const CATEGORIES = ['electronics', 'computers', 'appliances', 'kitchen', 'tools', 'furniture', 'sports', 'other'];
const FIELDS = ['merchant', 'purchased', 'orderNo'];
const MAX_BYTES = 8 * 1024 * 1024;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/* Structured output: OpenAI must answer in exactly this shape. */
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['isReceipt', 'items', 'merchant', 'currency', 'dateText', 'purchased', 'orderNo', 'returnDays', 'flags'],
  properties: {
    isReceipt: { type: 'boolean', description: 'False if the image is not a receipt, invoice or order confirmation.' },
    items: {
      type: 'array',
      description: 'Every product line on the receipt, in printed order.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'category', 'price', 'keep', 'note'],
        properties: {
          name: { type: 'string', description: 'As a person would say it: brand, product type, model. E.g. "Samsung 55\\" QLED TV QE55Q80D".' },
          category: { type: 'string', enum: CATEGORIES },
          price: { type: ['number', 'null'], description: 'What was paid for this line, VAT and line discounts included, as a plain number.' },
          keep: { type: 'boolean', description: 'True for goods worth tracking a warranty for; false for bags, deposits, delivery, services, gift cards, consumables and extended-warranty add-ons.' },
          note: { type: ['string', 'null'], description: 'One short sentence for the owner when this line needs checking; otherwise null.' },
        },
      },
    },
    merchant: { type: ['string', 'null'], description: 'The shop, by its everyday name (e.g. "MediaMarkt", not "Media-Saturn Deutschland GmbH").' },
    currency: { type: ['string', 'null'], description: 'ISO 4217 code, e.g. EUR.' },
    dateText: { type: ['string', 'null'], description: 'The purchase date exactly as printed, e.g. "28.09.2026" or "28 SEP 26".' },
    purchased: { type: ['string', 'null'], description: 'Purchase date as YYYY-MM-DD, day first unless the receipt is clearly American.' },
    orderNo: { type: ['string', 'null'], description: 'Order, invoice or receipt number, exactly as printed.' },
    returnDays: { type: ['integer', 'null'], description: 'Only if the receipt prints a return period in days; otherwise null.' },
    flags: {
      type: 'array',
      description: 'Fields the user should check, with one short sentence each.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['field', 'note'],
        properties: {
          field: { type: 'string', enum: FIELDS },
          note: { type: 'string' },
        },
      },
    },
  },
};

/* Dates are parsed here, not trusted to the model: day first, as printed on European receipts.
   Returns YYYY-MM-DD, or null when the text holds no whole, real date. */
function parseDate(text: string | null): string | null {
  const m = /(\d{1,4})\s*[.\/-]\s*(\d{1,2})\s*[.\/-]\s*(\d{2,4})/.exec(text || '');
  if (!m) return null;
  let [a, b, c] = [m[1], m[2], m[3]].map(Number);
  let y: number, mo: number, d: number;
  if (m[1].length === 4) [y, mo, d] = [a, b, c];
  else {
    [d, mo, y] = [a, b, c];
    if (mo > 12 && d <= 12) [d, mo] = [mo, d]; // an American receipt
    if (m[3].length === 2) y += 2000;
  }
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

/* Settle the date in code: what's printed wins over the model's reading, and only code says "future". */
function settleDate(r: Record<string, any>, today: string) {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const date = parseDate(r.dateText) || (iso.test(r.purchased || '') ? r.purchased : null);
  r.flags = (r.flags || []).filter((f: any) => !(f.field === 'purchased' && /future|after today|not yet/i.test(f.note)));
  r.purchased = date;
  if (date && date > today) {
    r.purchased = null;
    r.flags.push({ field: 'purchased', note: 'The receipt date reads as ' + (r.dateText || date) + ', which is after today. Check it’s right.' });
  }
  return r;
}

function instructions(today: string) {
  return [
    'You read shopping receipts for a warranty tracker. Today is ' + today + '.',
    'List every product line on the receipt as its own item. Set keep to false for lines nobody tracks a warranty for: bags, deposits, delivery, services, gift cards, consumables, extended-warranty add-ons.',
    'A line with a quantity above 1 stays one item: give the line total as the price and say the quantity in its note.',
    'Receipts abbreviate names ("SAMS QE55Q80D 55IN"). Expand them to a readable name when you are confident. When you expanded or guessed, set the item note quoting what the receipt says, e.g. "The receipt says “SAMS QE55Q80D 55IN”. We guessed the full name. Check it’s right."',
    'Receipts may be in any language (Slovenian, German, Croatian, Italian…). Dates on European receipts are day first: 03.04.2026 is 3 April 2026.',
    'Prices may use a decimal comma: 1.299,99 means 1299.99.',
    'Use null for anything you cannot read. Never invent an order number or a date.',
    'Your training data is older than today, so dates up to ' + today + ' are real and in the past. Do not judge whether a date is in the future; the app checks that.',
    'Flag a shared field (shop, date, order number) you are unsure of, and use an item note for an unsure name or price: blurry digits, a price that does not add up, a currency other than EUR.',
    'Write flags and notes in plain English, one short sentence, addressed to the owner. None when everything is clear.',
  ].join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  /* Signed-in users only. */
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth?.user) return json({ error: 'Not signed in' }, 401);

  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) return json({ error: 'OPENAI_API_KEY is not set' }, 500);

  let body: { file?: string; fileName?: string; today?: string };
  try { body = await req.json(); } catch { return json({ error: 'Bad request' }, 400); }
  const file = body.file || '';
  const m = /^data:(image\/(?:jpeg|png|webp|gif)|application\/pdf);base64,/.exec(file);
  if (!m) return json({ error: 'Send a JPEG, PNG, WebP or PDF as a data URL' }, 400);
  if (file.length * 0.75 > MAX_BYTES) return json({ error: 'File too large' }, 413);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(body.today || '') ? body.today! : new Date().toISOString().slice(0, 10);

  const attachment = m[1] === 'application/pdf'
    ? { type: 'file', file: { filename: body.fileName || 'receipt.pdf', file_data: file } }
    : { type: 'image_url', image_url: { url: file, detail: 'high' } };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: instructions(today) },
        { role: 'user', content: [{ type: 'text', text: 'Read this receipt.' }, attachment] },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'receipt', strict: true, schema: SCHEMA } },
    }),
  });

  if (!res.ok) {
    console.error('OpenAI', res.status, await res.text());
    return json({ error: 'The reader is unavailable' }, 502);
  }
  const out = await res.json();
  const text = out.choices?.[0]?.message?.content;
  try {
    return json(settleDate(JSON.parse(text), today));
  } catch {
    console.error('Unparseable answer', text);
    return json({ error: 'Could not read the answer' }, 502);
  }
});
