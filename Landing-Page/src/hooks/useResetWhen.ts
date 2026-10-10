'use client';

import { useEffect, useRef } from 'react';

/**
 * Runs `reset` when `when` turns true.
 *
 * For the small "this flag only makes sense in that state" cleanups that would
 * otherwise sit in a bare `useEffect` with the setter in its dependency array.
 */
export function useResetWhen(when: boolean, reset: () => void) {
	const latest = useRef(reset);

	useEffect(() => {
		latest.current = reset;
	}, [reset]);

	useEffect(() => {
		if (when) latest.current();
	}, [when]);
}
