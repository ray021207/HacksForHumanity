'use client';

import { useEffect, useRef } from 'react';

/**
 * Runs `handler` when `key` is pressed anywhere on the page, while `enabled`.
 *
 * The handler lives in a ref, so passing an inline arrow — the normal thing to
 * want at a call site — doesn't tear the listener down and rebuild it on every
 * render.
 */
export function useKeyDown(key: string, handler: () => void, enabled = true) {
	const latest = useRef(handler);

	useEffect(() => {
		latest.current = handler;
	}, [handler]);

	useEffect(() => {
		if (!enabled) return;

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === key) latest.current();
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [key, enabled]);
}
