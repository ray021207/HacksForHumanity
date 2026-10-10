'use client';

import { useEffect } from 'react';

/**
 * Freezes the page behind an overlay while `locked` is true.
 *
 * Sets `data-locked` on <body>; globals.css is what actually pins it. Without
 * this the frosted backdrop slides over content as the page scrolls underneath
 * and the whole illusion falls apart.
 */
export function useBodyScrollLock(locked: boolean) {
	useEffect(() => {
		if (!locked) return;
		document.body.dataset.locked = 'true';
		return () => {
			delete document.body.dataset.locked;
		};
	}, [locked]);
}
