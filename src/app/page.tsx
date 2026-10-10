import Image from 'next/image';
import Link from 'next/link';
import BottomCta from '@/components/BottomCta';
import Faq from '@/components/Faq';
import Mission from '@/components/Mission';
import Icon, { type IconName } from '@/components/Icon';
import { HERO_CTA_ID } from '@/components/Nav';
import ParallaxPhones from '@/components/ParallaxPhones';
import Phone from '@/components/Phone';
import Pricing from '@/components/Pricing';
import Reveal from '@/components/Reveal';
import { PLAN_HREF } from '@/lib/app-url';
import { FAMILY_TYPES } from '@/lib/search-config';

const STEPS: { icon: IconName; title: string; copy: string }[] = [
	{
		icon: 'people',
		title: 'Tell us about your family',
		copy: "Share who's at home, your child's age, and what's on your mind."
	},
	{
		icon: 'lotus',
		title: 'Get your plan',
		copy: "You'll receive questions to ask, phrases to try, and tips for listening."
	},
	{
		icon: 'speech',
		title: 'Have the conversation',
		copy: 'Practice out loud if you want, then talk when the moment feels right.'
	}
];

const AGE_QUESTIONS = [
	{ age: 5, q: 'What was the best part of your day?' },
	{ age: 13, q: "What's one thing that made you laugh this week?" },
	{ age: 16, q: "What's been on your mind lately?" }
];

const REMINDERS = [
	{ title: 'Tonight is your check-in with Maya', copy: 'You planned to talk after dinner' },
	{ title: 'Try your opening question', copy: '"What made you laugh this week?"' },
	{ title: 'How did it go?', copy: 'Take a minute to note what you heard' }
];

export default function Page() {
	return (
		<main className="gap-s2 lg:gap-s1 pb-s2 lg:pb-s1 mx-auto flex w-full max-w-[1360px] flex-col px-2 lg:px-3">
			{/* ───────────────────────── hero ───────────────────────── */}
			<Reveal>
				<section className="gap-s2 pt-s3 lg:pt-s2 grid items-center lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
					<div className="gap-s3 flex flex-col">
						<span className="bg-blush text-blush-ink rounded-pill text-d16 w-fit px-2 py-1">
							Parenting coach
						</span>

						<h1 className="display text-d40 sm:text-d56 lg:text-d72">
							Know what to say
							<span className="mt-1 flex flex-wrap items-center gap-1">
								{/* `pt-1` holds the pill off the line above so the pose
								    reads even top to bottom. The italic serif sits high
								    in its line box, so the top padding has to be set
								    rather than inherited from the box. */}
								<span className="bg-accent rounded-pill px-3 pt-1 pb-2 text-white italic">
									when
								</span>
								<span className="text-accent relative">
									it matters
									{/* The supplied scribble (Vector 1.svg), inlined so it
									    inherits colour and costs no extra request.

									    Aspect ratio is preserved, not stretched: the art is
									    overlapping loops, and squashing 302 units of it to
									    fit a span flattens those loops into a smudge. So it
									    runs a little wider than the phrase and is centred
									    on it, which is also how a hand-drawn rule behaves,
									    overshooting at both ends.

									    `strokeWidth` drops from the source's 6 to 4 because
									    the scale here is set by a ten-character phrase; at
									    6 the rule reads as a rope under the headline. `top`
									    is in em so it holds its place against the baseline
									    at every breakpoint. */}
									<svg
										className="text-accent pointer-events-none absolute top-[calc(0.74em_+_2px)] left-1/2 w-[106%] -translate-x-1/2"
										viewBox="0 0 302 23"
										fill="none"
										aria-hidden="true"
									>
										<path
											d="M0.175781 17.5855C17.1758 18.583 60.5758 17.7286 98.1758 6.33129C145.176 -7.91528 72.1758 28.8397 107.176 17.5855C142.176 6.33129 167.676 -1.70854 157.176 6.33129C146.676 14.3711 132.676 23.8 157.176 17.5855C181.676 11.371 211.676 -1.70854 204.176 6.33129C196.676 14.3711 167.176 32.586 244.676 6.33129C256.999 2.15646 279.376 2.19932 300.176 11.7996"
											stroke="currentColor"
											strokeWidth="4"
											strokeLinecap="round"
										/>
									</svg>
								</span>
							</span>
						</h1>

						<p className="text-muted text-d16 max-w-[40ch]">
							Get personalized guidance for the conversations you want to have with
							your child.
						</p>

						{/* The page's primary action. The header hands off from this one
						    once it has scrolled away, which is what the id is for. */}
						<Link
							id={HERO_CTA_ID}
							href={PLAN_HREF}
							className="bg-ink rounded-pill text-d16 shadow-bar flex w-full max-w-[240px] items-center justify-center gap-1 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
						>
							<Icon name="arrow" size={18} />
							Get started
						</Link>
					</div>

					<figure className="bg-panel rounded-card relative aspect-[4/3] overflow-hidden">
						<Image
							src="/images/hero-kitchen.jpg"
							alt="A parent and a young child cooking together at a kitchen counter"
							fill
							priority
							sizes="(min-width: 1024px) 60vw, 100vw"
							className="object-cover"
						/>
					</figure>
				</section>
			</Reveal>

			{/* ──────────────────── positioning ──────────────────── */}
			<Reveal>
				<section className="gap-s3 flex flex-col items-center text-center">
					<h2 className="display text-d32 sm:text-d40 lg:text-d56 max-w-[28ch]">
						Most parenting advice was written for one kind of family.
					</h2>
					<p className="text-muted text-d16 max-w-[62ch]">
						Families come in many shapes. You might be raising kids on your own, with
						a partner, or across two homes. Generic advice skips the details that
						matter most in your house.
					</p>
					<ul className="flex max-w-[76ch] flex-wrap justify-center gap-1">
						{FAMILY_TYPES.map((type, i) => (
							<li
								key={type}
								className={`rounded-pill text-d16 px-3 py-1 ${
									i === 0 ? 'bg-blush text-blush-ink' : 'bg-field text-ink'
								}`}
							>
								{type}
							</li>
						))}
					</ul>
				</section>
			</Reveal>

			{/* ───────────────────── three steps ───────────────────── */}
			<Reveal>
				<section
					id="how-it-works"
					className="bg-panel rounded-panel relative scroll-mt-11 overflow-hidden p-3 lg:min-h-[560px] lg:p-6"
				>
					<div className="gap-s2 flex flex-col lg:max-w-[46%]">
						<h2 className="display text-d32 lg:text-d40">It works in three steps</h2>

						<ol className="flex flex-col gap-3">
							{STEPS.map((step) => (
								<li key={step.title} className="flex gap-2">
									<span className="bg-ink rounded-pill grid size-6 shrink-0 place-items-center text-white">
										<Icon name={step.icon} size={24} />
									</span>
									<span className="flex flex-col gap-1">
										<span className="text-d24">{step.title}</span>
										<span className="text-muted text-d16 max-w-[38ch]">
											{step.copy}
										</span>
									</span>
								</li>
							))}
						</ol>

						{/* Mobile keeps one phone in the flow; the overlapping pair below
						    only reads at widths where it has room to overlap. */}
						<div className="mx-auto w-[240px] lg:hidden">
							<Phone
								src="/images/app-moment.png"
								alt="The app turning a moment into a plan"
							/>
						</div>
					</div>

					<ParallaxPhones />
				</section>
			</Reveal>

			{/* ──────────────────── the two cards ──────────────────── */}
			<Reveal>
				<section className="grid gap-2 lg:grid-cols-2">
					<div className="bg-accent rounded-card gap-s3 flex flex-col p-3 text-white lg:p-5">
						<h2 className="display text-d32 lg:text-d40 max-w-[16ch]">
							Every plan is built for your children
						</h2>
						<p className="text-d16 max-w-[44ch] text-white/85">
							The same moment sounds different at five, thirteen, and sixteen. Each
							question fits your child&apos;s age.
						</p>
						{/* The rows are the same white notification as the card next
						    door, so the pair reads as one surface in two colourways
						    rather than two unrelated panels. The middle one sits at
						    full strength and the two either side drop to half, so the
						    stack reads as the one you're on with the others falling
						    away above and below. */}
						<ul className="mt-auto flex flex-col gap-1">
							{AGE_QUESTIONS.map((item, i) => (
								<li
									key={item.age}
									className={`bg-surface text-ink rounded-field flex items-center gap-2 px-2 py-2 ${
										i === 1 ? '' : 'opacity-50'
									}`}
								>
									{/* Solid field grey, not a white tint: on a white row a
									    translucent white tag disappears. */}
									<span className="bg-field text-ink rounded-pill text-d16 shrink-0 px-2 py-1">
										Age {item.age}
									</span>
									<span className="text-d16">&ldquo;{item.q}&rdquo;</span>
								</li>
							))}
						</ul>
					</div>

					<div className="bg-panel-2 rounded-card gap-s3 flex flex-col p-3 lg:p-5">
						<h2 className="display text-d32 lg:text-d40 max-w-[16ch]">
							Know what comes next
						</h2>
						<p className="text-muted text-d16 max-w-[44ch]">
							Gentle reminders help you follow through after the first talk.
						</p>
						<ul className="mt-auto flex flex-col gap-1">
							{REMINDERS.map((item) => (
								<li
									key={item.title}
									className="bg-surface rounded-field flex items-center gap-2 px-2 py-2"
								>
									<span className="bg-blush text-blush-ink display text-d16 rounded-pill grid size-5 shrink-0 place-items-center">
										M
									</span>
									<span className="flex flex-col">
										<span className="text-d16 font-semibold">{item.title}</span>
										<span className="text-muted text-d16">{item.copy}</span>
									</span>
								</li>
							))}
						</ul>
					</div>
				</section>
			</Reveal>

			{/* ───────────────────────── mission ───────────────────────── */}
			<Reveal>
				<Mission />
			</Reveal>

			{/* ───────────────────────── pricing ───────────────────────── */}
			<Reveal>
				<Pricing />
			</Reveal>

			{/* ─────────────────────────── FAQ ─────────────────────────── */}
			<Reveal>
				<Faq />
			</Reveal>

			{/* ───────────────────── closing CTA ───────────────────── */}
			<Reveal>
				<BottomCta />
			</Reveal>
		</main>
	);
}
