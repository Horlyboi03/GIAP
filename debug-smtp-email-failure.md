# Debug Session: smtp-email-failure
- **Status**: [OPEN]
- **Issue**: SMTP email delivery no longer sends registration, application, or status emails.
- **Debug Server**: http://127.0.0.1:7777/event
- **Log File**: .dbg/trae-debug-log-smtp-email-failure.ndjson

## Reproduction Steps
1. Start the backend with the current environment configuration.
2. Trigger a known email path such as registration, application submission, or application approval.
3. Observe whether the request succeeds and whether an email is received.
4. Review `.dbg/trae-debug-log-smtp-email-failure.ndjson` for runtime evidence.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | SMTP configuration values are missing or not being loaded into Flask config at runtime. | High | Low | Pending |
| B | SMTP connection/authentication is failing during `mail.send(...)`. | High | Low | Pending |
| C | Email code path is not being reached for the triggered actions. | Medium | Low | Pending |
| D | The mail send succeeds but database logging/commit rollback makes the request appear broken. | Medium | Medium | Pending |
| E | The backend process is running with stale env values after recent config changes. | Medium | Low | Pending |

## Log Evidence
- Registration flow reached email helper.
- `_send_email` loaded `smtp.office365.com`, port `587`, TLS `true`, and sender `giapteam@outlook.com`.
- `mail.send(...)` raised `SMTPAuthenticationError`.
- No successful `after_mail_send` or `after_log_commit` events were emitted.
- Forgot-password email reproduction failed with the same SMTP auth error, confirming the issue affects all outgoing email flows.

## Verification Conclusion
- Hypothesis A: Confirmed config is loading at runtime.
- Hypothesis B: Confirmed. Outlook rejected SMTP auth with `5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Mailbox`.
- Hypothesis C: Rejected. Registration did call the welcome-email helper.
- Hypothesis D: Rejected for this run. Failure happened before the `EmailLog` commit path.
- Hypothesis E: Rejected for this run. Restarted backend used the expected Outlook config values.
