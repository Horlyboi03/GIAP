# [OPEN] Debug Session: email-not-sending

## Summary
- Symptom: SMTP still does not send a real email after signup.
- Secondary UI request: On the congratulatory page, replace the dashboard action with a logout action after the email issue is diagnosed.

## Initial Hypotheses
1. Office365 SMTP authentication succeeds inconsistently or fails during real send because the configured GIAP mailbox credentials are invalid for that provider.
2. The welcome email code path is reached, but `_send_email` raises an exception and returns `False`.
3. The sender identity is mismatched with the authenticated mailbox, and Office365 blocks delivery.
4. The backend is still running with stale environment values rather than the current Outlook config.
5. The UI button change is unrelated and can be handled separately once the runtime email evidence is collected.

## Evidence Plan
- Instrument the welcome email path and SMTP send path.
- Reproduce a signup email send against the running backend.
- Read debug logs and confirm whether the failure is auth, send, or provider delivery rejection.

## Status
- Waiting for instrumentation and runtime evidence.
