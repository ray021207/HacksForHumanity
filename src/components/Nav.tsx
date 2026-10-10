'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { useScrolledPastElement } from '@/hooks/useScrolledPastElement';
import { PLAN_HREF } from '@/lib/app-url';

/** The id of the hero's own "Get started", which this header hands off from. */
export const HERO_CTA_ID = 'hero-cta';

/**
 * One header for every route: the wordmark, and on the landing page a "Get
 * started" that fades in at the top right.
 *
 * It used to carry an Airbnb-style search bar — family type, children, what's
 * going on — that doubled as the way into the questionnaire. That bar is gone:
 * the questionnaire asks all of it properly on its own screens, so the header's
 * job is now just to keep the single action within reach.
 *
 * The CTA waits until the hero's own button has scrolled off rather than
 * appearing immediately, so the page never shows two of the same action at
 * once. On the wizard and the partner pages it never appears — there it would
 * compete with the screen you are already on.
 *
 * Height is fixed at 72px by the tokens (a 40px control between py-2 rails),
 * which is what --nav-h in globals.css subtracts from a full-viewport screen.
 */
export default function Nav() {
	const scrolled = useScrolledPast(8);
	const pastHeroCta = useScrolledPastElement(HERO_CTA_ID, 72);
	const onLanding = usePathname() === '/';

	return (
		<header
			className={`bg-canvas sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-shadow duration-200 ${
				scrolled ? 'shadow-[0_1px_0_0_var(--color-line)]' : ''
			}`}
		>
			<div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-2 px-2 py-2 lg:px-3">
				<Link href="/" className="display text-d24 shrink-0">
					Kin&amp;d
				</Link>

				<div className="flex shrink-0 items-center gap-1">
					{onLanding && (
						<Link
							href={PLAN_HREF}
							// Kept in the DOM rather than mounted on scroll so the fade has
							// something to animate from, and hidden from the tab order and
							// the pointer while it is invisible.
							tabIndex={pastHeroCta ? undefined : -1}
							aria-hidden={!pastHeroCta}
							className={`bg-ink rounded-pill text-d16 flex items-center gap-1 px-3 py-1 font-medium text-white transition-all duration-200 hover:opacity-90 ${
								pastHeroCta
									? 'translate-y-0 opacity-100'
									: 'pointer-events-none -translate-y-1 opacity-0'
							}`}
						>
							<Icon name="arrow" size={18} />
							Get started
						</Link>
					)}

					<button
						type="button"
						aria-label="Account"
						className="bg-field hover:bg-panel-2 text-ink rounded-pill grid size-5 shrink-0 place-items-center transition-colors"
					>
						<Icon name="user" size={18} />
					</button>
				</div>
			</div>
		</header>
	);
}
