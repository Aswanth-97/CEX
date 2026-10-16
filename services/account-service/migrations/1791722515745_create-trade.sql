-- Up Migration
CREATE TABLE public.trades(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL,
  buy_order_id uuid NOT NULL,
  sell_order_id uuid NOT NULL,
  price NUMERIC(30,18) NOT NULL,
  quantity NUMERIC(30,18) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT trades_market_id_fkay FOREIGN KEY(market_id) REFERENCES public.markets(id) ON DELETE RESTRICT,

  CONSTRAINT trades_buy_order_id_fkay FOREIGN KEY(buy_order_id) REFERENCES public.orders(id) ON DELETE RESTRICT,

  CONSTRAINT trades_sell_order_id_fkay FOREIGN KEY(sell_order_id) REFERENCES public.orders(id) ON DELETE RESTRICT,

  CONSTRAINT trades_price_check CHECK (price>0),

  CONSTRAINT trades_quantity_check CHECK (quantity>0),

  CONSTRAINT trades_different_orders_check CHECK (buy_order_id<>sell_order_id)

);


CREATE INDEX idx_trades_market_created_at ON public.trades(market_id,created_at DESC, id DESC);

CREATE INDEX idx_trades_buy_order_id ON public.trades(buy_order_id);

CREATE INDEX idx_trades_sell_order_id ON public.trades(sell_order_id)


 
-- Down Migration

DROP TABLE public.trades;