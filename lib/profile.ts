// Server-safe profile completeness check (no client-only imports).
// Mirrors lib/auth-context.tsx#isProfileComplete.
type ProfileLike = {
  school?: string | null;
  phone?: string | null;
  country?: string | null;
  citizenship?: string | null;
  address?: string | null;
  passportId?: string | null;
  graduationYear?: string | null;
  diploma?: string | null;
  idCardFront?: string | null;
  idCardBack?: string | null;
} | null;

export function isProfileComplete(profile: ProfileLike): boolean {
  if (!profile) return false;
  return Boolean(
    profile.school &&
      profile.phone &&
      profile.country &&
      profile.citizenship &&
      profile.address &&
      profile.passportId &&
      profile.graduationYear &&
      profile.diploma &&
      profile.idCardFront &&
      profile.idCardBack,
  );
}
