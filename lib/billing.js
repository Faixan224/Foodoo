// Billing model (MVP, manual collection):
// One consolidated monthly bill per restaurant = BASE_BILL_PKR × active branches.
// Invoice generated on the 5th, due by the 10th, prorated for mid-cycle branch adds.
// Keep all billing math here so a payment gateway can plug in later without
// touching the pages.

export const BASE_BILL_PKR = 30000

export function monthlyBillPKR(activeBranchCount) {
  return BASE_BILL_PKR * (activeBranchCount || 0)
}

export function formatPKR(amount) {
  return 'Rs. ' + Number(amount || 0).toLocaleString('en-PK')
}
