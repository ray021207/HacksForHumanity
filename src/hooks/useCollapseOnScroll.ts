'use client';

import { useEffect, useRef } from 'react';
import { useScrollPosition } from './useScrollPosition';

type Options = {
	collapsed: boolean;
	setCollapsed: (c: boolean) => void;
	/** Collapse once the page has scrolled this far down. */
	collapseAt?: number;
	/** Expand again once it is back above this. */
	expandAt?: number;
};

/**
 * Collapses the search bar on the way down and re-expands it near the top.
 *
 * Two guards, both load-bearing:
 *
 * 1. Hysteresis — collapse at 96, expand at 48 — so a bar parked exactly on the
 *    threshold doesn't flicker on a trackpad's sub-pixel scroll.
 * 2. A reachability check. Collapsing the header makes the document shorter,
 *    which on a barely-scrollable page clamps `scrollY` back under the expand
 *    threshold, which re-expands the header, which makes the page scrollable
 *    again... Requiring real runway past the collapse point means the state can
 *    never be flipped by the layout change it caused.
 */
export function useCollapseOnScroll({
	collapsed,
	setCollapsed,
	collapseAt = 96,
	expandAt = 48
}: Options) {
	// Mirrors the prop so the scroll callback compares against the value that
	// was last committed rather than one closed over at subscribe time. Synced
	// in an effect, never during render.
	const current = useRef(collapsed);

	useEffect(() => {
		current.current = collapsed;
	}, [collapsed]);

	useScrollPosition((y) => {
		const runway = document.documentElement.scrollHeight - window.innerHeight;
		const hasRunway = runway > collapseAt + expandAt;

		let next = current.current;
		if (hasRunway && y > collapseAt) next = true;
		else if (y < expandAt) next = false;

		if (next === current.current) return;
		current.current = next;
		setCollapsed(next);
	});
}
