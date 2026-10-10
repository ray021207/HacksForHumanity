import Icon, { type IconName } from './Icon';
import Mascot from './Mascot';

const PRINCIPLES: { icon: IconName; title: string; copy: string }[] = [
	{
		icon: 'lotus',
		title: 'Warmth first',
		copy: 'Every plan starts by listening. No scripts that talk at your child.'
	},
	{
		icon: 'speech',
		title: 'Your words, not ours',
		copy: 'You say it the way you talk at home.'
	},
	{
		icon: 'lock',
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
		<section
			id="mission"
			className="gap-s2 flex scroll-mt-11 flex-col items-center text-center"
		>
			<Mascot name="ghost" size={64} />

			<span className="bg-blush text-blush-ink rounded-pill text-d16 px-2 py-1">
				Our mission
			</span>

			<h2 className="display text-d32 sm:text-d40 lg:text-d56 max-w-[24ch]">
				Every parent deserves a good first sentence
			</h2>

			<div className="text-muted text-d16 flex max-w-[60ch] flex-col gap-2">
				<p>
					Parents want to help. Most of us freeze at the moment it counts. The hard
					part is rarely the love. It is the opening line.
				</p>
			</div>

			<ul className="mt-1 grid w-full gap-1 text-left sm:grid-cols-3">
				{PRINCIPLES.map((item) => (
					<li
						key={item.title}
						className="bg-surface rounded-card shadow-bar flex flex-col gap-1 p-3"
					>
						{/* Blush rather than the ink chip the three steps use: those
						    are numbered instructions, these are values, and the
						    softer badge keeps them from reading as another list of
						    things to do. */}
						<span className="bg-blush text-blush-ink rounded-pill mb-1 grid size-5 place-items-center">
							<Icon name={item.icon} size={20} />
						</span>
						<span className="text-d16 font-semibold">{item.title}</span>
						<span className="text-muted text-d16">{item.copy}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
