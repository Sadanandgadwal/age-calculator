/** Page title block for a tool: its icon, name and one-line description. */
export default function Header({ icon, title, description }) {
  return (
    <header className="px-4 pt-10 pb-8 text-center sm:pt-12 sm:pb-10">
      <div className="flex items-center justify-center gap-3 min-[375px]:gap-4">
        {icon}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight min-[375px]:text-4xl sm:text-5xl">{title}</h1>
          <span aria-hidden="true" className="mx-auto mt-2 block h-1 w-28 rounded-full bg-mint print:hidden" />
        </div>
      </div>
      <p className="mt-4 text-lg text-ink/80 print:hidden">{description}</p>
    </header>
  );
}
