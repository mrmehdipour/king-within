// King Within — Supabase "Send SMS Hook" backed by SMS.ir (Iran).
//
// Supabase generates, stores, and verifies the OTP itself and creates the
// session — this function's ONLY job is to DELIVER the code via SMS.ir when the
// client calls supabase.auth.signInWithOtp({ phone }). That keeps the whole phone
// flow native (signInWithOtp / verifyOtp) while using an Iran-deliverable sender.
//
// Setup (Supabase dashboard):
//   1. Authentication → Providers → Phone: enable. (You can leave the built-in
//      Twilio/etc. fields blank — the hook overrides delivery.)
//   2. Authentication → Hooks → "Send SMS hook": enable, point it at this
//      function's URL, and copy the generated secret.
//   3. Edge Function secrets:
//        supabase secrets set SEND_SMS_HOOK_SECRET=v1,whsec_...   (from step 2)
//        supabase secrets set SMS_IR_API_KEY=...                  (SMS.ir panel)
//        supabase secrets set SMS_IR_TEMPLATE_ID=123456           (approved OTP template)
//        # optional: SMS_IR_PARAM=CODE  (must match the {parameter} in your template)
//   4. Deploy:  supabase functions deploy sms-send-hook --no-verify-jwt
//
// SMS.ir Verify API: POST https://api.sms.ir/v1/send/verify

const SIGNING_REQUIRED = true

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
function bytesToB64(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes)
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s)
}

// Standard Webhooks verification (the scheme Supabase auth hooks use).
async function verify(secret: string, headers: Headers, body: string): Promise<boolean> {
  const id = headers.get('webhook-id')
  const ts = headers.get('webhook-signature') ? headers.get('webhook-timestamp') : null
  const sigHeader = headers.get('webhook-signature')
  if (!id || !ts || !sigHeader) return false

  const key = secret.replace(/^v1,/, '').replace(/^whsec_/, '')
  const cryptoKey = await crypto.subtle.importKey(
    'raw', b64ToBytes(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const signed = `${id}.${ts}.${body}`
  const mac = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signed))
  const expected = bytesToB64(mac)
  // header looks like "v1,<sig> v1,<sig2>" — accept if any matches
  return sigHeader.split(' ').some((p) => p.split(',')[1] === expected)
}

// E.164 / 98… → Iran local 09xxxxxxxxx that SMS.ir expects.
function toLocalIran(phone: string): string {
  let p = String(phone).replace(/[^\d]/g, '')
  if (p.startsWith('98')) p = '0' + p.slice(2)
  if (!p.startsWith('0')) p = '0' + p
  return p
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })

  const raw = await req.text()
  const secret = Deno.env.get('SEND_SMS_HOOK_SECRET')
  if (SIGNING_REQUIRED) {
    if (!secret) return json({ error: 'hook secret not configured' }, 500)
    const okSig = await verify(secret, req.headers, raw).catch(() => false)
    if (!okSig) return json({ error: 'invalid signature' }, 401)
  }

  let payload: any
  try { payload = JSON.parse(raw) } catch { return json({ error: 'bad payload' }, 400) }

  const phone = payload?.user?.phone ?? payload?.phone
  const otp = payload?.sms?.otp ?? payload?.otp
  if (!phone || !otp) return json({ error: 'missing phone or otp' }, 400)

  const apiKey = Deno.env.get('SMS_IR_API_KEY')
  const templateId = Number(Deno.env.get('SMS_IR_TEMPLATE_ID'))
  const param = Deno.env.get('SMS_IR_PARAM') ?? 'CODE'
  if (!apiKey || !templateId) return json({ error: 'SMS.ir not configured' }, 500)

  const res = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({
      mobile: toLocalIran(phone),
      templateId,
      parameters: [{ name: param, value: String(otp) }],
    }),
  })
  const detail = await res.text()
  if (!res.ok) {
    console.error('SMS.ir error', res.status, detail)
    return json({ error: 'sms_send_failed', detail }, 502)
  }
  return json({}) // Supabase treats 200 as "delivered"
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}
