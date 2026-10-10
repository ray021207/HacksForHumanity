'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `onDismiss` when a pointer goes down anywhere outside `ref`, while
 * `enabled`.
 *
 * `pointerdown`, not `click`: a popover should close the instant the user
 * commits to a press elsewhere, and waiting for the release lets a drag that
 * started outside end up looking like an interaction with the open panel.
 */
export function useDismissOnOutsidePointer(
	ref: RefObject<HTMLElement | null>,
	onDismiss: () => void,
	enabled = true
) {
	const latest = useRef(onDismiss);

	useEffect(() => {
		latest.current = onDismiss;
	}, [onDismiss]);

	useEffect(() => {
		if (!enabled) return;

		function onPointerDown(e: PointerEvent) {
			if (!ref.current?.contains(e.target as Node)) latest.current();
		}

		window.addEventListener('pointerdown', onPointerDown);
		return () => window.removeEventListener('pointerdown', onPointerDown);
	}, [ref, enabled]);
}
