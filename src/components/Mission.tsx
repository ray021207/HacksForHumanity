const PRINCIPLES = [
	{
		title: 'Warmth first',
		copy: 'Every plan starts by listening. No scripts that talk at your child.'
	},
	{
		title: 'Your words, not ours',
		copy: 'We hand you a starting line. You say it the way you talk at home.'
	},
	{
		title: 'What you type stays yours',
		copy: 'Your answers live in your browser. We keep no names and no stories.'
	}
];

/**
 * The mission sits between the proof sections and the FAQ: by this point the
 * reader knows what the product does, and this is the paragraph that says why
 * it exists before they decide to start.
 */
export default function Mission() {
	return (
		<section id="mission" className="gap-s2 flex flex-col items-center text-center">
			<span className="bg-blush text-blush-ink rounded-pill text-d16 px-2 py-1">
				Our mission
			</span>

			<h2 className="display text-d32 sm:text-d40 lg:text-d56 max-w-[24ch]">
				Every parent deserves a good first sentence
			</h2>

			<div className="text-muted text-d16 flex max-w-[60ch] flex-col gap-2">
				<p>
					Parents want to help. Most of us freeze at the moment it counts. The hard part
					is rarely the love — it&apos;s the opening line.
				</p>
				<p>
					So we make that part easier. You tell us what happened. We hand back a few
					things you could say, and why each one lands. Then you go have the talk.
				</p>
			</div>

			<ul className="mt-1 grid w-full gap-1 text-left sm:grid-cols-3">
				{PRINCIPLES.map((item) => (
					<li
						key={item.title}
						className="bg-surface rounded-card shadow-bar flex flex-col gap-1 p-3"
					>
						<span className="text-d16 font-semibold">{item.title}</span>
						<span className="text-muted text-d16">{item.copy}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
