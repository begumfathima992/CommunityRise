import { PASSWORD_RULES } from '../../validation/authSchemas';

/**
 * Live list of password rules, each marked as met or not met.
 * Pass checkEmail={false} where the user's email is not known (reset page).
 */
export default function PasswordChecklist({ id, password = '', email = '', checkEmail = true }) {
  const rules = checkEmail ? PASSWORD_RULES : PASSWORD_RULES.filter((rule) => rule.id !== 'email');
  return (
    <div id={id} className="password-checklist mb-3">
      <p className="mb-1" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
        Your password needs:
      </p>
      <ul className="list-unstyled mb-0">
        {rules.map((rule) => {
          const met = rule.test(password, email);
          return (
            <li key={rule.id} className={met ? 'rule-met' : 'rule-unmet'} data-rule={rule.id} data-met={met}>
              <span aria-hidden="true" className="rule-icon">
                {met ? '✓' : '○'}
              </span>
              {rule.label}
              <span className="visually-hidden">{met ? ' (met)' : ' (not met)'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
