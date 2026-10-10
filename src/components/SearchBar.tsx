'use client';

import { useRef, useState } from 'react';
import FieldChildren from './FieldChildren';
import FieldFamily from './FieldFamily';
import FieldSituation from './FieldSituation';
import Link from 'next/link';
import Icon from './Icon';
import { useSearch } from './SearchContext';
import { SEGMENTS, type Segment } from '@/lib/search-config';
import { PLAN_HREF } from '@/lib/app-url';
import { useDismissOnOutsidePointer } from '@/hooks/useDismissOnOutsidePointer';
import { useKeyDown } from '@/hooks/useKeyDown';
import { useResetWhen } from '@/hooks/useResetWhen';

export default function SearchBar() {
	const search = useSearch();
	const barRef = useRef<HTMLDivElement>(null);
	const [hovered, setHovered] = useState<Segment | null>(null);

	const { active, close, compact, setExpandedByUser } = search;

	useDismissOnOutsidePointer(barRef, close, active !== null);

	// Escape closes the open segment and hands focus back to the button that
	// opened it, rather than dropping it at the top of the document.
	useKeyDown(
		'Escape',
		() => {
			close();
			barRef.current
				?.querySelector<HTMLButtonElement>(`[data-segment="${active}"]`)
				?.focus();
		},
		active !== null
	);

	// Back at the top of the page the bar is expanded by the scroll position, so
	// the user's own expand is spent.
	useResetWhen(!compact, () => setExpandedByUser(false));

	/** Airbnb hides the rule next to whichever segment is lit up. */
	function dividerHidden(i: number) {
		const left = SEGMENTS[i - 1]?.id;
		const self = SEGMENTS[i].id;
		return [left, self].some((id) => id === search.active || id === hovered);
	}

	if (!search.expanded) {
		return (
			<div className="animate-drop-in flex justify-center">
				<button
					type="button"
					onClick={() => {
						search.setExpandedByUser(true);
						search.open('family');
					}}
					className="bg-surface rounded-pill shadow-bar hover:shadow-pop text-d16 flex items-center gap-2 py-1 pr-1 pl-3 transition-shadow"
				>
					<span className="truncate font-medium">{search.summary ?? 'Start a plan'}</span>
					<span className="bg-accent rounded-pill grid size-4 shrink-0 place-items-center text-white">
						<Icon name="search" size={16} />
					</span>
				</button>
			</div>
		);
	}

	return (
		<div ref={barRef} className="animate-drop-in relative">
			<div
				className={`rounded-pill shadow-bar flex items-stretch p-1 transition-colors duration-200 ${
					search.active ? 'bg-field' : 'bg-surface'
				}`}
			>
				{SEGMENTS.map((segment, i) => {
					const on = search.active === segment.id;
					const value = search.valueFor(segment.id);
					const last = i === SEGMENTS.length - 1;

					return (
						<div key={segment.id} className="relative flex min-w-0 flex-1 items-stretch">
							{i > 0 && (
								<span
									aria-hidden="true"
									className={`bg-line absolute inset-y-2 left-0 w-px transition-opacity duration-150 ${
										dividerHidden(i) ? 'opacity-0' : 'opacity-100'
									}`}
								/>
							)}

							<button
								type="button"
								data-segment={segment.id}
								aria-expanded={on}
								aria-haspopup="dialog"
								onClick={() => search.toggle(segment.id)}
								onPointerEnter={() => setHovered(segment.id)}
								onPointerLeave={() => setHovered(null)}
								className={`rounded-pill flex min-w-0 flex-1 items-center justify-between gap-2 px-4 py-2 text-left transition-colors duration-200 ${
									on
										? 'bg-surface shadow-seg'
										: search.active
											? 'hover:bg-panel-2'
											: 'hover:bg-field'
								}`}
							>
								<span className="flex min-w-0 flex-col">
									<span className="text-d16 font-semibold">{segment.label}</span>
									<span
										className={`text-d16 truncate ${value ? 'text-ink' : 'text-muted'}`}
									>
										{value ?? segment.placeholder}
									</span>
								</span>

								<span
									className={`border-line text-muted rounded-pill grid size-5 shrink-0 place-items-center border ${
										on ? 'border-ink text-ink' : ''
									}`}
								>
									{segment.id === 'family' && <Icon name="chevron" size={18} />}
									{segment.id === 'children' && <Icon name="plus" size={18} />}
									{segment.id === 'situation' && <Icon name="mic" size={18} />}
								</span>
							</button>

							{on && (
								<div
									role="dialog"
									aria-label={segment.label}
									className={`bg-surface rounded-card shadow-pop animate-pop-in absolute top-[calc(100%+16px)] z-10 w-[520px] max-w-[88vw] p-3 ${
										last ? 'right-0' : 'left-0'
									}`}
								>
									{segment.id === 'family' && <FieldFamily />}
									{segment.id === 'children' && <FieldChildren />}
									{segment.id === 'situation' && <FieldSituation autoFocus />}
								</div>
							)}
						</div>
					);
				})}

				<div className="flex shrink-0 items-center pl-1">
					<Link
						href={PLAN_HREF}
						className="bg-accent rounded-pill text-d16 flex items-center gap-1 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
					>
						<Icon name="arrow" size={18} />
						Get plan
					</Link>
				</div>
			</div>
		</div>
	);
}
