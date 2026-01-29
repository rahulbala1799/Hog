# Inventory Purchase Feature - Implementation Guide

## Overview

This feature allows administrators to record inventory purchases directly from the inventory item detail page. When inventory is purchased, it automatically:
1. Updates the inventory stock levels
2. Creates an expense entry in the "Cost of Sale" category
3. Excludes these expenses from the P&L Report (since they're already counted in COGS)

---

## Feature Flow

### User Journey

1. **Navigate to Inventory Page**
   - User goes to `/dashboard/inventory`
   - Views list of inventory items

2. **Open Inventory Item Details**
   - User clicks on an inventory item to view details
   - Item detail modal/page opens showing current stock, cost, etc.

3. **Add Purchase**
   - User clicks "Add Purchase" or "Purchase Inventory" button
   - Purchase modal opens

4. **Fill Purchase Form**
   - **Supplier** (optional): Text field for supplier name
   - **Quantity**: Number input for amount purchased
   - **Total Cost**: Number input for total purchase cost
   - **Per Unit Cost**: Auto-calculated and displayed (Total Cost ÷ Quantity)
   - Shows unit type (e.g., "per piece", "per ml", "per kg")

5. **Save Purchase**
   - Validates quantity > 0 and total cost > 0
   - Updates inventory stock
   - Creates expense record
   - Shows success message
   - Refreshes inventory data

---

## Database Schema

### No New Tables Required

The feature uses existing tables:
- `inventory_items` - Stores inventory stock and cost
- `expenses` - Stores purchase expenses
- `expense_categories` - Must have "Cost of Sale" category

### Data Flow

```
Purchase Action
    ↓
1. Update inventory_items.currentStock (+quantity)
2. Update inventory_items.currentCost (weighted average or new cost)
3. Create expense record:
   - description: inventory_item.name
   - amount: totalCost
   - categoryId: "Cost of Sale" category
   - date: current date
   - notes: "Supplier: {supplier}" (if provided)
```

---

## API Endpoints

### 1. POST `/api/inventory/[id]/purchase`

**Purpose**: Record an inventory purchase and update stock

**Request Body**:
```typescript
{
  quantity: number        // Required: Quantity purchased
  totalCost: number       // Required: Total purchase cost
  supplier?: string       // Optional: Supplier name
}
```

**Response**:
```typescript
{
  success: boolean
  inventoryItem: {
    id: string
    name: string
    currentStock: number
    currentCost: number
    unit: string
  }
  expense: {
    id: string
    description: string
    amount: number
    category: {
      name: string
    }
  }
}
```

**Logic**:
1. Validate inventory item exists
2. Validate quantity > 0 and totalCost > 0
3. Calculate new stock: `currentStock + quantity`
4. Calculate new cost: `(currentStock * currentCost + totalCost) / newStock` (weighted average)
5. Update inventory item
6. Get or find "Cost of Sale" category
7. Create expense record
8. Return updated inventory and expense

**Error Handling**:
- 404: Inventory item not found
- 400: Invalid quantity or cost
- 401: Unauthorized (admin only)
- 500: Server error

---

## UI Components

### 1. Inventory Item Detail Modal/Page

**Location**: `app/dashboard/inventory/page.tsx` or detail modal component

**Add Button**:
```tsx
<button
  onClick={() => setShowPurchaseModal(true)}
  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
>
  <span className="mr-2">+</span>
  Add Purchase
</button>
```

### 2. Purchase Modal Component

**New File**: `app/components/InventoryPurchaseModal.tsx`

**Props**:
```typescript
interface InventoryPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  inventoryItem: {
    id: string
    name: string
    unit: string
    currentStock: number
    currentCost: number
  }
}
```

**Form Fields**:
- **Supplier** (optional): Text input
- **Quantity**: Number input (min: 0.01, step: 0.01 for fractional units)
- **Total Cost**: Number input (min: 0.01, step: 0.01)

**Auto-calculated Display**:
- **Per Unit Cost**: `totalCost / quantity` (displayed in real-time)
- **Unit Label**: Shows unit from inventory item (e.g., "per ml", "per piece")

**Validation**:
- Quantity must be > 0
- Total Cost must be > 0
- Show error messages for invalid inputs

**Submit**:
- Disable button while loading
- Call API endpoint
- Show success message
- Close modal and refresh inventory

---

## Business Logic

### Cost Calculation Strategy

**Option 1: Weighted Average (Recommended)**
```
newCost = (currentStock * currentCost + totalCost) / (currentStock + quantity)
```
- Maintains accurate average cost over time
- Accounts for price fluctuations
- Better for financial reporting

**Option 2: Latest Purchase Price**
```
newCost = totalCost / quantity
```
- Simpler calculation
- Reflects most recent purchase price
- May not reflect true average cost

**Recommendation**: Use **Weighted Average** for accurate COGS calculations.

### Stock Update

```typescript
const newStock = currentStock + quantity
const newCost = (currentStock * currentCost + totalCost) / newStock

await prisma.inventoryItem.update({
  where: { id: itemId },
  data: {
    currentStock: newStock,
    currentCost: newCost,
  },
})
```

### Expense Creation

```typescript
// Get or create "Cost of Sale" category
let costOfSaleCategory = await prisma.expenseCategory.findFirst({
  where: { name: 'Cost of Sale' },
})

if (!costOfSaleCategory) {
  costOfSaleCategory = await prisma.expenseCategory.create({
    data: { name: 'Cost of Sale' },
  })
}

// Create expense
const expense = await prisma.expense.create({
  data: {
    description: inventoryItem.name,
    amount: totalCost,
    categoryId: costOfSaleCategory.id,
    date: new Date(),
    notes: supplier ? `Supplier: ${supplier}` : null,
    createdById: user.id,
  },
})
```

---

## Reports Integration

### P&L Report Updates

**Location**: `app/dashboard/reports/page.tsx`

**Current Behavior**:
- Expenses include ALL categories
- COGS calculated separately from bookings

**Required Change**:
- Filter out "Cost of Sale" category from expenses in P&L calculations
- Keep COGS calculation as-is (based on bookings × cost of sale items)

**Implementation**:

```typescript
// In fetchReportData function

// Get all expenses
const allExpenses = expensesRes.ok ? await expensesRes.json() : []

// Filter out "Cost of Sale" category for P&L
const costOfSaleCategory = await prisma.expenseCategory.findFirst({
  where: { name: 'Cost of Sale' },
})

const expensesForPL = allExpenses.filter(
  (e: any) => e.categoryId !== costOfSaleCategory?.id
)

// Use expensesForPL for P&L calculations
const totalExpenses = expensesForPL.reduce((sum: number, e: any) => sum + e.amount, 0)
const monthExpenses = expensesForPL
  .filter((e: any) => new Date(e.date) >= startOfMonth)
  .reduce((sum: number, e: any) => sum + e.amount, 0)

// COGS remains unchanged (calculated from bookings)
const totalCostOfSale = costOfSaleByItem.reduce(...)
```

**Why This Works**:
- Inventory purchases are recorded as "Cost of Sale" expenses
- These are already counted in COGS (when inventory is consumed by bookings)
- Including them in expenses would double-count them in P&L
- Filtering them out gives accurate profit calculation

---

## Edge Cases & Considerations

### 1. Fractional Units
- Support decimal quantities (e.g., 42.5 ml)
- Use `Float` type for quantity
- Validate step based on unit type

### 2. Zero Stock Initial Purchase
- If `currentStock = 0`, new cost = `totalCost / quantity`
- Avoid division by zero

### 3. Cost of Sale Category Missing
- Auto-create if doesn't exist
- Or show error and guide user to create it

### 4. Multiple Purchases Same Day
- All valid - each creates separate expense
- Stock accumulates correctly
- Cost averages properly

### 5. Negative Stock Prevention
- Purchases can only add stock (quantity > 0)
- Stock adjustments handled separately

### 6. Permission Check
- Only ADMIN can add purchases
- STAFF cannot access this feature

---

## File Structure

```
app/
├── api/
│   └── inventory/
│       └── [id]/
│           └── purchase/
│               └── route.ts          # New: Purchase endpoint
├── components/
│   └── InventoryPurchaseModal.tsx    # New: Purchase modal
└── dashboard/
    └── inventory/
        └── page.tsx                  # Update: Add purchase button

scripts/
└── (no changes needed)
```

---

## Implementation Checklist

### Phase 1: Backend
- [ ] Create `POST /api/inventory/[id]/purchase` endpoint
- [ ] Implement weighted average cost calculation
- [ ] Create expense record with "Cost of Sale" category
- [ ] Add validation and error handling
- [ ] Test with various scenarios (zero stock, fractional units, etc.)

### Phase 2: Frontend - Modal
- [ ] Create `InventoryPurchaseModal` component
- [ ] Add form fields (supplier, quantity, total cost)
- [ ] Implement per-unit cost calculation display
- [ ] Add form validation
- [ ] Add loading states and error handling
- [ ] Style to match existing UI

### Phase 3: Frontend - Integration
- [ ] Add "Add Purchase" button to inventory detail view
- [ ] Wire up modal open/close
- [ ] Refresh inventory data after purchase
- [ ] Show success notifications

### Phase 4: Reports Update
- [ ] Update P&L report to exclude "Cost of Sale" expenses
- [ ] Verify COGS calculation remains accurate
- [ ] Test profit calculations
- [ ] Update expense reports if needed (show all expenses, but filter in P&L)

### Phase 5: Testing
- [ ] Test purchase flow end-to-end
- [ ] Verify stock updates correctly
- [ ] Verify expense creation
- [ ] Verify P&L calculations
- [ ] Test edge cases (zero stock, fractional units)
- [ ] Test permission restrictions

---

## Example API Request/Response

### Request
```http
POST /api/inventory/abc123/purchase
Content-Type: application/json
Cookie: user_id=xyz; session_token=token

{
  "quantity": 100,
  "totalCost": 5000,
  "supplier": "ABC Supplies"
}
```

### Response
```json
{
  "success": true,
  "inventoryItem": {
    "id": "abc123",
    "name": "Acrylic Paint",
    "currentStock": 150,
    "currentCost": 50.33,
    "unit": "ml"
  },
  "expense": {
    "id": "exp456",
    "description": "Acrylic Paint",
    "amount": 5000,
    "category": {
      "name": "Cost of Sale"
    },
    "date": "2026-01-30T10:00:00Z"
  }
}
```

---

## Testing Scenarios

### Scenario 1: First Purchase (Zero Stock)
- **Initial**: Stock = 0, Cost = 0
- **Purchase**: 100 units @ ₹5000
- **Result**: Stock = 100, Cost = ₹50/unit

### Scenario 2: Additional Purchase (Existing Stock)
- **Initial**: Stock = 100, Cost = ₹50/unit
- **Purchase**: 50 units @ ₹3000
- **Result**: Stock = 150, Cost = ₹53.33/unit (weighted average)

### Scenario 3: Fractional Units
- **Initial**: Stock = 42.5 ml, Cost = ₹10/ml
- **Purchase**: 25.75 ml @ ₹300
- **Result**: Stock = 68.25 ml, Cost = ₹11.70/ml

### Scenario 4: P&L Verification
- **Purchase**: 100 units @ ₹5000 (creates "Cost of Sale" expense)
- **Booking**: 10 people consume 5 units each = 50 units
- **COGS**: 50 units × ₹50 = ₹2500
- **Expenses (P&L)**: Should NOT include ₹5000 (already in COGS)
- **Profit**: Revenue - COGS - Other Expenses (excluding Cost of Sale)

---

## Future Enhancements

1. **Purchase History**
   - View all purchases for an inventory item
   - Track supplier performance
   - Price trend analysis

2. **Supplier Management**
   - Dedicated supplier table
   - Supplier contact information
   - Purchase history by supplier

3. **Purchase Orders**
   - Create purchase orders before receiving
   - Track pending orders
   - Match receipts to orders

4. **Bulk Import**
   - Import purchases from CSV
   - Batch processing
   - Validation and error reporting

---

## Notes

- **Cost of Sale vs Expenses**: The key distinction is that inventory purchases are "Cost of Sale" because they become part of COGS when consumed. Regular expenses (rent, marketing, etc.) are separate operational costs.

- **Weighted Average**: This method ensures that if you buy inventory at different prices over time, the cost reflects the true average, not just the latest price.

- **Double-Counting Prevention**: By excluding "Cost of Sale" from P&L expenses, we prevent counting inventory costs twice (once in COGS, once in expenses).

---

## Questions & Answers

**Q: What if "Cost of Sale" category doesn't exist?**
A: The API should auto-create it, or check and create it during the purchase process.

**Q: Can staff users add purchases?**
A: No, only ADMIN users should have this permission. Add role check in API endpoint.

**Q: What about inventory adjustments (not purchases)?**
A: Keep existing adjustment functionality separate. This feature is specifically for purchases that create expenses.

**Q: Should we track purchase date separately?**
A: The expense date serves as the purchase date. If needed, can add `purchasedAt` field to inventory items later.

**Q: How to handle returns/refunds?**
A: Create negative purchase (quantity < 0) or separate adjustment feature. For now, use existing stock adjustment.

---

## Summary

This feature streamlines inventory management by:
1. ✅ Allowing direct purchase recording from inventory page
2. ✅ Automatically updating stock and cost
3. ✅ Creating expense records for accounting
4. ✅ Preventing double-counting in P&L reports
5. ✅ Maintaining accurate COGS calculations

The implementation is straightforward and leverages existing database structure with minimal changes required.
