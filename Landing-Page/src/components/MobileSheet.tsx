'use client';

import { useEffect } from 'react';
import FieldChildren from './FieldChildren';
import FieldFamily from './FieldFamily';
import FieldSituation from './FieldSituation';
import Link from 'next/link';
import Icon from './Icon';
import { useSearch } from './SearchContext';
import { SEGMENTS } from '@/lib/search-config';

export default function MobileSheet() {
	const search = useSearch();
	const { sheetOpen, closeSheet } = search;

	// The page behind the blur must not scroll, or the frosted backdrop slides
	// over content and the whole illusion falls apart.
	useEffect(() => {
		if (!sheetOpen) return;
		document.body.dataset.locked = 'true';

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') closeSheet();
		}
		window.addEventListener('keydown', onKeyDown);

		return () => {
			delete document.body.dataset.locked;
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [sheetOpen, closeSheet]);

	if (!sheetOpen) return null;

	return (
		<div
			className="fixed inset-0 z-100 lg:hidden"
			role="dialog"
			aria-modal="true"
			aria-label="Start a plan"
		>
			<button
				type="button"
				aria-label="Close"
				tabIndex={-1}
				onClick={closeSheet}
				className="bg-canvas/70 animate-fade-in absolute inset-0 backdrop-blur-2xl"
			/>

			<div className="animate-rise-in relative flex h-full flex-col">
				<div className="flex shrink-0 items-center justify-between p-2">
					<button
						type="button"
						onClick={closeSheet}
						aria-label="Close"
						className="bg-surface border-line rounded-pill grid size-5 place-items-center border"
					>
						<Icon name="close" size={18} />
					</button>
					<span className="display text-d24">Kin&amp;d</span>
					<span className="size-5" />
				</div>

				<div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2">
					{SEGMENTS.map((segment) => {
						const on = search.active === segment.id;
						const value = search.valueFor(segment.id);

						return on ? (
							<section
								key={segment.id}
								className="bg-surface rounded-card shadow-pop flex flex-col gap-2 p-3"
							>
								<h2 className="display text-d24">{segment.label}</h2>
								{segment.id === 'family' && <FieldFamily />}
								{segment.id === 'children' && <FieldChildren />}
								{segment.id === 'situation' && <FieldSituation />}
							</section>
						) : (
							<button
								key={segment.id}
								type="button"
								onClick={() => search.open(segment.id)}
								className="bg-surface rounded-card shadow-bar flex items-center justify-between gap-2 px-3 py-2 text-left"
							>
								<span className="text-muted text-d16 shrink-0">{segment.label}</span>
								<span className="text-d16 truncate text-right font-medium">
									{value ?? segment.placeholder}
								</span>
							</button>
						);
					})}
				</div>

				<div className="border-line bg-surface flex shrink-0 items-center justify-between gap-2 border-t p-2">
					<button
						type="button"
						onClick={search.clear}
						className="text-d16 px-2 py-1 font-medium underline underline-offset-4"
					>
						Clear all
					</button>
					<Link
						href="/plan"
						className="bg-accent rounded-pill text-d16 flex items-center gap-1 px-4 py-2 font-medium text-white"
					>
						<Icon name="arrow" size={18} />
						Get plan
					</Link>
				</div>
			</div>
		</div>
	);
}
