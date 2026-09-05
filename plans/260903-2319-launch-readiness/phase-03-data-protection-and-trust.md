# Phase 03 — Data protection and public trust

**Blocks launch:** yes · **Depends on:** — · **Owner:** shared

## Why

`/list-your-space` collects a name, a phone number and optionally an email from
brokers and owners, and writes them to `listing_submissions`. The build output's
route list contains no privacy or terms page, so the site takes personal data
and says nothing about what happens to it.

India's DPDP Act is in force and this is a commercial site collecting personal
data from Indian residents. **I am not qualified to tell you what it requires of
you** — treat this phase as "get advice and then publish something", not as a
compliance checklist I can sign off.

## Requirements

- A privacy page: what is collected, why, where it is stored, how long, how to
  ask for deletion, who to contact.
- A link to it from the submission form, near the submit button.
- A real contact route for the business — for a brokerage taking enquiries,
  visitors reasonably expect to know who they are dealing with.

## Decision needed from you

- The operating identity: a person, a firm, a registered company?
- A contact email or number for data requests.
- Whether to take advice before publishing. My recommendation is yes.

## Files

- Create: `src/app/privacy/page.tsx`
- Modify: `src/components/add-space-form.tsx` — link above the submit button
- Modify: `src/components/site-header.tsx` or the About page — footer link
- Modify: `src/app/sitemap.ts` — include `/privacy`

## Steps

1. Settle the operating identity and contact route.
2. Draft the privacy page against what the code actually does — the schema is
   the source of truth: `contact_name`, `contact_phone`, `contact_email`,
   `is_owner`, plus the property fields.
3. Link it from the form and from About.
4. State retention honestly. Right now submissions are kept indefinitely and
   reviewed by hand; say that, or change it.

## Validation

```bash
curl -s -o /dev/null -w "%{http_code}" https://<domain>/privacy
```

Form shows the link before submit. Page reachable without JavaScript.

## Risks

- **Writing law-shaped copy I am not qualified to write.** I can describe
  accurately what the system does; I cannot tell you that description satisfies
  the DPDP Act. Get it checked.
- **Over-promising deletion.** Do not claim a deletion workflow that does not
  exist — there is no admin surface beyond the Supabase table editor, by design.

## Rollback

Remove the route and links. No data involved.
