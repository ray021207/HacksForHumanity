import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';

// TODO: swap for the real partner inbox before this page goes public.
const PARTNER_EMAIL = 'partners@kindapp.com';

const WHO: string[] = [
	'Family and couples therapists',
	'Child and teen counselors',
	'School counselors and social workers',
	'Parent coaches and parenting groups'
];

const STEPS: { title: string; copy: string }[] = [
	{
		title: 'Tell us about your office',
		copy: 'One email. Who you see, how many families, what you need between sessions.'
	},
	{
		title: 'We set up your link',
		copy: 'Your office gets its own start link. Families open it and answer a few questions.'
	},
	{
		title: 'Families practice at home',
		copy: 'They get conversation starters for the week. You keep doing the work that needs you.'
	}
];

const GETS: { title: string; copy: string }[] = [
	{
		title: 'A link for your families',
		copy: 'Hand it out at the end of a session. No app store, no account to set up.'
	},
	{
		title: 'Printable starter cards',
		copy: 'The same questions and phrases on paper, for families who want them in hand.'
	},
	{
		title: 'A say in what we build',
		copy: 'You see what families bring back. Tell us, and it shapes the next version.'
	}
];

export const metadata: Metadata = {
	title: 'Partner program — Kin&d',
	description:
		'Kin&d partners with therapy offices, school counselors and parent coaches to support families between sessions.'
};

export default function PartnersPage() {
	return (
		<main className="gap-s2 lg:gap-s1 pb-s2 lg:pb-s1 mx-auto flex w-full max-w-[1360px] flex-col px-2 lg:px-3">
			{/* ──────────────────────── hero ──────────────────────── */}
			<section className="gap-s3 pt-s3 lg:pt-s2 flex flex-col items-start">
				<span className="bg-blush text-blush-ink rounded-pill text-d16 w-fit px-2 py-1">
					Partner program
				</span>

				<h1 className="display text-d40 sm:text-d56 lg:text-d64 max-w-[20ch]">
					The session ends. The week keeps going.
				</h1>

				<p className="text-muted text-d16 max-w-[52ch]">
					Families leave your office with a plan and lose it by Tuesday. Kin&amp;d gives
					them the first words at the moment they need them, in your name.
				</p>

				<Link
					href={`mailto:${PARTNER_EMAIL}?subject=Partner%20program`}
					className="bg-ink rounded-pill text-d16 shadow-bar flex items-center gap-1 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
				>
					<Icon name="arrow" size={18} />
					Apply for the pilot
				</Link>
			</section>

			{/* ──────────────────────── who ──────────────────────── */}
			<section className="bg-panel rounded-panel gap-s3 flex flex-col p-3 lg:p-6">
				<h2 className="display text-d32 lg:text-d40 max-w-[20ch]">Who this is for</h2>
				<ul className="flex flex-wrap gap-1">
					{WHO.map((item) => (
						<li key={item} className="bg-surface rounded-pill text-d16 px-3 py-1">
							{item}
						</li>
					))}
				</ul>
				<p className="text-muted text-d16 max-w-[56ch]">
					You already teach parents how to listen. Kin&amp;d carries that into the kitchen
					on a Wednesday night, when you are not in the room.
				</p>
			</section>

			{/* ─────────────────────── how ─────────────────────── */}
			<section className="gap-s3 flex flex-col">
				<h2 className="display text-d32 lg:text-d40">How partnering works</h2>
				<ol className="grid gap-1 lg:grid-cols-3">
					{STEPS.map((step, i) => (
						<li
							key={step.title}
							className="bg-surface rounded-card shadow-bar flex flex-col gap-1 p-3"
						>
							<span className="bg-ink rounded-pill text-d16 grid size-5 shrink-0 place-items-center font-medium text-white">
								{i + 1}
							</span>
							<span className="text-d24">{step.title}</span>
							<span className="text-muted text-d16">{step.copy}</span>
						</li>
					))}
				</ol>
			</section>

			{/* ─────────────────────── gets ─────────────────────── */}
			<section className="gap-s3 flex flex-col">
				<h2 className="display text-d32 lg:text-d40">What your office gets</h2>
				<ul className="grid gap-1 lg:grid-cols-3">
					{GETS.map((item) => (
						<li
							key={item.title}
							className="bg-panel-2 rounded-card flex flex-col gap-1 p-3"
						>
							<span className="text-d24">{item.title}</span>
							<span className="text-muted text-d16">{item.copy}</span>
						</li>
					))}
				</ul>
			</section>

			{/* ─────────────────────── safety ─────────────────────── */}
			<section className="bg-accent rounded-card gap-s3 flex flex-col p-3 text-white lg:p-5">
				<h2 className="display text-d32 lg:text-d40 max-w-[20ch]">
					Where Kin&amp;d stops
				</h2>
				<div className="text-d16 flex max-w-[60ch] flex-col gap-2 text-white/85">
					<p>
						Kin&amp;d is not therapy and never stands in for care. It writes
						conversation starters, nothing more.
					</p>
					<p>
						Serious situations get crisis resources instead of cards. Families in danger
						are pointed to help, not handed a script.
					</p>
				</div>
			</section>

			{/* ─────────────────────── cta ─────────────────────── */}
			<section className="gap-s3 flex flex-col items-center text-center">
				<h2 className="display text-d32 sm:text-d40 max-w-[24ch]">
					We are onboarding a small group of offices
				</h2>
				<p className="text-muted text-d16 max-w-[44ch]">
					Email us what your families need. We answer every one.
				</p>
				<Link
					href={`mailto:${PARTNER_EMAIL}?subject=Partner%20program`}
					className="bg-ink rounded-pill text-d16 shadow-bar flex items-center gap-1 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
				>
					<Icon name="arrow" size={18} />
					{PARTNER_EMAIL}
				</Link>
			</section>
		</main>
	);
}
