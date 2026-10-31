create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('customer', 'owner', 'admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.clothing_status as enum ('Pending', 'Approved', 'Rejected', 'Deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.availability_status as enum ('Available', 'Sold', 'Rented', 'Unavailable');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.clothes (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null, name text not null, category text not null, size text not null,
  brand text not null, condition text not null, description text not null, selling_price numeric(12,2) not null check (selling_price > 0),
  rental_price numeric(12,2) not null check (rental_price > 0), type text not null check (type in ('Sell','Rent','Donate')),
  image_path text not null, image_url text not null, status public.clothing_status not null default 'Pending',
  availability public.availability_status not null default 'Available', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id), owner_id uuid references public.profiles(id), product_id uuid not null references public.clothes(id), amount numeric(12,2) not null, address text not null, phone text not null, status text not null default 'Pending', created_at timestamptz not null default now()
);
create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id), owner_id uuid references public.profiles(id), product_id uuid not null references public.clothes(id), start_date date not null, end_date date not null, rental_price numeric(12,2) not null, deposit numeric(12,2) not null, total_amount numeric(12,2) not null, status text not null default 'Pending', created_at timestamptz not null default now(), check (end_date > start_date)
);
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id) on delete cascade, product_id uuid not null references public.clothes(id) on delete cascade, status text not null default 'Pending', created_at timestamptz not null default now()
);
alter table public.clothes drop constraint if exists clothes_type_check;
alter table public.clothes add constraint clothes_type_check check (type in ('Sell', 'Rent', 'Donate'));

create or replace function public.create_donation_for_clothing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.type = 'Donate' then
    insert into public.donations (customer_id, product_id)
    values (new.customer_id, new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists create_donation_for_clothing on public.clothes;
create trigger create_donation_for_clothing
after insert on public.clothes
for each row execute procedure public.create_donation_for_clothing();

insert into public.donations (customer_id, product_id)
select clothing.customer_id, clothing.id
from public.clothes as clothing
where clothing.type = 'Donate'
  and not exists (
    select 1 from public.donations as donation where donation.product_id = clothing.id
  );
create index if not exists clothes_customer_id_idx on public.clothes(customer_id);
create index if not exists clothes_status_availability_idx on public.clothes(status, availability);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists rentals_customer_id_idx on public.rentals(customer_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, full_name, email, phone, address, city, state, pincode, role) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email, new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'address', new.raw_user_meta_data->>'city', new.raw_user_meta_data->>'state', new.raw_user_meta_data->>'pincode', 'customer'); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.my_role() returns public.user_role language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid(); $$;
alter table public.profiles enable row level security; alter table public.clothes enable row level security; alter table public.orders enable row level security; alter table public.rentals enable row level security; alter table public.donations enable row level security;
drop policy if exists profiles_self on public.profiles;
drop policy if exists profiles_read on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_read on public.profiles for select using (id = auth.uid() or public.my_role() = 'admin');
create policy profiles_update on public.profiles for update using (id = auth.uid() or public.my_role() = 'admin') with check (id = auth.uid() or public.my_role() = 'admin');
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, address, city, state, pincode) on public.profiles to authenticated;
drop policy if exists clothes_read on public.clothes; create policy clothes_read on public.clothes for select using ((status = 'Approved' and availability = 'Available') or customer_id = auth.uid() or owner_id = auth.uid() or public.my_role() in ('owner', 'admin'));
drop policy if exists clothes_customer_insert on public.clothes; create policy clothes_customer_insert on public.clothes for insert with check (customer_id = auth.uid() and public.my_role() = 'customer');
drop policy if exists clothes_owner_or_customer_update on public.clothes; create policy clothes_owner_or_customer_update on public.clothes for update using (customer_id = auth.uid() or public.my_role() in ('owner', 'admin')) with check (customer_id = auth.uid() or public.my_role() in ('owner', 'admin'));
drop policy if exists clothes_delete on public.clothes; create policy clothes_delete on public.clothes for delete using (customer_id = auth.uid() or public.my_role() = 'admin');
revoke insert, update, delete on public.clothes from anon, authenticated;
grant select on public.clothes to anon, authenticated;
grant insert (customer_id, name, category, size, brand, condition, description, selling_price, rental_price, type, image_path, image_url) on public.clothes to authenticated;
grant update (name, category, size, brand, condition, description, selling_price, rental_price, type) on public.clothes to authenticated;
grant delete on public.clothes to authenticated;
drop policy if exists orders_access on public.orders; drop policy if exists orders_select on public.orders; drop policy if exists orders_insert on public.orders; drop policy if exists orders_update on public.orders;
create policy orders_select on public.orders for select using (customer_id = auth.uid() or owner_id = auth.uid() or public.my_role() = 'admin');
create policy orders_insert on public.orders for insert with check (customer_id = auth.uid() and public.my_role() = 'customer');
create policy orders_update on public.orders for update using (owner_id = auth.uid() or public.my_role() = 'admin') with check (owner_id = auth.uid() or public.my_role() = 'admin');
drop policy if exists rentals_access on public.rentals; drop policy if exists rentals_select on public.rentals; drop policy if exists rentals_insert on public.rentals; drop policy if exists rentals_update on public.rentals;
create policy rentals_select on public.rentals for select using (customer_id = auth.uid() or owner_id = auth.uid() or public.my_role() = 'admin');
create policy rentals_insert on public.rentals for insert with check (customer_id = auth.uid() and public.my_role() = 'customer');
create policy rentals_update on public.rentals for update using (owner_id = auth.uid() or public.my_role() = 'admin') with check (owner_id = auth.uid() or public.my_role() = 'admin');
drop policy if exists donations_access on public.donations; drop policy if exists donations_select on public.donations; drop policy if exists donations_insert on public.donations; drop policy if exists donations_update on public.donations;
create policy donations_select on public.donations for select using (customer_id = auth.uid() or public.my_role() in ('owner', 'admin'));
create policy donations_insert on public.donations for insert with check (customer_id = auth.uid() and public.my_role() = 'customer');
create policy donations_update on public.donations for update using (public.my_role() = 'admin') with check (public.my_role() = 'admin');
insert into storage.buckets (id, name, public) values ('clothes', 'clothes', true) on conflict (id) do nothing;
drop policy if exists clothes_storage_insert on storage.objects; create policy clothes_storage_insert on storage.objects for insert to authenticated with check (bucket_id = 'clothes' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists clothes_storage_read on storage.objects; create policy clothes_storage_read on storage.objects for select to public using (bucket_id = 'clothes');
drop policy if exists clothes_storage_delete on storage.objects; create policy clothes_storage_delete on storage.objects for delete to authenticated using (bucket_id = 'clothes' and (storage.foldername(name))[1] = auth.uid()::text);

revoke insert, update on public.orders, public.rentals from anon, authenticated;
grant select on public.orders, public.rentals to authenticated;
grant update (status) on public.orders, public.rentals to authenticated;

create or replace function public.set_clothing_status(p_product_id uuid, p_status public.clothing_status)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or coalesce(public.my_role()::text, '') not in ('owner', 'admin') then
    raise exception 'Only an authorized owner can change product status.' using errcode = '42501';
  end if;
  if p_status not in ('Pending', 'Approved', 'Rejected') then
    raise exception 'Invalid product review status.' using errcode = '22023';
  end if;
  update public.clothes
  set status = p_status,
      availability = case when p_status = 'Approved' and availability <> 'Sold' then 'Available'::public.availability_status else availability end,
      updated_at = now()
  where id = p_product_id;
  if not found then raise exception 'Clothing item was not found.' using errcode = 'P0002'; end if;
  update public.donations set status = p_status where product_id = p_product_id;
end;
$$;
revoke all on function public.set_clothing_status(uuid, public.clothing_status) from public;
grant execute on function public.set_clothing_status(uuid, public.clothing_status) to authenticated;

create or replace function public.update_owner_clothing(
  p_product_id uuid,
  p_selling_price numeric default null,
  p_rental_price numeric default null,
  p_availability public.availability_status default null,
  p_owner_id uuid default null,
  p_set_owner boolean default false
)
returns void language plpgsql security definer set search_path = public as $$
declare
  item public.clothes%rowtype;
begin
  if auth.uid() is null or coalesce(public.my_role()::text, '') not in ('owner', 'admin') then
    raise exception 'Only an authorized owner can update inventory.' using errcode = '42501';
  end if;
  if p_selling_price is not null and p_selling_price <= 0 then raise exception 'Selling price must be positive.' using errcode = '22023'; end if;
  if p_rental_price is not null and p_rental_price <= 0 then raise exception 'Rental price must be positive.' using errcode = '22023'; end if;
  if p_owner_id is not null and p_owner_id <> auth.uid() then raise exception 'Inventory can only be assigned to the signed-in owner.' using errcode = '42501'; end if;
  select * into item from public.clothes where id = p_product_id for update;
  if not found then raise exception 'Clothing item was not found.' using errcode = 'P0002'; end if;
  if p_set_owner and p_owner_id is not null and (item.status <> 'Approved' or item.availability <> 'Available' or item.owner_id is not null) then
    raise exception 'Only unclaimed, approved, available listings can be added to inventory.' using errcode = '42501';
  end if;
  if (not p_set_owner or p_owner_id is null) and item.owner_id is distinct from auth.uid() then
    raise exception 'You can only update or release your own inventory.' using errcode = '42501';
  end if;
  update public.clothes
  set selling_price = coalesce(p_selling_price, selling_price),
      rental_price = coalesce(p_rental_price, rental_price),
      availability = coalesce(p_availability, availability),
      owner_id = case when p_set_owner then p_owner_id else owner_id end,
      updated_at = now()
  where id = p_product_id;
end;
$$;
revoke all on function public.update_owner_clothing(uuid, numeric, numeric, public.availability_status, uuid, boolean) from public;
grant execute on function public.update_owner_clothing(uuid, numeric, numeric, public.availability_status, uuid, boolean) to authenticated;

create or replace function public.create_clothing_order(p_product_id uuid, p_address text, p_phone text)
returns public.orders language plpgsql security definer set search_path = public as $$
declare
  item public.clothes%rowtype;
  result public.orders%rowtype;
begin
  if auth.uid() is null or coalesce(public.my_role()::text, '') <> 'customer' then raise exception 'Only customers can place orders.' using errcode = '42501'; end if;
  if nullif(trim(p_address), '') is null or nullif(trim(p_phone), '') is null then raise exception 'Address and phone are required.' using errcode = '22023'; end if;
  select * into item from public.clothes where id = p_product_id and type = 'Sell' and status = 'Approved' and availability = 'Available' for update;
  if not found then raise exception 'Product is no longer available.' using errcode = 'P0002'; end if;
  insert into public.orders (customer_id, owner_id, product_id, amount, address, phone)
  values (auth.uid(), item.owner_id, item.id, item.selling_price, p_address, p_phone)
  returning * into result;
  update public.clothes set availability = 'Sold', updated_at = now() where id = item.id;
  return result;
end;
$$;
revoke all on function public.create_clothing_order(uuid, text, text) from public;
grant execute on function public.create_clothing_order(uuid, text, text) to authenticated;

create or replace function public.create_clothing_rental(p_product_id uuid, p_start_date date, p_end_date date)
returns public.rentals language plpgsql security definer set search_path = public as $$
declare
  item public.clothes%rowtype;
  result public.rentals%rowtype;
  rental_days integer;
begin
  if auth.uid() is null or coalesce(public.my_role()::text, '') <> 'customer' then raise exception 'Only customers can submit rentals.' using errcode = '42501'; end if;
  if p_start_date is null or p_end_date is null or p_end_date <= p_start_date then raise exception 'Rental end date must follow its start date.' using errcode = '22023'; end if;
  select * into item from public.clothes where id = p_product_id and type = 'Rent' and status = 'Approved' and availability = 'Available' for update;
  if not found then raise exception 'Product is no longer available.' using errcode = 'P0002'; end if;
  rental_days := p_end_date - p_start_date;
  insert into public.rentals (customer_id, owner_id, product_id, start_date, end_date, rental_price, deposit, total_amount)
  values (auth.uid(), item.owner_id, item.id, p_start_date, p_end_date, item.rental_price, item.rental_price * 2, item.rental_price * rental_days + item.rental_price * 2)
  returning * into result;
  update public.clothes set availability = 'Rented', updated_at = now() where id = item.id;
  return result;
end;
$$;
revoke all on function public.create_clothing_rental(uuid, date, date) from public;
grant execute on function public.create_clothing_rental(uuid, date, date) to authenticated;
