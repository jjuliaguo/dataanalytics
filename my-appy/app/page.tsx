"use client";

import { useMemo, useState } from "react";

const cities = [
  {
    name: "Emeryville",
    x: 19,
    y: 23,
    route: "M 150 108 C 286 76 454 140 632 238",
    minutes: 28,
    distance: 10,
    color: "#0f766e",
    priceIndex: 0.5,
    schedule: ["7:10 AM", "12:20 PM", "5:45 PM"],
  },
  {
    name: "Oakland",
    x: 24,
    y: 66,
    route: "M 194 318 C 316 292 472 258 632 238",
    minutes: 34,
    distance: 12,
    color: "#2563eb",
    priceIndex: 0.48,
    schedule: ["6:50 AM", "1:10 PM", "6:30 PM"],
  },
  {
    name: "Daly City",
    x: 72,
    y: 86,
    route: "M 575 413 C 610 352 628 293 632 238",
    minutes: 22,
    distance: 8,
    color: "#c2410c",
    priceIndex: 0.52,
    schedule: ["8:00 AM", "2:00 PM", "7:20 PM"],
  },
  {
    name: "South San Francisco",
    x: 90,
    y: 72,
    route: "M 720 346 C 700 306 667 269 632 238",
    minutes: 31,
    distance: 13,
    color: "#7c3aed",
    priceIndex: 0.51,
    schedule: ["7:40 AM", "12:55 PM", "6:05 PM"],
  },
];

const goods = [
  { name: "Produce", sfPrice: 18, unit: "weekly bundle" },
  { name: "Eggs", sfPrice: 9, unit: "dozen" },
  { name: "Dairy", sfPrice: 14, unit: "milk, yogurt, cheese" },
  { name: "Pantry staples", sfPrice: 24, unit: "rice, pasta, canned goods" },
  { name: "Household basics", sfPrice: 19, unit: "soap, paper, cleaning" },
  { name: "Baby essentials", sfPrice: 32, unit: "diapers and wipes" },
];

type Basket = Record<string, number>;
type CityStat = (typeof cities)[number] & {
  sfTotal: number;
  sourceGoodsTotal: number;
  deliveredTotal: number;
  savings: number;
  percent: number;
  spread: number;
};

const initialBasket: Basket = {
  Produce: 10,
  Eggs: 10,
  Dairy: 10,
  "Pantry staples": 10,
  "Household basics": 10,
  "Baby essentials": 10,
};

export default function Home() {
  const [dailyDeliveryPrice, setDailyDeliveryPrice] = useState(15);
  const [activeCity, setActiveCity] = useState(cities[0].name);
  const [basket, setBasket] = useState<Basket>(initialBasket);

  const basketItems = useMemo(
    () =>
      goods.map((item) => ({
        ...item,
        quantity: basket[item.name] ?? 0,
        total: item.sfPrice * (basket[item.name] ?? 0),
      })),
    [basket],
  );

  const basketBase = useMemo(
    () => basketItems.reduce((sum, item) => sum + item.total, 0),
    [basketItems],
  );

  const itemCount = useMemo(
    () => basketItems.reduce((sum, item) => sum + item.quantity, 0),
    [basketItems],
  );

  const cityStats = useMemo(
    () =>
      cities.map((city) => {
        const sfTotal = basketBase;
        const sourceGoodsTotal = Math.round(basketBase * city.priceIndex);
        const deliveredTotal = sourceGoodsTotal + dailyDeliveryPrice;
        const savings = Math.max(0, sfTotal - deliveredTotal);
        const percent = sfTotal > 0 ? Math.round((savings / sfTotal) * 100) : 0;

        return {
          ...city,
          sfTotal,
          sourceGoodsTotal,
          deliveredTotal,
          savings,
          percent,
          spread: sfTotal - sourceGoodsTotal,
        };
      }),
    [basketBase, dailyDeliveryPrice],
  );

  const selectedStats =
    cityStats.find((city) => city.name === activeCity) ?? cityStats[0];
  const bestCity = cityStats.reduce((best, city) =>
    city.savings > best.savings ? city : best,
  );
  const monthlySavings = selectedStats.savings * 4;
  const annualSavings = monthlySavings * 12;
  const irrationalPremium = Math.max(
    0,
    selectedStats.spread - dailyDeliveryPrice,
  );

  function updateQuantity(name: string, change: number) {
    setBasket((current) => ({
      ...current,
      [name]: Math.max(0, Math.min(100, (current[name] ?? 0) + change)),
    }));
  }

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#181713]">
      <section className="border-b border-[#d8d2c5] bg-[#fffdf7]">
        <div className="mx-auto grid min-h-screen w-full max-w-[1500px] grid-rows-[auto_1fr] gap-4 px-4 py-4 lg:px-6">
          <header className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Bay Area price arbitrage
              </p>
              <h1 className="mt-2 max-w-5xl text-4xl font-semibold leading-[1.05] md:text-6xl">
                Finding grocery savings when SF convenience markups exceed
                nearby transport costs.
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#5d584e] lg:justify-self-end">
              The prototype compares identical baskets across nearby cities,
              then shows where pooled point-to-point delivery can convert local
              price gaps into practical relief for low-income households. The
              working assumption is that SF shelf prices are about double nearby
              markets, while a $15 median gig-work trip still leaves substantial
              price arbitrage.
            </p>
          </header>

          <div className="grid min-h-0 gap-4 xl:grid-cols-[340px_minmax(540px,1fr)_340px]">
            <BasketPanel
              basketItems={basketItems}
              basketBase={basketBase}
              dailyDeliveryPrice={dailyDeliveryPrice}
              itemCount={itemCount}
              onDeliveryChange={setDailyDeliveryPrice}
              onQuantityChange={updateQuantity}
            />

            <MapPanel
              cityStats={cityStats}
              selectedStats={selectedStats}
              activeCity={activeCity}
              onCityChange={setActiveCity}
            />

            <AnalysisPanel
              selectedStats={selectedStats}
              bestCity={bestCity}
              monthlySavings={monthlySavings}
              annualSavings={annualSavings}
              irrationalPremium={irrationalPremium}
              dailyDeliveryPrice={dailyDeliveryPrice}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] gap-4 px-4 py-5 lg:grid-cols-[1.15fr_0.85fr] lg:px-6">
        <div className="border border-[#d8d2c5] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Presentation thesis
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
            We are not just mapping expensive neighborhoods. We are identifying
            price arbitrage opportunities where the same goods can be sourced
            nearby and still arrive below San Francisco convenience prices.
          </h2>
        </div>

        <div className="grid gap-3 border border-[#d8d2c5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Daily pickup windows</h2>
          {selectedStats.schedule.map((time) => (
            <div
              className="grid grid-cols-[76px_1fr_auto] items-center gap-3 border border-[#e3ded5] bg-[#fffdf7] p-3"
              key={time}
            >
              <p className="font-semibold">{time}</p>
              <p className="text-sm text-[#625d52]">
                {selectedStats.name} pickup to SF community drop
              </p>
              <span className="bg-[#f4efe3] px-2 py-1 text-sm font-semibold">
                {selectedStats.minutes} min
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function BasketPanel({
  basketItems,
  basketBase,
  dailyDeliveryPrice,
  itemCount,
  onDeliveryChange,
  onQuantityChange,
}: {
  basketItems: Array<{
    name: string;
    sfPrice: number;
    unit: string;
    quantity: number;
    total: number;
  }>;
  basketBase: number;
  dailyDeliveryPrice: number;
  itemCount: number;
  onDeliveryChange: (value: number) => void;
  onQuantityChange: (name: string, change: number) => void;
}) {
  return (
    <aside className="grid min-h-0 gap-4 xl:grid-rows-[auto_1fr]">
      <div className="border border-[#d8d2c5] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5f675f]">
              Build basket
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Neighborhood basket</h2>
          </div>
          <span className="bg-[#181713] px-3 py-2 text-sm font-semibold text-white">
            {itemCount} items
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Metric label="SF total" value={`$${basketBase}`} />
          <Metric label="Delivery" value={`$${dailyDeliveryPrice}`} />
        </div>

        <Slider
          label="Point-to-point delivery cost"
          value={dailyDeliveryPrice}
          min={10}
          max={25}
          step={1}
          prefix="$"
          onChange={onDeliveryChange}
        />
      </div>

      <div className="min-h-0 overflow-auto border border-[#d8d2c5] bg-white p-3 shadow-sm">
        <div className="grid gap-2">
          {basketItems.map((item) => (
            <div
              key={item.name}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border border-[#e3ded5] bg-[#fffdf7] p-3"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs leading-5 text-[#686255]">
                  {item.unit} | ${item.sfPrice} SF base
                </p>
              </div>
              <div className="grid grid-cols-[34px_36px_34px] items-center border border-[#d8d2c5] bg-white">
                <button
                  className="h-9 border-r border-[#d8d2c5] text-lg font-semibold disabled:text-[#bbb4a8]"
                  disabled={item.quantity === 0}
                  onClick={() => onQuantityChange(item.name, -10)}
                  aria-label={`Remove ${item.name}`}
                >
                  -
                </button>
                <span className="text-center text-sm font-semibold">
                  {item.quantity}
                </span>
                <button
                  className="h-9 border-l border-[#d8d2c5] text-lg font-semibold"
                  onClick={() => onQuantityChange(item.name, 10)}
                  aria-label={`Add ${item.name}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function MapPanel({
  cityStats,
  selectedStats,
  activeCity,
  onCityChange,
}: {
  cityStats: CityStat[];
  selectedStats: CityStat;
  activeCity: string;
  onCityChange: (name: string) => void;
}) {
  return (
    <section className="relative min-h-[590px] overflow-hidden border border-[#d8d2c5] bg-[#eaf0ed] shadow-sm xl:min-h-0">
      <div className="absolute inset-0 map-grid" />
      <div className="absolute left-4 top-4 z-10 max-w-[330px] border border-[#d8d2c5] bg-[#fffdf7]/95 p-4 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Animated sourcing map
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          Nearby cities feed a single SF drop point.
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#625d52]">
          Select a source to see goods move point-to-point into San Francisco.
        </p>
      </div>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 480"
        role="img"
        aria-label="Animated delivery routes from nearby cities into San Francisco"
      >
        <path
          d="M 642 44 C 606 119 604 184 632 238 C 660 303 662 370 636 447"
          fill="none"
          stroke="#7f8b82"
          strokeDasharray="8 12"
          strokeWidth="4"
        />
        <path
          d="M 74 116 C 197 160 302 176 421 163 C 520 152 585 180 632 238"
          fill="none"
          stroke="#9ba59b"
          strokeDasharray="5 13"
          strokeWidth="3"
        />
        {cityStats.map((city) => (
          <g key={city.name}>
            <path
              d={city.route}
              fill="none"
              stroke={city.color}
              strokeLinecap="round"
              strokeWidth={city.name === activeCity ? 9 : 4}
              opacity={city.name === activeCity ? 0.95 : 0.24}
            />
            {city.name === activeCity ? (
              <g className="moving-basket">
                <animateMotion
                  dur={`${Math.max(3.2, city.minutes / 7)}s`}
                  path={city.route}
                  repeatCount="indefinite"
                />
                <rect
                  x="-18"
                  y="-14"
                  width="36"
                  height="28"
                  rx="4"
                  fill="#fffdf7"
                  stroke={city.color}
                  strokeWidth="4"
                />
                <path
                  d="M -10 -15 C -7 -26 7 -26 10 -15"
                  fill="none"
                  stroke={city.color}
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                <circle cx="-8" cy="-2" r="3" fill={city.color} />
                <circle cx="3" cy="-2" r="3" fill={city.color} />
                <circle cx="12" cy="-2" r="3" fill={city.color} />
              </g>
            ) : null}
          </g>
        ))}
      </svg>

      <div className="absolute left-[76%] top-[49%] z-10 -translate-x-1/2 -translate-y-1/2 border border-[#181713] bg-[#181713] px-4 py-3 text-left text-white shadow-lg">
        <span className="block text-xs uppercase tracking-[0.18em] text-[#cfd7cf]">
          Destination
        </span>
        <span className="text-xl font-semibold">San Francisco</span>
        <span className="block text-sm text-[#e5e0d4]">
          ${selectedStats.sfTotal} local basket
        </span>
      </div>

      {cityStats.map((city) => (
        <button
          key={city.name}
          className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 border px-3 py-2 text-left shadow-sm transition ${
            city.name === activeCity
              ? "border-[#181713] bg-white"
              : "border-[#d6d0c4] bg-white/88 hover:bg-white"
          }`}
          style={{ left: `${city.x}%`, top: `${city.y}%` }}
          onClick={() => onCityChange(city.name)}
        >
          <span
            className="mb-1 block h-2 w-10"
            style={{ backgroundColor: city.color }}
          />
          <span className="block text-sm font-semibold">{city.name}</span>
          <span className="text-xs text-[#656156]">
            save ${city.savings} after delivery
          </span>
        </button>
      ))}

      <div className="absolute bottom-4 left-4 right-4 z-10 grid gap-3 border border-[#d8d2c5] bg-[#fffdf7]/95 p-3 backdrop-blur md:grid-cols-3">
        <PriceCard label="SF shelf total" value={selectedStats.sfTotal} tone="#181713" />
        <PriceCard
          label={`${selectedStats.name} shelf total`}
          value={selectedStats.sourceGoodsTotal}
          tone={selectedStats.color}
        />
        <PriceCard label="Delivered total" value={selectedStats.deliveredTotal} tone="#c2410c" />
      </div>
    </section>
  );
}

function AnalysisPanel({
  selectedStats,
  bestCity,
  monthlySavings,
  annualSavings,
  irrationalPremium,
  dailyDeliveryPrice,
}: {
  selectedStats: CityStat;
  bestCity: CityStat;
  monthlySavings: number;
  annualSavings: number;
  irrationalPremium: number;
  dailyDeliveryPrice: number;
}) {
  return (
    <aside className="grid gap-4">
      <div className="border border-[#d8d2c5] bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5f675f]">
          Current opportunity
        </p>
        <h2 className="mt-2 text-3xl font-semibold">{selectedStats.name}</h2>
        <p className="mt-2 text-sm leading-6 text-[#625d52]">
          This route produces a ${selectedStats.spread} shelf-price gap before
          delivery. After a ${dailyDeliveryPrice} point-to-point transport cost,
          the remaining arbitrage value is ${irrationalPremium}, so the $15
          median gig-work run is small relative to the pricing gap.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Weekly savings" value={`$${selectedStats.savings}`} />
        <Metric label="Savings rate" value={`${selectedStats.percent}%`} />
        <Metric label="Monthly relief" value={`$${monthlySavings}`} />
        <Metric label="Annual impact" value={`$${annualSavings}`} />
      </div>

      <div className="border border-[#d8d2c5] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">Best source right now</h2>
        <div className="mt-4 border border-[#e3ded5] bg-[#fffdf7] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold">{bestCity.name}</p>
              <p className="mt-1 text-sm text-[#625d52]">
                {bestCity.distance} miles | {bestCity.minutes} minutes
              </p>
            </div>
            <span className="bg-[#0f766e] px-3 py-2 text-sm font-semibold text-white">
              Save ${bestCity.savings}
            </span>
          </div>
        </div>
      </div>

      <div className="border border-[#d8d2c5] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">What this proves</h2>
        <div className="mt-4 grid gap-3">
          <Takeaway
            title="Price gaps persist over short distance"
            text="Nearby cities can price the same basket materially below San Francisco even when they are only a few miles away."
          />
          <Takeaway
            title="Transport cost is not the full explanation"
            text="When the local premium exceeds delivery cost, convenience pricing becomes economically irrational for budget-constrained shoppers."
          />
          <Takeaway
            title="Pooling makes access practical"
            text="A predictable route and shared drop point help low-income households benefit without each shopper needing a car or individual delivery order."
          />
        </div>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#d8d2c5] bg-white p-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#676156]">
        {label}
      </p>
      <p className="mt-2 truncate text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        <span className="bg-[#f4efe3] px-2 py-1">
          {prefix}
          {value}
          {suffix}
        </span>
      </span>
      <input
        className="mt-3 w-full accent-[#0f766e]"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function PriceCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="border border-[#e3ded5] bg-white p-3">
      <span className="mb-2 block h-2 w-10" style={{ backgroundColor: tone }} />
      <p className="text-sm font-semibold text-[#625d52]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">${value}</p>
    </div>
  );
}

function Takeaway({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-[#e3ded5] bg-[#fffdf7] p-3">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#686255]">{text}</p>
    </div>
  );
}
