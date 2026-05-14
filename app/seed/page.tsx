'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { guestStore } from '@/lib/store'

const MDA_FRIENDS = [
  'שיר טוביאנה','עומרי אביב','אושר נעים','טל פלקס','ליאב יעקובי','עדן יעקובי',
  'תום מילשטיין','עדי מילשטיין','גבי מומקו','טל ליודמירסקי','עדי לוגסי','אופק לוגסי',
  'אלה סחראי','דורון מיכלל','נועם און','יאיר אשטוקר','עידו עוזרי','מילי לבנוב',
  'יובל שטמן','שקד איאסו','רותי בן זקן','ירין גזית','יונתן עוזרי','איגור ארטל',
  'איציק אמזלג','נחום דוד','חיים לוין','חיים קרדי','שרון טמיס','חן אסייס',
  'ארליך מיכאל','דיקשטיין אנטול','יפה','עדן','יונתן','איתן לסרי','אלי אדרי',
  'אושרית חדד','אייל גרשי','איליה שפירה','איציק פאר','איציק אלבז','אליהו שוקרון',
  'אלכס לם','אשר ארביב','שחר אדרי','טטרו בן','בני פוקס','ברוך אביתן','אלון גרינבר',
  'דן בן ישי','דנה סמואל','אבזה דני','חגי כהן','טוני גאו','עמוס גאו','טליה שמעוני',
  'יואל קהאן','נתנאל אשטוקר','יובל סיהו אשטוקר','יניב טייר','יעקב פרלוב','ירין בניטה',
  'ישראל לוגסי','לואיז רבינוביץ','בועז שץ','סלבה לנדמן','טל פולוביץ׳','יובל אליאס',
  'מזל בוסקילה','מיתר זמיר','אדם גוסטבו','פולק רועי','מתן פרידמן','דור פרידמן',
  'נועה שחם','נויה פרץ','אסתי כהן','רחלי איקר כהן','כספי עומר','עינב הראל',
  'לירון ביטון','צביקה','רונן שונם','רואי בר אור','קופרשטיין שמואל',
]

export default function SeedPage() {
  const router = useRouter()
  const [done, setDone] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const existing = new Set(guestStore.getAll().map(g => g.name))
    let added = 0
    MDA_FRIENDS.forEach(name => {
      if (!existing.has(name)) {
        guestStore.create({
          name, phone: '', whatsapp: '', side: 'GROOM', group: 'FRIENDS',
          rsvpStatus: 'PENDING', invitationSent: false,
          invitationAcknowledged: false, attendanceConfirmed: false,
        })
        added++
      }
    })
    setCount(added)
    setDone(true)
    setTimeout(() => router.push('/guests'), 1800)
  }, [router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: '1rem', textAlign: 'center' }}>
      {done ? (
        <>
          <div style={{ fontSize: 48 }}>✅</div>
          <h2 style={{ fontWeight: 700 }}>יובאו {count} מוזמנים</h2>
          <p style={{ color: 'var(--gray-muted)', fontSize: '0.9rem' }}>מעביר לדף מוזמנים…</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48 }}>⏳</div>
          <h2 style={{ fontWeight: 700 }}>מטמיע מוזמנים…</h2>
        </>
      )}
    </div>
  )
}
