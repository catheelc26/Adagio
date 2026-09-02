const ICONS: Record<string, React.ReactNode> = {
  ballet: (
    <>
      <path d="M6 20c0-3.5 1.8-5.5 3-8 .8-1.6.6-3.2-.5-4.3C7.6 6.8 8 5 9.5 4c1.3-.9 3-.5 3.7 1 .5 1 .3 2-.2 3-1 2 .5 3.5 2 5.5 1.2 1.6 2 3.7 2 6.5" />
      <path d="M4.5 20.5h6M13.5 20.5h6" />
    </>
  ),
  physio: (
    <>
      <path d="M4 13h3l2-4 3 8 2-6 1.5 2H20" />
      <path d="M8.5 5.5c1-1.3 3-1.3 4 0 .4.6.5 1.3.3 2" />
    </>
  ),
  pilates: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  yoga: (
    <>
      <circle cx="12" cy="5.5" r="2" />
      <path d="M12 7.5v4M12 11.5c-2.5 1-4 3-4 6M12 11.5c2.5 1 4 3 4 6M8 17.5h8" />
    </>
  ),
  meditation: (
    <>
      <path d="M12 4c1 2 1 4 0 6-1-2-1-4 0-6Z" />
      <path d="M12 9c2.2 1 3.6 3 3.6 5.5H8.4C8.4 12 9.8 10 12 9Z" />
      <path d="M4.5 15.5c1.5 1.6 3.2 2.2 4.8 1.7-1-1.3-1.3-2.8-.8-4.4-1.7.3-3.1 1.3-4 2.7Z" />
      <path d="M19.5 15.5c-1.5 1.6-3.2 2.2-4.8 1.7 1-1.3 1.3-2.8.8-4.4 1.7.3 3.1 1.3 4 2.7Z" />
      <path d="M6 20h12" />
    </>
  ),
  anatomy: (
    <>
      <circle cx="7" cy="7" r="1.8" />
      <circle cx="17" cy="17" r="1.8" />
      <path d="M8.3 8.3c1.6 1.6 1.9 3.4.9 4.4-1 1-2.8.7-4.4-.9M15.7 15.7c-1.6-1.6-1.9-3.4-.9-4.4 1-1 2.8-.7 4.4.9" />
    </>
  ),
  biomechanics: (
    <>
      <path d="M12 4a8 8 0 1 1-6.9 4" />
      <path d="M5.1 4.5v3.5H8.6" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  awareness: (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
};

export function PillarIcon({
  icon,
  className = "h-6 w-6",
}: {
  icon: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[icon] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
