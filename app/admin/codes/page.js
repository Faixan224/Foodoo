import { requireAdmin } from '../../../lib/dal'
import { getAdminSupabase } from '../../../lib/supabase-admin'
import IssueCodeForm from './IssueCodeForm'

export const dynamic = 'force-dynamic'

export default async function CodesPage() {
  await requireAdmin()
  const admin = getAdminSupabase()
  const { data: codes } = await admin
    .from('onboarding_codes')
    .select('code, kind, status, restaurant_name, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <style>{`
        .c-head { font-size: 24px; font-weight: 800; color: #1A1A1A; }
        .c-sub { font-size: 14px; color: #999; margin-top: 4px; margin-bottom: 26px; }
        .c-grid { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: start; }
        @media (max-width: 900px) { .c-grid { grid-template-columns: 1fr; } }
        .c-table { background: #fff; border: 1px solid #EEE; border-radius: 14px; overflow: hidden; }
        .c-tr { display: grid; grid-template-columns: 1.3fr 1fr 0.9fr; gap: 8px; padding: 13px 16px; border-bottom: 1px solid #F2F2F2; font-size: 13px; align-items: center; }
        .c-tr:last-child { border-bottom: none; }
        .c-th { background: #FAFAFA; font-weight: 700; color: #888; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; }
        .c-code { font-weight: 800; color: #1A1A1A; letter-spacing: 1px; }
        .c-rest { color: #666; }
        .pill { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; display: inline-block; }
        .pill.unused { background: #E8F5E9; color: #2E7D32; }
        .pill.used { background: #F3F3F3; color: #999; }
        .pill.revoked { background: #FDECEA; color: #C0392B; }
        .c-empty { padding: 28px 16px; text-align: center; color: #BBB; font-size: 13px; }
      `}</style>

      <div className="c-head">Onboarding codes</div>
      <div className="c-sub">Issue a code, then share it with the restaurant owner.</div>

      <div className="c-grid">
        <IssueCodeForm />

        <div className="c-table">
          <div className="c-tr c-th">
            <div>Code</div>
            <div>Restaurant</div>
            <div>Status</div>
          </div>
          {codes && codes.length > 0 ? (
            codes.map((c) => (
              <div className="c-tr" key={c.code}>
                <div className="c-code">{c.code}</div>
                <div className="c-rest">{c.restaurant_name || (c.kind === 'add_branch' ? 'Add branch' : '—')}</div>
                <div>
                  <span className={'pill ' + c.status}>{c.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="c-empty">No codes yet — issue your first one.</div>
          )}
        </div>
      </div>
    </div>
  )
}
