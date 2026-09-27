import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!
const FROM_EMAIL = Deno.env.get('BREVO_FROM_EMAIL') ?? 'noreply@hashulchan.co.il'
const FROM_NAME = Deno.env.get('BREVO_FROM_NAME') ?? 'השולחן הפתוח'

async function sendEmail(to: string, toName: string, subject: string, htmlContent: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('Brevo error:', err)
    throw new Error('Email send failed: ' + err)
  }
}

const baseStyle = `
  font-family: Heebo, Arial, sans-serif;
  direction: rtl;
  max-width: 520px;
  margin: 0 auto;
  background: #FDF8F0;
  border-radius: 16px;
  overflow: hidden;
`

const headerHtml = `
  <div style="background: linear-gradient(135deg, #C8840A, #7A2034); padding: 32px 24px; text-align: center;">
    <div style="font-size: 36px; margin-bottom: 8px;">🕯️</div>
    <h1 style="color: white; font-size: 22px; font-weight: 900; margin: 0;">השולחן הפתוח</h1>
  </div>
`

const footerHtml = `
  <div style="background: #1A0F07; color: #8a7060; font-size: 12px; text-align: center; padding: 16px;">
    <p style="margin: 0;">השולחן הפתוח — פלטפורמה לחיבור מארחים ואורחים</p>
    <p style="margin: 4px 0 0;">האירוח הוא בין שני אנשים פרטיים ועל אחריותם.</p>
  </div>
`

function wrapEmail(content: string) {
  return `<div style="${baseStyle}">${headerHtml}<div style="padding: 24px;">${content}</div>${footerHtml}</div>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { type, registration_id } = await req.json()

    if (!registration_id) throw new Error('registration_id required')

    // Fetch registration with event and guest and host
    const { data: reg, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        guest:profiles!guest_id (id, display_name, email:id),
        event:events!event_id (
          id, title, event_date, event_time, city, neighborhood,
          address, address_notes,
          host:profiles!host_id (id, display_name, phone)
        )
      `)
      .eq('id', registration_id)
      .single()

    if (regError || !reg) throw new Error('Registration not found')

    const event = reg.event
    const guest = reg.guest
    const host = event?.host

    if (!event || !guest || !host) throw new Error('Missing data')

    // Get emails from auth.users via service role
    const { data: guestAuth } = await supabase.auth.admin.getUserById(guest.id)
    const { data: hostAuth } = await supabase.auth.admin.getUserById(host.id)

    const guestEmail = guestAuth?.user?.email
    const hostEmail = hostAuth?.user?.email

    if (type === 'guest_approved' && guestEmail) {
      const dateStr = new Date(event.event_date + 'T00:00:00').toLocaleDateString('he-IL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })

      const content = `
        <h2 style="color: #1A0F07; font-size: 20px; margin-bottom: 8px;">🎉 ברכות! הבקשה שלך אושרה</h2>
        <p style="color: #5a4535; margin-bottom: 20px;">המארח <strong>${host.display_name}</strong> אישר את השתתפותך ב:</p>

        <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e8d8c0; margin-bottom: 20px;">
          <h3 style="color: #C8840A; margin: 0 0 8px;">${event.title}</h3>
          <p style="color: #5a4535; margin: 4px 0;">📅 ${dateStr}</p>
          <p style="color: #5a4535; margin: 4px 0;">⏰ ${event.event_time.slice(0, 5)}</p>
          <p style="color: #5a4535; margin: 4px 0;">📍 ${event.address}${event.address_notes ? ' — ' + event.address_notes : ''}</p>
          ${host.phone ? `<p style="color: #5a4535; margin: 4px 0;">📞 טלפון המארח: <strong>${host.phone}</strong></p>` : ''}
        </div>

        <div style="background: #FFF8E8; border-radius: 12px; padding: 12px; border: 1px solid #f0d080; margin-bottom: 16px;">
          <p style="color: #8a6000; font-size: 12px; margin: 0;">
            ⚠️ תזכורת: האירוח הוא בין אנשים פרטיים. הפלטפורמה אינה אחראית לנזקים כלשהם.
          </p>
        </div>

        <p style="color: #5a4535;">נשמח שתדרג את הארוחה לאחר הביקור. פגישה נעימה!</p>
      `

      await sendEmail(guestEmail, guest.display_name, `✅ אושרת לארוחה: ${event.title}`, wrapEmail(content))

      // Notify in-app
      await supabase.from('notifications').insert({
        user_id: guest.id,
        type: 'request_approved',
        title: 'הבקשה שלך אושרה!',
        message: `${host.display_name} אישר אותך לארוחה "${event.title}". פרטי הכתובת נשלחו במייל.`,
        data: { event_id: event.id, registration_id },
      })
    }

    if (type === 'guest_rejected' && guestEmail) {
      const content = `
        <h2 style="color: #1A0F07; font-size: 20px; margin-bottom: 8px;">הבקשה לא אושרה הפעם</h2>
        <p style="color: #5a4535; margin-bottom: 16px;">המארח <strong>${host.display_name}</strong> לא אישר את בקשתך לארוחה "<strong>${event.title}</strong>".</p>
        <p style="color: #5a4535; margin-bottom: 16px;">אל תתייאש! ישנן עוד הרבה ארוחות מחכות לך בפלטפורמה.</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${Deno.env.get('SITE_URL') ?? 'https://hashulchan.co.il'}/home"
             style="background: #C8840A; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold;">
            גלה ארוחות נוספות
          </a>
        </div>
      `
      await sendEmail(guestEmail, guest.display_name, `הבקשה ל"${event.title}" לא אושרה`, wrapEmail(content))

      await supabase.from('notifications').insert({
        user_id: guest.id,
        type: 'request_rejected',
        title: 'הבקשה לא אושרה',
        message: `הבקשה שלך לארוחה "${event.title}" לא אושרה. אפשר לנסות ארוחות אחרות.`,
        data: { event_id: event.id },
      })
    }

    if (type === 'new_guest_request' && hostEmail) {
      const content = `
        <h2 style="color: #1A0F07; font-size: 20px; margin-bottom: 8px;">🙋 אורח חדש רוצה להגיע!</h2>
        <p style="color: #5a4535; margin-bottom: 20px;"><strong>${guest.display_name}</strong> ביקש להשתתף בארוחה שלך:</p>

        <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e8d8c0; margin-bottom: 20px;">
          <h3 style="color: #C8840A; margin: 0 0 8px;">${event.title}</h3>
          <p style="color: #5a4535; margin: 0;">יש לך אורח שמחכה לאישורך.</p>
        </div>

        <div style="text-align: center; margin-top: 16px;">
          <a href="${Deno.env.get('SITE_URL') ?? 'https://hashulchan.co.il'}/my-events"
             style="background: #C8840A; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold;">
            אשר או דחה את הבקשה
          </a>
        </div>
      `
      await sendEmail(hostEmail, host.display_name, `🙋 ${guest.display_name} רוצה לבוא לארוחה שלך`, wrapEmail(content))

      await supabase.from('notifications').insert({
        user_id: host.id,
        type: 'new_guest_request',
        title: 'אורח חדש מחכה לאישור',
        message: `${guest.display_name} ביקש להשתתף בארוחה "${event.title}".`,
        data: { event_id: event.id, registration_id, guest_id: guest.id },
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
