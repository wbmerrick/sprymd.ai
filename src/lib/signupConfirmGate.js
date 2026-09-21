export const EMAIL_CONFIRM_NOTICE =
  "Account created. Check your email to confirm — you can keep using your account now.";

/**
 * When Supabase requires email confirmation there is no auth session yet.
 * Navigating in the same turn unmounts SignIn before the notice can paint,
 * so hold on the sign-in screen until the customer continues.
 */
export function resolveSignupNavigation({ needsEmailConfirm = false, returnTo } = {}) {
  const continueTo = returnTo || "account";
  if (needsEmailConfirm) {
    return { leaveSignIn: false, notice: EMAIL_CONFIRM_NOTICE, continueTo };
  }
  return { leaveSignIn: true, notice: "", continueTo };
}
