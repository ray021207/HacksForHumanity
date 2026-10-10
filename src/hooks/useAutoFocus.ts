'use client';

import { useEffect, useRef } from 'react';

/**
 * Focuses the returned element once, when `enabled` turns true.
 *
 * Deliberately not the `autofocus` attribute: this only ever runs because the
 * user just opened the thing it focuses, which is the one case a11y guidance
 * allows.
 */
export function useAutoFocus<T extends HTMLElement>(enabled: boolean) {
	const ref = useRef<T>(null);

	useEffect(() => {
		if (enabled) ref.current?.focus();
	}, [enabled]);

	return ref;
}
