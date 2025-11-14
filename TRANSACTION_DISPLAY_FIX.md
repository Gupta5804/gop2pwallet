# Transaction Display Fix - Request Money Feature

## Issue Summary
When a user accepts a money request through the "Request Money" feature, the transaction is being recorded and processed correctly (amount is deducted), but the transaction display in the dashboard shows **incorrect directionality**:

- **Expected behavior**: Shows "Sent to User X ₹Y" (from the approver's perspective)
- **Actual behavior**: Shows "Received from User X ₹Y" (incorrect reverse direction)

## Root Cause Analysis

### How Request Money Works
1. **User A** requests money from **User B** → Creates PENDING transaction with:
   - `SenderUserID = A` (requester)
   - `RecipientUserID = B` (requestee)
   - `Type = "request"`
   - `Status = "pending"`

2. **User B** approves the request → Executes the transfer:
   - Debits User B's wallet
   - Credits User A's wallet
   - **Problem**: Updates only the `Status` to "completed", but does NOT swap the `SenderUserID` and `RecipientUserID`

3. **Frontend Display Logic** in `TransactionList.tsx`:
   - Checks: `isSender = tx.sender_id === currentUser?.id`
   - Since the sender_id still points to User A (the original requester), it displays incorrectly for User B

### The Flow Mismatch
- For **Send Money**: The transaction's sender/recipient match the actual money flow (sender debits, recipient credits)
- For **Request Money (approved)**: The money flow reverses (approver debits, requester credits), but the transaction record still reflects the original pending state

## Solution

**File Modified**: `services/transaction-service/internal/service/transaction_service.go`

**Function**: `ApproveRequest()` - Lines 257-262

**Change**: Before updating the transaction status to "completed", swap the sender and recipient fields to reflect the actual money flow.

```go
// IMPORTANT: We need to update the sender and recipient fields to reflect actual money flow.
// When a request is approved, the money flows FROM the approver (who was the recipient)
// TO the requester (who was the sender in the pending request).
// We swap them so the transaction displays correctly in the user's history.
tx.SenderUserID = senderID      // The person who paid (approver)
tx.RecipientUserID = recipientID // The person who received (requester)
```

### Why This Works
After the swap:
- `tx.SenderUserID` = The approver (person who paid)
- `tx.RecipientUserID` = The requester (person who received money)

Now when the transaction is displayed:
- **For the approver** (User B): `isSender = true` → Shows "Sent to User A ₹Y" ✅
- **For the requester** (User A): `isSender = false` → Shows "Received from User B ₹Y" ✅

## Files Modified
1. **Backend**:
   - `services/transaction-service/internal/service/transaction_service.go` (ApproveRequest function)

2. **No frontend changes needed** - The existing logic is correct; we're fixing the data

## Scope of Fix
This fix applies to:
- ✅ Completed request transactions in the transaction history dashboard
- ✅ Both approver and requester perspectives
- ✅ Only affects completed/approved requests (not pending or rejected)

## Testing Checklist
- [ ] Request money flow: User A requests money from User B
- [ ] User B approves the request
- [ ] Verify wallet balances are correct (User B debited, User A credited)
- [ ] Check User B's transaction history: Should show "Sent to User A ₹X"
- [ ] Check User A's transaction history: Should show "Received from User B ₹X"
- [ ] Verify the transaction type and status are still correct
- [ ] Test with multiple users and amounts
- [ ] Verify rejected requests don't show sender/recipient swap (only completed ones)

## Related Code Sections

### Transaction Model
```go
type Transaction struct {
    SenderUserID    uuid.UUID
    RecipientUserID uuid.UUID
    Type            TransactionType // "send" or "request"
    Status          TransactionStatus // "completed", "pending", "failed", "rejected"
    ...
}
```

### Transaction Types
- `TypeSend`: Direct money transfer initiated by sender
- `TypeRequest`: Money request initiated by requester, approved/rejected by requestee

### Frontend Display Logic
In `TransactionList.tsx`:
```typescript
const isSender = tx.sender_id === currentUser?.id;
// Displays "Sent to" if isSender, "Received from" if !isSender
```

## Additional Notes
- The fix maintains backward compatibility - only affects new completed request transactions
- Pending and rejected requests are unaffected
- The RabbitMQ notification messages will include the correct sender/recipient IDs from the updated transaction record
- No database schema changes needed
