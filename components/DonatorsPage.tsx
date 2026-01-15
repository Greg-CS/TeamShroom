'use client';

import { type Donator } from '@/lib/utils';

interface DonatorsPageProps {
  donations: Donator[];
}

const DONATOR_TIERS: Record<string, { icon: string; label: string; desc: string }> = {
  top: { icon: '/img/symbols/topdonatorsprite.png', label: 'Top Donator', desc: 'Our #1 supporter.' },
  diamond: { icon: '/img/symbols/diamonddonatorsprite.png', label: 'Diamond', desc: '50,000,000+ donated.' },
  platinum: { icon: '/img/symbols/platinumdonatorsprite.png', label: 'Platinum', desc: '25,000,000+ donated.' },
  gold: { icon: '/img/symbols/golddonatorsprite.png', label: 'Gold', desc: '10,000,000+ donated.' },
  silver: { icon: '/img/symbols/silverdonatorsprite.png', label: 'Silver', desc: '5,000,000+ donated.' },
  bronze: { icon: '/img/symbols/bronzedonatorsprite.png', label: 'Bronze', desc: '1,000,000+ donated.' },
  none: { icon: '', label: '', desc: '' }
};

function parseDonationValue(str: string): number {
  if (!str) return 0;
  return parseInt(String(str).replace(/[.,]/g, ''), 10) || 0;
}

function formatDonationDate(dt: string): string {
  if (!dt) return '-';
  const d = new Date(dt);
  return isNaN(d.getTime()) ? dt : d.toISOString().slice(0, 10);
}

function resolveTier(total: number, isTop: boolean): string {
  if (isTop) return 'top';
  if (total >= 50_000_000) return 'diamond';
  if (total >= 25_000_000) return 'platinum';
  if (total >= 10_000_000) return 'gold';
  if (total >= 5_000_000) return 'silver';
  if (total >= 1_000_000) return 'bronze';
  return 'none';
}

function aggregateTotals(donations: Donator[]): Record<string, number> {
  const totals: Record<string, number> = {};
  donations.forEach(d => {
    const name = d.name?.trim();
    if (!name) return;
    totals[name] = (totals[name] || 0) + parseDonationValue(d.value);
  });
  return totals;
}

function getTopDonator(totals: Record<string, number>): string | null {
  let topName: string | null = null;
  let topValue = 0;

  Object.entries(totals).forEach(([name, value]) => {
    if (value > topValue) {
      topName = name;
      topValue = value;
    }
  });

  return topName;
}

function getRecentDonations(donations: Donator[], limit = 5): Donator[] {
  return [...donations]
    .filter(d => d.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function DonatorsPage({ donations }: DonatorsPageProps) {
  if (!donations || !donations.length) {
    return <div style={{ textAlign: 'center' }}>No donation data.</div>;
  }

  const totals = aggregateTotals(donations);
  const topName = getTopDonator(totals);
  const recent = getRecentDonations(donations);

  const ranked = Object.entries(totals)
    .map(([name, value]) => ({
      name,
      value,
      tier: resolveTier(value, name === topName && value > 0)
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <div className="donators-top-flex  mt-[25dvh] md:mt-[10dvh]">
        <div className="last-donations-fixed-box">
          <h2>Last Donations</h2>
          <table className="last-donations-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Donator</th>
                <th>Donation</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((d, i) => (
                  <tr key={i}>
                    <td>{formatDonationDate(d.date)}</td>
                    <td>{d.name || '-'}</td>
                    <td>{d.donation || 'Pokéyen'}</td>
                    <td>{parseDonationValue(d.value).toLocaleString('en-US')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', opacity: 0.6 }}>
                    No recent donations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="how-to-donate-box">
          <h2>How to Donate</h2>
          <div>
            Send Pokéyen or items via in-game mail in <b>PokeMMO</b> to:
            <div className="donate-highlight">TeamShroomBank</div>
          </div>
        </div>
      </div>

      <table className="donators-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Donator</th>
            <th>Total Donated</th>
            <th>Tier</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((d, i) => {
            const tier = DONATOR_TIERS[d.tier];
            return (
              <tr key={d.name} className={d.tier}>
                <td className="placement">#{i + 1}</td>
                <td>
                  {tier.icon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="tier-icon" src={tier.icon} alt="" />
                  )}
                  {d.name}
                </td>
                <td>{d.value.toLocaleString('en-US')}</td>
                <td className="donator-tier donator-tier-tooltip">
                  {tier.label}
                  {tier.desc && <span className="tooltip-text">{tier.desc}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
