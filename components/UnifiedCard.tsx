'use client';

interface UnifiedCardProps {
  name: string;
  img: string;
  info?: string;
  cardType: 'member' | 'pokemon';
  unclaimed?: boolean;
  lost?: boolean;
  highlighted?: boolean;
  symbols?: {
    secret?: boolean;
    event?: boolean;
    safari?: boolean;
    egg?: boolean;
    alpha?: boolean;
    clip?: boolean;
  };
  clip?: string;
  onClick?: () => void;
}

const symbolMap: Record<string, string> = {
  secret: 'secretshinysprite.png',
  event: 'eventsprite.png',
  safari: 'safarisprite.png',
  egg: 'eggsprite.png',
  alpha: 'alphasprite.png',
  clip: 'clipsprite.png'
};

export function UnifiedCard({
  name,
  img,
  info = '',
  cardType,
  unclaimed = false,
  lost = false,
  highlighted = false,
  symbols = {},
  clip,
  onClick
}: UnifiedCardProps) {
  const classes = [
    'unified-card',
    unclaimed && 'unclaimed',
    lost && 'lost',
    highlighted && 'highlighted'
  ].filter(Boolean).join(' ');

  const symbolHtml = Object.entries(symbols)
    .filter(([, enabled]) => enabled)
    .map(([key]) => (
      <img
        key={key}
        className={`symbol ${key}`}
        src={`/img/symbols/${symbolMap[key]}`}
        alt={key}
      />
    ));

  return (
    <div
      className={classes}
      data-card-type={cardType}
      data-name={name}
      data-clip={clip}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {symbolHtml.length > 0 && (
        <div className="symbol-overlay">{symbolHtml}</div>
      )}
      <span className="unified-name">{name}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="unified-img" src={img} alt={name} />
      <span className="unified-info">{info}</span>
    </div>
  );
}
