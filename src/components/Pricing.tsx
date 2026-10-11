import Link from 'next/link';
import Icon from './Icon';
import Mascot from './Mascot';
import UpgradeButton from './UpgradeButton';
import { PLAN_HREF } from '@/lib/app-url';

const FREE = [
	'One conversation plan to start',
	'Questions written for your child’s age',
	'Your family profile, saved in your browser'
];

const UNLIMITED = [
	'Unlimited conversation plans',
	'Talk instead of type, on any field',
	'Follow-up reminders after the first talk',
	'Every family shape, every age from five to eighteen'
];

/**
 * Two cards, same shape as the proof pair above: the neutral one is the way
 * in and the accent one is the thing we want picked. Only the paid card gets
 * accent, because a page where both cards shout has no recommendation in it.
 */
export default function Pricing() {
	return (
		<section id="pricing" className="gap-s2 flex scroll-mt-11 flex-col items-center">
			<div className="gap-s3 flex flex-col items-center text-center">
				<span className="bg-blush text-blush-ink rounded-pill text-d16 px-2 py-1">
					Pricing
				</span>

				<h2 className="display text-d32 sm:text-d40 lg:text-d56 max-w-[24ch]">
					Start free. Go unlimited for $9.99 a month.
				</h2>

				<p className="text-muted text-d16 max-w-[48ch]">
					No bundles, no annual lock-in. Cancel any month you don’t need us.
				</p>
			</div>

			<div className="grid w-full gap-2 lg:grid-cols-2">
				{/* ---- free ---- */}
				<div className="bg-panel-2 rounded-card gap-s3 flex flex-col p-3 lg:p-5">
					<div className="flex flex-col gap-1">
						<span className="text-d16 font-semibold">Free</span>
						<span className="display text-d48 lg:text-d56">$0</span>
						<span className="text-muted text-d16">
							Enough to find out whether it helps.
						</span>
					</div>

					<ul className="flex flex-col gap-1">
						{FREE.map((item) => (
							<li key={item} className="text-d16 flex items-start gap-1">
								<span className="text-muted mt-[3px] shrink-0">
									<Icon name="check" size={18} />
								</span>
								<span>{item}</span>
							</li>
						))}
					</ul>

					<Link
						href={PLAN_HREF}
						className="border-ink text-d16 rounded-pill mt-auto w-full border py-2 text-center font-medium transition-colors hover:bg-white/50"
					>
						Start free
					</Link>
				</div>

				{/* ---- unlimited ---- */}
				<div className="bg-accent rounded-card gap-s3 relative flex flex-col p-3 text-white lg:p-5">
					{/* Hanging off the corner rather than sitting inside the padding,
					    so the card reads as something the character is holding up. */}
					<Mascot
						name="star"
						size={72}
						className="pointer-events-none absolute -top-4 -left-1 rotate-[-12deg] drop-shadow-sm"
					/>

					<span className="rounded-pill text-d16 absolute top-3 right-3 bg-white/20 px-2 py-1 lg:top-5 lg:right-5">
						Most parents pick this
					</span>

					<div className="flex flex-col gap-1">
						<span className="text-d16 font-semibold">Unlimited</span>
						<span className="display text-d48 lg:text-d56">
							$9.99
							<span className="text-d24 font-normal text-white/70"> / month</span>
						</span>
						<span className="text-d16 text-white/85">
							For the months when one talk leads to three.
						</span>
					</div>

					<ul className="flex flex-col gap-1">
						{UNLIMITED.map((item) => (
							<li key={item} className="text-d16 flex items-start gap-1">
								<span className="mt-[3px] shrink-0 text-white/70">
									<Icon name="check" size={18} />
								</span>
								<span>{item}</span>
							</li>
						))}
					</ul>

					<UpgradeButton className="text-accent rounded-pill text-d16 shadow-bar mt-auto w-full bg-white py-2 text-center font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70" />
				</div>
			</div>

			<p className="text-muted text-d16 text-center">
				Not therapy. Cancel in one tap, no call to make.
			</p>
		</section>
	);
}
