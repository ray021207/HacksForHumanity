const TERMS: { title: string; copy: string }[] = [
	{
		title: 'Not therapy, not medical advice',
		copy: 'Kin&d is a self-help tool for everyday parenting conversations. It does not provide medical, psychological, psychiatric, or any other professional health care advice, diagnosis, or treatment, and using it does not create a therapist-client, doctor-patient, or other professional relationship. If your family is working with a clinician, their guidance comes first.'
	},
	{
		title: 'The suggestions are generated',
		copy: 'Conversation starters are written by an AI model from what you type. They can be wrong, incomplete, or a poor fit for your child, and they are not reviewed by a person before you see them. You know your family. Read anything we hand you with that in mind, and skip whatever does not sound like you.'
	},
	{
		title: 'What you type, and where it goes',
		copy: 'Your answers are kept in your own browser, and we ask for no last names and no birthdates. What you write to get a plan is sent to our AI provider so it can be generated. Please leave out names, addresses, schools, and anything else you would not want handled by a third party.'
	},
	{
		title: 'Who this is for',
		copy: 'Kin&d is for parents and caregivers aged 18 or over. It is not designed for children to use, and it is not a monitoring, reporting, or safeguarding service. Nothing you enter is seen or acted on by a human at Kin&d.'
	},
	{
		title: 'No guarantees',
		copy: 'The service is provided as is, without warranties of any kind. We cannot promise any particular outcome from a conversation, and to the fullest extent the law allows, Kin&d is not liable for decisions made on the basis of what it suggests.'
	},
	{
		title: 'This page is not advice either',
		copy: 'These notes describe how Kin&d is meant to be used. They are not a contract and they are not legal advice. Where local law gives you rights that this text appears to limit, your rights win.'
	}
];

/**
 * The long-form disclaimer, sitting below the footer on every route.
 *
 * It is deliberately legible rather than hidden in six-point grey: the product
 * sits next to a real clinical need, and the two things a parent most needs to
 * know — this is not therapy, and in an emergency go elsewhere first — should
 * be readable without squinting. Hence body-sized type, the same 16px floor as
 * everywhere else, and the emergency line pulled out above the columns instead
 * of buried in them.
 *
 * The wording is a plain-English starting point, not reviewed copy. Anything
 * shipped to real families should go past a lawyer in the relevant
 * jurisdictions first.
 */
export default function LegalDisclaimer() {
	return (
		<aside aria-label="Legal disclaimer" className="border-line bg-field border-t">
			<div className="gap-s3 py-s2 mx-auto flex w-full max-w-[1360px] flex-col px-2 lg:px-3">
				<h2 className="display text-d24 lg:text-d32">Please read this part</h2>

				{/* The one line that cannot afford to be skimmed, so it gets a
				    surface of its own and the accent rule down the side. */}
				<p className="bg-surface border-accent rounded-field text-d16 max-w-[80ch] border-l-4 p-3">
					<strong className="font-semibold">
						If someone is in immediate danger, or your child is talking about hurting
						themselves, close this and call your local emergency number.
					</strong>{' '}
					In the US you can also call or text 988 to reach the Suicide &amp; Crisis
					Lifeline, any hour of any day. Kin&amp;d is not an emergency service and
					nobody here sees what you write.
				</p>

				<dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{TERMS.map((term) => (
						<div key={term.title} className="flex flex-col gap-1">
							<dt className="text-d16 font-semibold">{term.title}</dt>
							<dd className="text-muted text-d16 max-w-[52ch]">{term.copy}</dd>
						</div>
					))}
				</dl>

				<p className="text-muted text-d16 border-line border-t pt-3">
					Not therapy. Just a gentle place to start.
				</p>
			</div>
		</aside>
	);
}
