import Link from "next/link";

import { SearchRail } from "@/components/search-rail";
import { SiteHeader } from "@/components/site-header";
import { railCounts } from "@/lib/rail-counts";
import {
  CONTACT_EMAIL,
  OPERATOR_NAME,
  OPERATOR_READY,
  POLICY_UPDATED,
} from "@/lib/site-operator";
import { addressed } from "@/lib/site-url";

export const metadata = {
  title: "Privacy — what we collect and why",
  description:
    "What this site collects when you submit a property, what it does not collect when you browse, where it is stored and how to have it removed.",
  ...addressed("/privacy"),
};

const ANALYTICS_ON = Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="group-heading">{title}</h2>
      <div className="mt-2 flex max-w-[70ch] flex-col gap-3 text-base">{children}</div>
    </section>
  );
}

/**
 * Written against what the code actually does, not against a template: the
 * fields listed below are the columns of `listing_submissions`, the third
 * parties are the only two origins a browser contacts, and the "no cookies"
 * claim was checked in a browser rather than assumed.
 */
export default async function PrivacyPage() {
  const clusterCounts = await railCounts();
  const operator = OPERATOR_NAME ?? "the site operator";

  return (
    <>
      <div className="panel:hidden">
        <SiteHeader subtitle="Privacy" />
      </div>

      <div className="shell shell--reading panel:fixed panel:inset-0 panel:overflow-hidden">
        <SearchRail counts={clusterCounts} />

        <main
          id="main"
          tabIndex={-1}
          className="detail-col mx-auto max-w-3xl px-4 py-8 panel:px-8 panel:py-10"
        >
        <h1 className="text-3xl">What we collect, and why</h1>

        {!OPERATOR_READY ? (
          <p className="mt-4 max-w-[70ch] rounded-[10px] bg-[rgba(222,74,95,0.1)] px-3 py-2 text-sm">
            <strong className="font-bold">This page is not finished.</strong> The
            operator and the contact address are not set yet, so there is currently no
            way to make a request. It must not go live in this state.
          </p>
        ) : null}

        <p className="mt-4 max-w-[70ch] text-base text-muted">
          Short version: if you only look at the map, nothing about you is collected. If
          you send us a property, we keep your name and phone number so we can call you
          about it.
        </p>

        <Section title="Who is responsible">
          <p>
            This site is run by {operator}.{" "}
            {CONTACT_EMAIL ? (
              <>
                Questions about anything on this page go to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-action underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </>
            ) : (
              <span className="text-muted">A contact address will be published here.</span>
            )}
          </p>
        </Section>

        <Section title="If you submit a property">
          <p>
            The form at{" "}
            <Link href="/list-your-space" className="text-action underline">
              list your space
            </Link>{" "}
            asks for your name and a phone number, both required, because a listing is
            confirmed by a phone call. An email address and whether you own the property
            are optional. Everything else on that form is about the building, not you.
          </p>
          <p>
            We also store the date you sent it and whether it has been reviewed. There is
            no account and no password, so there is nothing else attached to you.
          </p>
          <p>
            <strong className="font-bold">
              If we accept the property, your name and phone number appear publicly
            </strong>{" "}
            on its listing page, because that is how an interested manager reaches you.
            That is the point of submitting. If you would rather not be named, say so when
            we call and we will not publish it.
          </p>
        </Section>

        <Section title="If you only browse">
          <p>
            Nothing that identifies you. The site sets no cookies, stores nothing in your
            browser, and there is no login to track.
          </p>
          <p>
            Two other services see your IP address, as any site does when your browser
            fetches a file from somewhere else: Google Fonts serves the typeface, and
            OpenFreeMap serves the map tiles. We send them nothing about you beyond the
            request your browser makes.
          </p>
          {ANALYTICS_ON ? (
            <p>
              Visits are counted with Plausible, which sets no cookies and records no
              personal data — a page view and a country, not a person.
            </p>
          ) : null}
        </Section>

        <Section title="What it is used for">
          <p>
            To call you back and check the numbers a manager will filter on, and to put
            the property on the map if you want it there. Nothing else. It is not sold, it
            is not shared with anyone, and it is not used to send you marketing.
          </p>
        </Section>

        <Section title="Where it is kept">
          <p>
            In a Supabase database hosted in Mumbai, so it stays in India. The public site
            can add a submission but cannot read the submissions back — only {operator}
            {" "}can, through an administrative login.
          </p>
        </Section>

        <Section title="How long it is kept">
          <p>
            Submissions are kept until they are reviewed and either published as a listing
            or discarded. We do not currently delete them on a schedule. Ask and we will
            remove yours.
          </p>
        </Section>

        <Section title="What you can ask for">
          <p>
            A copy of what we hold about you, a correction, or deletion. Email{" "}
            {CONTACT_EMAIL ? (
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-action underline">
                {CONTACT_EMAIL}
              </a>
            ) : (
              <span className="text-muted">the address above</span>
            )}{" "}
            from the address you gave us, or tell us the phone number you submitted, and we
            will act on it.
          </p>
        </Section>

        <p className="label mt-8">Last updated {POLICY_UPDATED}</p>
        </main>
      </div>
    </>
  );
}
