'use client';

import Icon from './Icon';
import { useSearch } from './SearchContext';

export default function FieldChildren() {
	const search = useSearch();

	return (
		<fieldset className="flex flex-col gap-2">
			<legend className="sr-only">Children</legend>

			{search.kids.length === 0 && (
				<p className="text-muted text-d16">
					Add each child&apos;s age — the same moment sounds different at five and at
					sixteen.
				</p>
			)}

			{search.kids.map((kid, i) => (
				<div
					key={kid.id}
					className="border-line flex items-center justify-between gap-2 border-b pb-2 last:border-0"
				>
					<span className="text-d16">Child {i + 1}</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							aria-label={`Decrease age of child ${i + 1}`}
							disabled={kid.age <= 0}
							onClick={() => search.setAge(kid.id, kid.age - 1)}
							className="border-line text-muted hover:border-ink hover:text-ink rounded-pill grid size-4 place-items-center border transition-colors disabled:opacity-30"
						>
							<Icon name="minus" />
						</button>
						<span className="text-d16 w-6 text-center tabular-nums">Age {kid.age}</span>
						<button
							type="button"
							aria-label={`Increase age of child ${i + 1}`}
							disabled={kid.age >= 18}
							onClick={() => search.setAge(kid.id, kid.age + 1)}
							className="border-line text-muted hover:border-ink hover:text-ink rounded-pill grid size-4 place-items-center border transition-colors disabled:opacity-30"
						>
							<Icon name="plus" />
						</button>
						<button
							type="button"
							onClick={() => search.removeKid(kid.id)}
							className="text-muted hover:text-ink text-d16 underline underline-offset-4"
						>
							Remove
						</button>
					</div>
				</div>
			))}

			<button
				type="button"
				onClick={search.addKid}
				className="text-d16 bg-field hover:bg-panel-2 rounded-pill flex items-center gap-1 self-start px-3 py-1 transition-colors"
			>
				<Icon name="plus" />
				{search.kids.length === 0 ? 'Add a child' : 'Add another child'}
			</button>
		</fieldset>
	);
}
