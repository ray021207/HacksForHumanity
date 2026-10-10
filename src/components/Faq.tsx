'use client';

import { useState } from 'react';
import Icon from './Icon';
import Mascot from './Mascot';
import { useKeyDown } from '@/hooks/useKeyDown';

const QUESTIONS: { id: string; q: string; a: string }[] = [
	{
		id: 'what-you-get',
		q: 'What do I actually get?',
		a: 'A few questions about your family, then three to five conversation starters written for the moment you describe: what to ask, phrases to try, and what to listen for. No endless chat thread to manage.'
	},
	{
		id: 'is-this-therapy',
		q: 'Is this therapy?',
		a: 'No. Kin&d is a coach, not a clinician, and it is not crisis support. If someone is in danger, contact your local emergency number or a crisis line first. The plan can wait.'
	},
	{
		id: 'privacy',
		q: 'What happens to what I tell you?',
		a: 'Your questionnaire answers stay in your browser. We do not keep what you write about your child: no situation text, no names, no birthdates. Ages are stored as bands, never exact dates.'
	},
	{
		id: 'family-shape',
		q: 'Does it work for my kind of family?',
		a: 'That is the point of asking first. Raising kids on your own, with a partner, across two homes, with grandparents in the house. The plan changes with the answer instead of assuming one shape.'
	},
	{
		id: 'ages',
		q: 'What ages is it for?',
		a: 'Five to eighteen. The same moment sounds different at five, thirteen, and sixteen, so every question is written for the age of the child you are talking to.'
	},
	{
		id: 'typing',
		q: 'Do I have to type it all out?',
		a: 'You can talk instead. Tap the mic on the last field and describe what happened out loud. It is often easier than finding the words twice.'
	}
];

/**
 * Same interaction as the search bar's segments: one panel open at a time, the
 * chevron turns over, Escape closes. The row carries the bar's own surface and
 * shadow so the FAQ reads as the same family of object.
 */
export default function Faq() {
	const [open, setOpen] = useState<string | null>(null);

	useKeyDown('Escape', () => setOpen(null), open !== null);

	return (
		<section id="faq" className="gap-s2 flex scroll-mt-11 flex-col items-center">
			<div className="gap-s3 flex flex-col items-center text-center">
				<Mascot name="block" size={56} />
				<h2 className="display text-d32 sm:text-d40 max-w-[20ch]">
					Questions parents ask
				</h2>
			</div>

			<ul className="flex w-full max-w-[72ch] flex-col gap-1">
				{QUESTIONS.map((item) => {
					const on = open === item.id;

					return (
						<li key={item.id} className="bg-surface rounded-card shadow-bar">
							<h3>
								<button
									type="button"
									aria-expanded={on}
									aria-controls={`faq-${item.id}`}
									onClick={() => setOpen(on ? null : item.id)}
									className="rounded-card flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
								>
									<span className="text-d16 font-semibold">{item.q}</span>
									<span
										className={`border-line text-muted rounded-pill grid size-5 shrink-0 place-items-center border transition-[rotate,color,border-color] duration-200 ${
											on ? 'border-ink text-ink rotate-180' : ''
										}`}
									>
										<Icon name="chevron" size={18} />
									</span>
								</button>
							</h3>

							<div
								id={`faq-${item.id}`}
								className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
								style={{ gridTemplateRows: on ? '1fr' : '0fr' }}
							>
								<div className="overflow-hidden">
									<p
										className={`text-muted text-d16 max-w-[60ch] px-3 pb-3 transition-opacity duration-200 ${
											on ? 'opacity-100' : 'opacity-0'
										}`}
									>
										{item.a}
									</p>
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
