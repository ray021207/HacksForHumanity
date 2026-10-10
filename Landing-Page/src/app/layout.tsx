import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Nav from '@/components/Nav';
import { SearchProvider } from '@/components/SearchContext';

// DM Serif Text, downloaded from Google Fonts and committed to src/fonts, so
// the build needs no network for fonts at all.
//
// Google's "latin" subset, which is Basic Latin PLUS General Punctuation
// (U+2000-206F) — so curly quotes and em dashes in a display heading render in
// the face rather than dropping to the Georgia fallback. It does NOT cover
// latin-ext; accented copy would fall back.
const dmSerifText = localFont({
	src: [
		{
			path: '../fonts/dm-serif-text-latin-400-normal.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: '../fonts/dm-serif-text-latin-400-italic.woff2',
			weight: '400',
			style: 'italic'
		}
	],
	variable: '--font-dm-serif-text',
	display: 'swap'
});

// The body sans is deliberately NOT a webfont — see the note in globals.css.

export const metadata: Metadata = {
	title: 'Kin&d — know what to say when it matters',
	description:
		'Personalized guidance for the conversations you want to have with your child.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={dmSerifText.variable}>
			<body className="antialiased">
				<SearchProvider>
					<Nav />
					{children}
				</SearchProvider>
			</body>
		</html>
	);
}
