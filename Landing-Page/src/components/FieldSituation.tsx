'use client';

import { useEffect, useRef } from 'react';
import Icon from './Icon';
import { useSearch } from './SearchContext';

const PROMPTS = [
	'They stopped talking to me',
	'Bedtime is a fight',
	'Something happened at school',
	'We disagree in front of them'
];

export default function FieldSituation({ autoFocus = false }: { autoFocus?: boolean }) {
	const search = useSearch();
	const field = useRef<HTMLTextAreaElement>(null);

	// Not the `autofocus` attribute: this only ever runs because the user just
	// clicked the segment open, which is the one case a11y guidance allows.
	useEffect(() => {
		if (autoFocus) field.current?.focus();
	}, [autoFocus]);

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="situation" className="sr-only">
				What&apos;s going on
			</label>
			<div className="bg-field rounded-field relative p-2">
				<textarea
					id="situation"
					rows={3}
					ref={field}
					value={search.situation}
					onChange={(e) => search.setSituation(e.target.value)}
					placeholder="She used to tell me everything. Now she goes straight to her room."
					className="placeholder:text-muted text-d16 w-full resize-none bg-transparent pr-6 outline-none"
				/>
				<button
					type="button"
					aria-label="Describe it out loud instead"
					className="border-line bg-surface text-ink hover:border-ink rounded-pill absolute top-2 right-2 grid size-5 place-items-center border transition-colors"
				>
					<Icon name="mic" size={18} />
				</button>
			</div>
			<div className="flex flex-wrap gap-1">
				{PROMPTS.map((prompt) => (
					<button
						key={prompt}
						type="button"
						onClick={() => search.setSituation(prompt)}
						className="text-d16 bg-field hover:bg-panel-2 rounded-pill px-3 py-1 transition-colors"
					>
						{prompt}
					</button>
				))}
			</div>
		</div>
	);
}
