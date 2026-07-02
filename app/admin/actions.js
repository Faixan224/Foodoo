'use server'

import { revalidatePath } from 'next/cache'
import { getAdminSupabase } from '../../lib/supabase-admin'
import { requireAdmin } from '../../lib/dal'

function seg() {
  return String(Math.floor(Math.random() * 900) + 100) // 100–999
}

// Issue a one-time onboarding code (super-admin only).
export async function issueCode(prevState, formData) {
  const adminProfile = await requireAdmin() // redirects if not an admin

  const kind = String(formData.get('kind') || 'signup')
  const prefix = String(formData.get('code_prefix') || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
  const restaurantName = String(formData.get('restaurant_name') || '').trim()
  const restaurantId = String(formData.get('restaurant_id') || '').trim()
  const notes = String(formData.get('notes') || '').trim()

  if (!prefix) return { error: 'Code prefix is required (e.g. FUCO).' }
  if (kind === 'signup' && !restaurantName)
    return { error: 'Restaurant name is required for a signup code.' }
  if (kind === 'add_branch' && !restaurantId)
    return { error: 'Restaurant ID is required for an add-branch code.' }

  const admin = getAdminSupabase()

  // Generate a unique code like FUCO-235-245.
  let code
  for (let i = 0; i < 8; i++) {
    const candidate = `${prefix}-${seg()}-${seg()}`
    const { data: exists } = await admin
      .from('onboarding_codes')
      .select('id')
      .eq('code', candidate)
      .maybeSingle()
    if (!exists) {
      code = candidate
      break
    }
  }
  if (!code) return { error: 'Could not generate a unique code — try again.' }

  const { error } = await admin.from('onboarding_codes').insert({
    code,
    kind,
    code_prefix: prefix,
    notes: notes || null,
    restaurant_name: kind === 'signup' ? restaurantName : null,
    restaurant_id: kind === 'add_branch' ? restaurantId : null,
    issued_by: adminProfile.id,
  })
  if (error) return { error: 'Could not save the code: ' + error.message }

  revalidatePath('/admin/codes')
  return { ok: true, code }
}
