# Security Specification: Pangling Hairstudio Firestore Security

## 1. Data Invariants
- **Branches, Services, and Barbers** are readable by public clients to populate booking menus, but can only be modified/created/deleted by authenticated administrators.
- **Bookings**:
  - Customers can create new bookings with initial status strictly `confirmed` and valid format timestamps/booking codes.
  - Customers can read single booking documents by direct ID or query for their own booking code.
  - Bookings cannot be maliciously updated or hijacked by unauthenticated users; only authenticated Admins can update booking statuses (confirmed -> completed, cancelled, no-show).
  - Admin roles are determined by existence in `/admins/{uid}` or matching the configured store owner email `barberpangling@gmail.com`.
- **Admins Collection**:
  - Only existing admins can read or write to `/admins/{adminId}`.

## 2. The "Dirty Dozen" Threat Payloads & Guard Invariants
1. Unauthenticated client attempts to overwrite branch operational hours or change prices (`/branches/slawi` or `/services/keratin`).
2. Unauthenticated user attempts to delete a barber profile (`DELETE /barbers/fitron`).
3. Customer attempts to create a booking with `status: 'completed'` instead of `confirmed`.
4. Attacker attempts to inject malicious script or payload exceeding maxLength in `customerName` (>100 chars) or `notes` (>500 chars).
5. Attacker attempts to update an existing customer's phone number or barber assignment after booking.
6. Attacker attempts to create an admin document directly at `/admins/attacker_uid`.
7. Client attempts to insert arbitrary shadow fields like `isAdmin: true` into booking.
8. Attacker attempts path traversal or invalid characters in document IDs (`/branches/../../evil`).
9. Unauthenticated client attempts to wipe or batch-delete bookings.
10. Attacker attempts to mark another customer's booking as cancelled without being an admin.
11. Attacker attempts to forge booking with invalid booking code format (not matching `PLS-XXXXXX`).
12. Attacker attempts to read all customer bookings in bulk without admin credentials.

## 3. Security Rule Verification
Security rules strictly enforce:
- Public read-only on master tables (`branches`, `services`, `barbers`).
- Validated create-only on `bookings` with regex validation on `bookingCode`, valid date/time syntax, and status locking.
- Admin-only updates and deletions.
- Default deny for all other paths.
