'use client';

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode
} from 'react';
import { type Segment } from '@/lib/search-config';

/** `kids`, not `children` — this lives next to React's own `children` prop. */
type Kid = { id: number; age: number };

type SearchStore = {
	familyType: string | null;
	kids: Kid[];
	situation: string;
	active: Segment | null;
	sheetOpen: boolean;
	compact: boolean;
	expanded: boolean;
	setFamilyType: (t: string | null) => void;
	setSituation: (s: string) => void;
	setCompact: (c: boolean) => void;
	setExpandedByUser: (e: boolean) => void;
	open: (s: Segment) => void;
	toggle: (s: Segment) => void;
	close: () => void;
	openSheet: (s?: Segment) => void;
	closeSheet: () => void;
	addKid: () => void;
	removeKid: (id: number) => void;
	setAge: (id: number, age: number) => void;
	clear: () => void;
	valueFor: (s: Segment) => string | null;
	summary: string | null;
};

const SearchCtx = createContext<SearchStore | null>(null);

let nextKidId = 0;

/**
 * One store drives both the desktop bar and the mobile sheet, so a field filled
 * in on a phone that then rotates to tablet width keeps its value — and so
 * `active` can only ever name one open segment across the whole header.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
	const [familyType, setFamilyType] = useState<string | null>(null);
	const [kids, setKids] = useState<Kid[]>([]);
	const [situation, setSituation] = useState('');
	const [active, setActive] = useState<Segment | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [compact, setCompact] = useState(false);
	const [expandedByUser, setExpandedByUser] = useState(false);

	const open = useCallback((s: Segment) => setActive(s), []);
	const toggle = useCallback((s: Segment) => setActive((a) => (a === s ? null : s)), []);
	const close = useCallback(() => setActive(null), []);

	const openSheet = useCallback((s: Segment = 'family') => {
		setSheetOpen(true);
		setActive(s);
	}, []);

	const closeSheet = useCallback(() => {
		setSheetOpen(false);
		setActive(null);
	}, []);

	const addKid = useCallback(
		() => setKids((k) => [...k, { id: nextKidId++, age: 8 }]),
		[]
	);
	const removeKid = useCallback(
		(id: number) => setKids((k) => k.filter((c) => c.id !== id)),
		[]
	);
	const setAge = useCallback(
		(id: number, age: number) =>
			setKids((k) =>
				k.map((c) => (c.id === id ? { ...c, age: Math.min(18, Math.max(0, age)) } : c))
			),
		[]
	);

	const clear = useCallback(() => {
		setFamilyType(null);
		setKids([]);
		setSituation('');
	}, []);

	const value = useMemo<SearchStore>(() => {
		const kidsLabel =
			kids.length === 0
				? null
				: kids.length === 1
					? `Age ${kids[0].age}`
					: `${kids.length} children`;

		const trimmed = situation.trim();
		const situationLabel = !trimmed
			? null
			: trimmed.length > 32
				? `${trimmed.slice(0, 32)}…`
				: trimmed;

		const valueFor = (s: Segment) =>
			s === 'family' ? familyType : s === 'children' ? kidsLabel : situationLabel;

		const parts = [familyType, kidsLabel, situationLabel].filter(Boolean);

		return {
			familyType,
			kids,
			situation,
			active,
			sheetOpen,
			compact,
			// Scrolling back to the top hands control of the bar back to the
			// scroll position, so it collapses again next time down.
			expanded: !compact || expandedByUser || active !== null,
			setFamilyType,
			setSituation,
			setCompact,
			setExpandedByUser,
			open,
			toggle,
			close,
			openSheet,
			closeSheet,
			addKid,
			removeKid,
			setAge,
			clear,
			valueFor,
			summary: parts.length ? parts.join(' · ') : null
		};
	}, [
		familyType,
		kids,
		situation,
		active,
		sheetOpen,
		compact,
		expandedByUser,
		open,
		toggle,
		close,
		openSheet,
		closeSheet,
		addKid,
		removeKid,
		setAge,
		clear
	]);

	return <SearchCtx.Provider value={value}>{children}</SearchCtx.Provider>;
}

export function useSearch() {
	const ctx = useContext(SearchCtx);
	if (!ctx) throw new Error('useSearch must be used inside <SearchProvider>');
	return ctx;
}
