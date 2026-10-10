'use client';

import { useState } from 'react';
import { useScrollPosition } from './useScrollPosition';

/**
 * True once the page has scrolled past `threshold`. Used for the hairline under
 * the header, which should appear the moment the canvas starts moving.
 */
export function useScrolledPast(threshold: number) {
	const [past, setPast] = useState(false);

	useScrollPosition((y) => setPast(y > threshold));

	return past;
}
