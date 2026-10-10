'use client';

import { useEffect, useRef } from 'react';

/**
 * Calls `onScroll` with the current `scrollY` — once on mount, then at most
 * once per frame while the page scrolls.
 *
 * The handler is held in a ref and the listener is attached exactly once. That
 * is the whole point of this hook: a scroll effect that lists its handler's
 * state in the dependency array re-subscribes on every state change, and if the
 * effect also reads the position on mount it calls itself again — React counts
 * that as a runaway update and throws "Maximum update depth exceeded". Reading
 * the latest handler through a ref breaks the cycle without making the handler
 * stale.
 */
export function useScrollPosition(onScroll: (y: number) => void) {
	const handler = useRef(onScroll);

	useEffect(() => {
		handler.current = onScroll;
	}, [onScroll]);

	useEffect(() => {
		let frame = 0;

		function read() {
			frame = 0;
			handler.current(window.scrollY);
		}

		function schedule() {
			// Scroll fires far more often than the screen repaints; the extra
			// reads would be thrown away.
			if (!frame) frame = requestAnimationFrame(read);
		}

		read();
		window.addEventListener('scroll', schedule, { passive: true });
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
		};
	}, []);
}
