# Viraj Jewellery Admin Management

This update adds:
- `/admin` dashboard
- `/admin/products` product publishing/editing
- `/admin/categories` category management
- `/admin/rates` owner-only Gold & Silver rate management
- Supabase Storage product image upload support
- Secure `admin_roles` database model

## Before testing
1. Run `supabase/admin_management.sql` in Supabase SQL Editor.
2. In the final commented SQL section, assign the owner's Supabase Auth user id the `owner` role.
3. Make sure your `.env` contains the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Run `npm run dev`.

## Important
The product editor stores weight and metal/purity and does not ask you to enter a fixed gold selling price. It currently writes `price: 0` because your customer-facing product pages are still using the old static `src/data/products.js`. The next integration step should replace that static catalogue with Supabase products + live metal-rate pricing.

Do not put a Supabase service-role key in the browser `.env`.
