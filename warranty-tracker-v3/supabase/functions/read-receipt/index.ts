/* Reads a receipt with OpenAI and returns the fields the Add form needs.
   The OpenAI key lives only here, as a Supabase secret; the browser never sees it.
   Only signed-in users may call it, so nobody else can spend the credits.

   Secrets:  OPENAI_API_KEY (required), OPENAI_MODEL (optional, default below).
   Deploy:   supabase functions deploy read-receipt --no-verify-jwt
             (the function checks the user itself, which works with the new API keys) */

import { createClient } from 'npm:@supabase/supabase-js@2';

const MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4.1-mini';
const CATEGORIES = ['electronics', 'computers', 'appliances', 'kitchen', 'tools', 'furniture', 'sports', 'other'];
const FIELDS = ['name', 'merchant', 'category', 'price', 'purchased', 'orderNo'];
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
  required: ['isReceipt', 'name', 'merchant', 'category', 'price', 'currency', 'purchased', 'orderNo', 'returnDays', 'flags'],
  properties: {
    isReceipt: { type: 'boolean', description: 'False if the image is not a receipt, invoice or order confirmation.' },
    name: { type: ['string', 'null'], description: 'The item, as a person would say it: brand, product type, model. E.g. "Samsung 55\\" QLED TV QE55Q80D".' },
    merchant: { type: ['string', 'null'], description: 'The shop, by its everyday name (e.g. "MediaMarkt", not "Media-Saturn Deutschland GmbH").' },
    category: { type: 'string', enum: CATEGORIES },
    price: { type: ['number', 'null'], description: 'What was paid for that item, VAT included, as a plain number.' },
    currency: { type: ['string', 'null'], description: 'ISO 4217 code, e.g. EUR.' },
    purchased: { type: ['string', 'null'], description: 'Purchase date as YYYY-MM-DD.' },
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

function instructions(today: string) {
  return [
    'You read shopping receipts for a warranty tracker. Today is ' + today + '.',
    'Extract the one item the owner will want warranty cover for. If there are several, pick the most expensive durable good (not bags, cables, services, delivery or extended-warranty add-ons) and flag the name field saying which other items you saw.',
    'Receipts abbreviate names ("SAMS QE55Q80D 55IN"). Expand them to a readable name when you are confident. When you expanded or guessed, add a flag on name quoting what the receipt says, e.g. "The receipt says “SAMS QE55Q80D 55IN”. We guessed the full name. Check it’s right."',
    'Receipts may be in any language (Slovenian, German, Croatian, Italian…). Dates on European receipts are day first: 03.04.2026 is 3 April 2026.',
    'Prices may use a decimal comma: 1.299,99 means 1299.99.',
    'Use null for anything you cannot read. Never invent an order number or a date.',
    'Flag any field you are unsure of: blurry digits, a date in the future, a price that does not add up, a currency other than EUR.',
    'Write flag notes in plain English, one short sentence, addressed to the owner. No flags when everything is clear.',
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
    return json(JSON.parse(text));
  } catch {
    console.error('Unparseable answer', text);
    return json({ error: 'Could not read the answer' }, 502);
  }
});
