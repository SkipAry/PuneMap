/**
 * Who is answerable for the data this site collects, and where to reach them.
 *
 * Both are undecided as of 2026-09-04, so they live in env rather than in the
 * copy: a privacy page that names the wrong person is worse than one that
 * admits it is unfinished, and this project has already had to strip invented
 * names out of the listings once.
 *
 * Server-only on purpose - no NEXT_PUBLIC prefix - so the contact address is
 * rendered into the page rather than shipped in the client bundle for a
 * scraper to lift out of the JavaScript.
 */
export const OPERATOR_NAME = process.env.SITE_OPERATOR_NAME ?? null;
export const CONTACT_EMAIL = process.env.SITE_CONTACT_EMAIL ?? null;

/** The privacy page is only finished once both of those are real. */
export const OPERATOR_READY = Boolean(OPERATOR_NAME && CONTACT_EMAIL);

/**
 * Bumped by hand when the policy text changes, not from the build date - a
 * date that moved on every deploy would tell a reader nothing about whether
 * the terms they agreed to have changed.
 */
export const POLICY_UPDATED = "4 September 2026";
