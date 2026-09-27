import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL   = Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'
const FROM_NAME    = 'השולחן הפתוח'
const SITE_URL     = Deno.env.get('SITE_URL') ?? 'https://hashulchan.co.il'

function baseHtml(content: string) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; background: #FDF8F0; margin: 0; padding: 20px; }
    .wrap { max-width: 520px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #C8840A, #7A2034); color: white; padding: 28px 24px; border-radius: 14px 14px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; }
    .header p  { margin: 6px 0 0; opacity: 0.85; font-size: 13px; }
    .body { background: white; padding: 28px 24px; border-radius: 0 0 14px 14px; border: 1px solid #e8d8c0; border-top: none; }
    .box  { background: #FDF8F0; border: 1px solid #e8d8c0; border-radius: 10px; padding: 16px; margin: 16px 0; }
    .box h2 { color: #C8840A; margin: 0 0 8px; font-size: 18px; }
    .box p  { margin: 4px 0; color: #5a4535; font-size: 14px; }
    .btn  { display: inline-block; background: #C8840A; color: white !important; padding: 11px 26px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; }
    .warn { background: #FFF8E8; border: 1px solid #f0d080; border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #8a6000; margin: 14px 0; }
    .footer { text-align: center; margin-top: 18px; font-size: 11px; color: #aaa; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div style="font-size:32px;margin-bottom:6px">🕯️</div>
      <h1>השולחן הפתוח</h1>
      <p>פלטפורמה לאירוח ארוחות שישי וחגים</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>השולחן הפתוח — מחבר מארחים ואורחים ברחבי ישראל</p>
      <p>האירוח הוא בין אנשים פרטיים ועל אחריותם בלבד.</p>
    </div>
  </div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const resend = new Resend(RESEND_API_KEY)

    const { type, registration_id } = await req.json()
    if (!registration_id) throw new Error('registration_id required')

    // Fetch registration with all related data
    const { data: reg, error: regErr } = await supabase
      .from('event_registrations')
      .select(`
        *,
        guest:profiles!guest_id(id, display_name),
        event:events!event_id(
          id, title, event_date, event_time, city,
          address, address_notes, host_id,
          host:profiles!host_id(id, display_name, phone)
        )
      `)
      .eq('id', registration_id)
      .single()

    if (regErr || !reg) throw new Error('Registration not found')

    const event = reg.event as any
    const guest = reg.guest as any
    const host  = event?.host as any
    if (!event || !guest || !host) throw new Error('Missing data')

    // Get emails from auth
    const { data: guestAuth } = await supabase.auth.admin.getUserById(guest.id)
    const { data: hostAuth  } = await supabase.auth.admin.getUserById(host.id)
    const guestEmail = guestAuth?.user?.email
    const hostEmail  = hostAuth?.user?.email

    // ── GUEST APPROVED ──────────────────────────────────────────────
    if (type === 'guest_approved' && guestEmail) {
      const dateStr = new Date(event.event_date + 'T00:00:00').toLocaleDateString('he-IL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })

      const html = baseHtml(`
        <h2 style="color:#1A0F07;font-size:20px;margin-bottom:6px">🎉 ברכות! הבקשה שלך אושרה</h2>
        <p style="color:#5a4535">המארח <strong>${host.display_name}</strong> אישר את השתתפותך:</p>
        <div class="box">
          <h2>${event.title}</h2>
          <p>📅 ${dateStr}</p>
          <p>⏰ ${String(event.event_time).slice(0, 5)}</p>
          <p>📍 ${event.address}${event.address_notes ? ' — ' + event.address_notes : ''}</p>
          ${host.phone ? `<p>📞 טלפון המארח: <strong>${host.phone}</strong></p>` : ''}
        </div>
        <div class="warn">
          ⚠️ האירוח הוא בין אנשים פרטיים. הפלטפורמה אינה אחראית לנזקים כלשהם.
        </div>
        <p style="color:#5a4535;margin-bottom:20px">נשמח שתדרג את הארוחה לאחר הביקור. פגישה נעימה! 🍽️</p>
        <div style="text-align:center">
          <a href="${SITE_URL}/my-bookings" class="btn">לפרטי ההזמנה שלי</a>
        </div>
      `)

      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: guestEmail,
        replyTo: 'saar0246@gmail.com',
        subject: `✅ אושרת לארוחה: ${event.title}`,
        html,
      })

      await supabase.from('notifications').insert({
        user_id: guest.id,
        type: 'request_approved',
        title: 'הבקשה שלך אושרה!',
        message: `${host.display_name} אישר אותך לארוחה "${event.title}". פרטי הכתובת נשלחו במייל.`,
        data: { event_id: event.id, registration_id },
      })
    }

    // ── GUEST REJECTED ───────────────────────────────────────────────
    if (type === 'guest_rejected' && guestEmail) {
      const html = baseHtml(`
        <h2 style="color:#1A0F07;font-size:20px;margin-bottom:6px">הבקשה לא אושרה הפעם</h2>
        <p style="color:#5a4535">המארח <strong>${host.display_name}</strong> לא אישר את בקשתך לארוחה <strong>"${event.title}"</strong>.</p>
        <p style="color:#5a4535;margin-bottom:20px">אל תתייאש! ישנן עוד הרבה ארוחות מחכות לך בפלטפורמה. 🍽️</p>
        <div style="text-align:center">
          <a href="${SITE_URL}/home" class="btn">גלה ארוחות נוספות</a>
        </div>
      `)

      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: guestEmail,
        replyTo: 'saar0246@gmail.com',
        subject: `הבקשה ל"${event.title}" לא אושרה`,
        html,
      })

      await supabase.from('notifications').insert({
        user_id: guest.id,
        type: 'request_rejected',
        title: 'הבקשה לא אושרה',
        message: `הבקשה שלך לארוחה "${event.title}" לא אושרה. אפשר לנסות ארוחות אחרות.`,
        data: { event_id: event.id },
      })
    }

    // ── NEW GUEST REQUEST (notify host) ──────────────────────────────
    if (type === 'new_guest_request' && hostEmail) {
      const html = baseHtml(`
        <h2 style="color:#1A0F07;font-size:20px;margin-bottom:6px">🙋 אורח חדש רוצה להגיע!</h2>
        <p style="color:#5a4535"><strong>${guest.display_name}</strong> ביקש להשתתף בארוחה שלך:</p>
        <div class="box">
          <h2>${event.title}</h2>
          <p>יש לך אורח שמחכה לאישורך.</p>
        </div>
        <div style="text-align:center;margin-top:20px">
          <a href="${SITE_URL}/my-events" class="btn">אשר או דחה את הבקשה</a>
        </div>
      `)

      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: hostEmail,
        replyTo: 'saar0246@gmail.com',
        subject: `🙋 ${guest.display_name} רוצה לבוא לארוחה שלך`,
        html,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
