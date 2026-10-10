'use client';

import { useState } from 'react';
import { useScrollPosition } from './useScrollPosition';

/**
 * True once the element with `id` has scrolled up out of the top `offset`
 * pixels of the viewport — i.e. once it is behind, or above, the sticky header.
 *
 * This is how the header knows the hero's own "Get started" has left the
 * screen, without either component having to guess the other's height. If the
 * element is not on the page at all (any route that has no hero), the answer is
 * true: there is nothing to defer to.
 */
export function useScrolledPastElement(id: string, offset: number) {
	const [past, setPast] = useState(false);

	useScrollPosition(() => {
		const el = document.getElementById(id);
		setPast(el ? el.getBoundingClientRect().bottom < offset : true);
	});

	return past;
}
