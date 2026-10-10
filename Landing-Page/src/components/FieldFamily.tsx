'use client';

import { useSearch } from './SearchContext';
import { FAMILY_TYPES } from '@/lib/search-config';

export default function FieldFamily() {
	const search = useSearch();

	return (
		<fieldset className="flex flex-col gap-2">
			<legend className="sr-only">Who&apos;s at home</legend>
			<p className="text-muted text-d16">
				Pick the one closest to your house. You can change it later.
			</p>
			<div className="flex flex-wrap gap-1">
				{FAMILY_TYPES.map((type) => {
					const on = search.familyType === type;
					return (
						<button
							key={type}
							type="button"
							aria-pressed={on}
							onClick={() => search.setFamilyType(on ? null : type)}
							className={`text-d16 rounded-pill px-3 py-1 transition-colors ${
								on ? 'bg-blush text-blush-ink' : 'bg-field text-ink hover:bg-panel-2'
							}`}
						>
							{type}
						</button>
					);
				})}
			</div>
		</fieldset>
	);
}
