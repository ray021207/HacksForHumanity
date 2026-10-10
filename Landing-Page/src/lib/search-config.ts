/**
 * Plain module, deliberately NOT marked 'use client'.
 *
 * These constants are read by the static page (a server component) and by the
 * interactive header (client components). Exporting them from the client module
 * instead would hand the server a client *reference* rather than the array —
 * `FAMILY_TYPES.map is not a function` at prerender time.
 */

export type Segment = 'family' | 'children' | 'situation';

export const FAMILY_TYPES = [
	'Solo parents',
	'Two moms',
	'Two dads',
	'Step-parents',
	'two-step-parents',
	'Co-parents across two homes',
	'Grandparents'
] as const;

export const SEGMENTS: { id: Segment; label: string; placeholder: string }[] = [
	{ id: 'family', label: "Who's at home", placeholder: 'Choose your family type' },
	{ id: 'children', label: 'Children', placeholder: "Add child's age" },
	{ id: 'situation', label: "What's going on", placeholder: 'Describe your situation here' }
];
