create table public.admin (
  admin_id integer not null,
  password character varying not null,
  balance double precision null,
  constraint admin_pkey primary key (admin_id)
) TABLESPACE pg_default;

create table public.author (
  author_id integer not null,
  author_name character varying not null,
  total_books integer null,
  constraint author_pkey primary key (author_id)
) TABLESPACE pg_default;

create table public.publisher (
  publisher_id integer not null,
  publisher_name character varying not null,
  phone_no character varying null,
  balance double precision default 0.0, -- New: Tracks the balance of the publisher
  constraint publisher_pkey primary key (publisher_id)
) TABLESPACE pg_default;

-- Table to track orders placed by admin to publishers
create table public.publisher_order (
  publisher_order_id integer not null,
  admin_id integer not null,
  publisher_id integer not null,
  order_date date not null,
  total_amount numeric not null,
  --status character varying not null, -- e.g., 'pending', 'completed', 'cancelled'
  constraint publisher_order_pkey primary key (publisher_order_id),
  constraint publisher_order_admin_id_fkey foreign key (admin_id) references admin (admin_id),
  constraint publisher_order_publisher_id_fkey foreign key (publisher_id) references publisher (publisher_id)
) TABLESPACE pg_default;

-- Table to detail items within a publisher order
create table public.publisher_order_item (
  publisher_order_item_id integer not null,
  publisher_order_id integer not null,
  book_id integer not null,
  quantity integer not null,
  price_per_unit numeric not null,
  constraint publisher_order_item_pkey primary key (publisher_order_item_id),
  constraint publisher_order_item_publisher_order_id_fkey foreign key (publisher_order_id) references publisher_order (publisher_order_id) on delete cascade,
  constraint publisher_order_item_book_id_fkey foreign key (book_id) references book (book_id)
) TABLESPACE pg_default;

create table public.customer (
  customer_id integer generated always as identity not null,
  password character varying not null,
  customer_name character varying not null,
  phone_no character varying not null,
  address character varying not null,
  email character varying null,
  constraint customer_pkey primary key (customer_id),
  constraint unique_customer_email unique (email)
) TABLESPACE pg_default;

create table public.category (
  category_id integer not null,
  category_name character varying not null,
  description character varying null,
  constraint category_pkey primary key (category_id)
) TABLESPACE pg_default;

create table public.book (
  book_id integer not null,
  title character varying not null,
  description character varying null,
  cover_image_url character varying null,
  author_id integer null,
  publisher_id integer null,
  price numeric not null,
  constraint book_pkey primary key (book_id),
  constraint book_author_id_fkey foreign KEY (author_id) references author (author_id),
  constraint book_publisher_id_fkey foreign KEY (publisher_id) references publisher (publisher_id),
  constraint book_author_id_fkey foreign KEY (author_id) references author (author_id)
) TABLESPACE pg_default;

create table public.bookcategory (
  book_id integer not null,
  category_id integer not null,
  constraint bookcategory_pkey primary key (book_id, category_id),
  constraint bookcategory_category_id_fkey foreign KEY (category_id) references category (category_id)
) TABLESPACE pg_default;

create table public.cart (
  cart_id integer not null,
  customer_id integer null,
  created_at date null,
  constraint cart_pkey primary key (cart_id),
  constraint cart_customer_id_fkey foreign KEY (customer_id) references customer (customer_id)
) TABLESPACE pg_default;

create table public.cartitem (
  cartitem_id integer not null,
  cart_id integer null,
  book_id integer null,
  quantity integer not null,
  per_item_price numeric not null,
  constraint cartitem_pkey primary key (cartitem_id),
  constraint cartitem_cart_id_fkey foreign KEY (cart_id) references cart (cart_id) on delete CASCADE,
  constraint cartitem_book_id_fkey foreign KEY (book_id) references book (book_id) on delete CASCADE
) TABLESPACE pg_default;

create table public.giftcard (
  card_id character varying not null,
  customer_id integer null,
  amount numeric not null,
  constraint giftcard_pkey primary key (card_id),
  constraint giftcard_customer_id_fkey foreign KEY (customer_id) references customer (customer_id)
) TABLESPACE pg_default;

create table public.inventory (
  book_id integer not null,
  quantity integer not null,
  constraint inventory_pkey primary key (book_id),
  constraint inventory_book_id_fkey foreign KEY (book_id) references book (book_id) on delete CASCADE
) TABLESPACE pg_default;

create table public.orders (
  order_id integer not null,
  customer_id integer null,
  cart_id integer null,
  date date null,
  subtotal_price double precision null,
  discount double precision null,
  total_price double precision null,
  use_points boolean null,
  constraint orders_pkey primary key (order_id),
  constraint orders_customer_id_fkey foreign KEY (customer_id) references customer (customer_id),
  constraint orders_cart_id_fkey foreign KEY (cart_id) references cart (cart_id)
) TABLESPACE pg_default;

create table public.payment (
  transaction_id character varying not null,
  order_id integer null,
  publisher_order_id integer null, -- New: Link to publisher orders
  amount numeric not null,
  date date null,
  method character varying not null,
  payer_customer_id integer null,
  receiver_admin_id integer null,
  payer_admin_id integer null,
  receiver_publisher_id integer null,
  points_earned integer null,
  constraint payment_pkey primary key (transaction_id),
  constraint payment_payer_admin_id_fkey foreign KEY (payer_admin_id) references admin (admin_id),
  constraint payment_payer_customer_id_fkey foreign KEY (payer_customer_id) references customer (customer_id),
  constraint payment_receiver_admin_id_fkey foreign KEY (receiver_admin_id) references admin (admin_id),
  constraint payment_receiver_publisher_id_fkey foreign KEY (receiver_publisher_id) references publisher (publisher_id),
  constraint payment_order_id_fkey foreign KEY (order_id) references orders (order_id),
  constraint payment_publisher_order_id_fkey foreign KEY (publisher_order_id) references publisher_order (publisher_order_id)
  ) TABLESPACE pg_default;

create table public.point (
  customer_id integer not null,
  point_count integer null,
  level character varying null,
  constraint point_pkey primary key (customer_id),
  constraint point_customer_id_fkey foreign KEY (customer_id) references customer (customer_id),
) TABLESPACE pg_default;

CREATE TABLE public.review (
  book_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  description VARCHAR,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT review_pkey PRIMARY KEY (book_id, customer_id),
  CONSTRAINT review_book_id_fkey FOREIGN KEY (book_id) REFERENCES book (book_id),
  CONSTRAINT review_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customer (customer_id)
);


CREATE TABLE UsedGiftCardsTemp (
  customer_id INT,
  giftcard_id VARCHAR
);
