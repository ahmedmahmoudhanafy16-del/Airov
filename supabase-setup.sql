-- ============================================================
-- AIROV Supabase Setup — Run in SQL Editor (one time)
-- ============================================================

-- PRODUCTS
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    price numeric not null,
    original_price numeric,
    description text,
    category text default 'general',
    image text,
    images text[] default '{}',
    sizes text[] default '{S,M,L,XL,XXL}',
    colors jsonb default '[]',
    stock jsonb default '{}',
    badges text[] default '{}',
    sales_count integer default 0,
    created_at timestamptz default now()
);
alter table products enable row level security;
create policy "Public read" on products for select using (true);
create policy "Admin insert" on products for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on products for update using (auth.role() = 'authenticated');
create policy "Admin delete" on products for delete using (auth.role() = 'authenticated');

-- ORDERS
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    order_number text unique not null,
    customer_name text,
    customer_email text,
    customer_phone text,
    address text,
    governorate text,
    items jsonb not null default '[]',
    subtotal numeric default 0,
    shipping numeric default 60,
    discount numeric default 0,
    total numeric default 0,
    payment_method text default 'cod',
    coupon_code text,
    status text default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled')),
    notes text,
    created_at timestamptz default now()
);
alter table orders enable row level security;
create policy "Anyone insert order" on orders for insert with check (true);
create policy "Admin read orders" on orders for select using (auth.role() = 'authenticated');
create policy "Admin update orders" on orders for update using (auth.role() = 'authenticated');

-- COUPONS
create table if not exists coupon_codes (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    type text not null check (type in ('percentage','fixed')),
    value numeric not null,
    expires_at timestamptz,
    is_active boolean default true,
    usage_count integer default 0,
    created_at timestamptz default now()
);
alter table coupon_codes enable row level security;
create policy "Public read coupons" on coupon_codes for select using (is_active = true);
create policy "Admin manage coupons" on coupon_codes for all using (auth.role() = 'authenticated');

-- ENABLE REALTIME
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table orders;
