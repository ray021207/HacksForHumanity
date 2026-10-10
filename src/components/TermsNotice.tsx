'use client';

import { useState } from 'react';

const POINTS = [
	'No chat. A short questionnaire once, then cards for each situation.',
	'Your answers stay in your browser, never on our server.',
	'We never store what you describe, your child’s name, or their birthdate.',
	'Dangerous situations get crisis resources instead of generated cards.',
	'AI-generated, not therapy or medical advice.'
];

/**
 * The terms line, and the sheet behind it.
 *
 * This used to be a welcome screen standing between "Get started" and the
 * first question. Agreeing is still an explicit act, it just happens on the
 * step that already has a forward button instead of on a screen whose only
 * job was to hold one.
 */
export default function TermsNotice({ action = 'Continue' }: { action?: string }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<p className="text-muted text-d16 text-center">
				By clicking {action} you agree to the{' '}
				<button type="button" onClick={() => setOpen(true)} className="underline">
					terms and conditions
				</button>
				.
			</p>

			{open && (
				<div
					className="bg-ink/40 animate-fade-in fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-3"
					onClick={() => setOpen(false)}
				>
					<div
						className="bg-surface rounded-t-card sm:rounded-card animate-pop-in max-h-[80vh] w-full max-w-[560px] overflow-y-auto p-3"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 className="display text-d24">Terms and conditions</h2>

						<ul className="text-muted text-d16 mt-2 list-disc space-y-1 pl-3">
							{POINTS.map((point) => (
								<li key={point}>{point}</li>
							))}
						</ul>

						<button
							type="button"
							onClick={() => setOpen(false)}
							className="bg-ink rounded-pill text-d16 mt-3 w-full py-2 font-medium text-white transition-opacity hover:opacity-90"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</>
	);
}
