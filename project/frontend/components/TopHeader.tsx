interface TopHeaderProps {
  pageTitle: string;
}

export default function TopHeader({ pageTitle }: TopHeaderProps) {
  return (
    <header className="h-14 px-6 flex items-center justify-between sticky top-0 z-30 bg-white border-b border-[#d5d9e0]">
      <h1 className="font-serif text-[18px] text-[#1a2332]">{pageTitle}</h1>
    </header>
  );
}
