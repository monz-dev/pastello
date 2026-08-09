type CakeIconSize = 'mini' | 'mediano' | 'doble-piso' | 'grande' | 'extra-grande';

interface CakeSizeIconProps {
  size: CakeIconSize;
  cmLabel: string;
}

const SINGLE_TIER: Record<Exclude<CakeIconSize, 'doble-piso'>, string> = {
  mini: 'w-10 h-9',
  mediano: 'w-14 h-12',
  grande: 'w-18 h-16',
  'extra-grande': 'w-22 h-20',
};

function SingleTier({
  tierClass,
  frostingClass = 'absolute top-0 left-0 right-0 h-1.5 rounded-t-md bg-cake',
}: {
  tierClass: string;
  frostingClass?: string;
}) {
  return (
    <div className={`relative ${tierClass} rounded-t-md bg-cake`}>
      <div className={frostingClass} />
    </div>
  );
}

export function CakeSizeIcon({ size, cmLabel }: CakeSizeIconProps) {
  if (size === 'doble-piso') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center gap-0">
          <SingleTier tierClass="w-14 h-10" />
          <SingleTier tierClass="w-14 h-10" />
        </div>
        <span className="text-label-md text-on-surface-variant">{cmLabel}</span>
      </div>
    );
  }

  const tierClass = SINGLE_TIER[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <SingleTier tierClass={tierClass} />
      <span className="text-label-md text-on-surface-variant">{cmLabel}</span>
    </div>
  );
}
