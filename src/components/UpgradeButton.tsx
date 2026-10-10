'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * The landing page's way into Stripe Checkout.
 *
 * /api/stripe/checkout creates a Stripe customer keyed to a signed-in user, so
 * it answers 401 to a visitor who has not signed in yet. That is not an error
 * to show — it is the normal path from a public pricing card — so a 401 routes
 * to sign-in with billing as the callback, and the Upgrade button there picks
 * the same flow back up.
 *
 * Deliberately not a <Link>: the checkout URL is minted per session by Stripe,
 * so there is no static href to put in one.
 */
export default function UpgradeButton({
	className = '',
	label = 'Get unlimited'
}: {
	className?: string;
	label?: string;
}) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);

	async function start() {
		setBusy(true);
		try {
			const res = await fetch('/api/stripe/checkout', { method: 'POST' });

			if (res.status === 401) {
				router.push(`/sign-in?callbackUrl=${encodeURIComponent('/account/billing')}`);
				return;
			}

			const data = await res.json();
			if (data?.url) {
				// The only full page load here: Stripe's domain, not ours.
				window.location.href = data.url;
				return;
			}

			// Checkout could not be created (price id unset, Stripe down). Billing
			// is the one screen that can say so properly, so hand off rather than
			// leaving the button spinning.
			router.push('/account/billing');
		} catch {
			router.push('/account/billing');
		} finally {
			setBusy(false);
		}
	}

	return (
		<button type="button" onClick={start} disabled={busy} className={className}>
			{busy ? 'Opening checkout…' : label}
		</button>
	);
}
