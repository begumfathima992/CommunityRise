// The only shape in which a user leaves the API.
export default function serializeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    signup_reason: user.signup_reason,
    role: user.role,
    is_email_verified: user.is_email_verified,
    email_verified_at: user.email_verified_at,
    teaching_updates_opt_in: user.teaching_updates_opt_in,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
  };
}
