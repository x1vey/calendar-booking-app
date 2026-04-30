# Multi-User Slack Integration Plan

This document outlines the architecture and implementation steps to allow any user on your platform to connect their Slack workspace and use native commands like `/meeting` for internal team collaboration.

---

## 1. High-Level Architecture
To support multiple users, we move from a static manual webhook to a **Dynamic OAuth-based app**.

1.  **Onboarding:** A user clicks "Connect Slack" in their settings.
2.  **Authorization:** They grant permission to your Slack App via the official OAuth flow.
3.  **Persistence:** Your app stores the `slack_access_token` and `slack_team_id` in the `user_settings` table.
4.  **Interaction:** When someone types `/meeting` in that user's workspace, Slack hits your API with the `team_id`. You look up the relevant host and handle the request.

---

## 2. Component Breakdown

### A. Database Updates (Supabase)
We need to store Slack credentials for each host.
- **Table:** `user_settings`
- **New Columns:**
    - `slack_access_token` (Text, Secret)
    - `slack_team_id` (Text, Unique per workspace)
    - `slack_bot_user_id` (Text)
    - `slack_channel_id` (Text, For default notifications)

### B. Slack OAuth Flow
Instead of a URL paste, we use a button:
1.  **Route `/api/slack/connect`**: Redirects the user to `slack.com/oauth/v2/authorize`.
2.  **Route `/api/slack/callback`**: 
    - Receives `code` from Slack.
    - Exchanges `code` for `access_token` via `https://slack.com/api/oauth.v2.access`.
    - Saves the token to the logged-in user's profile in Supabase.

### C. The Slash Command (`/meeting`)
Configured in the Slack App Manifest:
- **Command:** `/meeting`
- **Request URL:** `https://your-domain.com/api/slack/command`
- **Functionality:** 
    1.  Verify the `X-Slack-Signature` for security.
    2.  Identify the host using `team_id`.
    3.  Open a **Slack Modal** using `views.open` with the host's booking options.

### D. The Interactive Modal (The "Speed Booker")
A popup window inside Slack built with **Block Kit**:
- **Date Picker:** Selection of the meeting day.
- **Dropdown:** Select from the user's active `calendars` (e.g., "Intro Call", "Demo").
- **Time Selection:** Dynamically populated based on your existing availability engine.
- **Input Fields:** Booker Name and Email.

---

## 3. Implementation Roadmap

### Phase 1: App Creation
- Register a New App on [api.slack.com](https://api.slack.com).
- Define Scopes: `commands`, `incoming-webhook`, `chat:write`, `modals:open`.
- Get **Client ID**, **Client Secret**, and **Signing Secret**.

### Phase 2: Backend foundation
- Run SQL migrations for Slack columns.
- Implement the OAuth redirect and callback routes.
- Add the "Connect Slack" button to `AccountSettingsForm.tsx`.

### Phase 3: The Interaction Engine
- Implement `/api/slack/command` to open the selection modal.
- Implement `/api/slack/interactions` to handle "Submit" from the modal.
- Connect the modal submission to your existing `createBooking` logic.

### Phase 4: Branding & Polish
- Add your platform's logo and branding to the Slack bot profile.
- Implement "Claimed by @user" button updates for better team transparency.

---

## 4. Security Requirements
- **Verification:** Every request from Slack MUST be verified using your `SLACK_SIGNING_SECRET`.
- **Encryption:** (Optional but recommended) Encrypt `slack_access_token` before saving to the database.

---

## 5. Summary of Why This Improves Teamwork
- **Native Context:** No context switching. Teams stay in Slack.
- **Transparency:** Booking events are broadcast to the channel so the whole team is aware of incoming leads.
- **Speed:** Drastically reduces the time to book an internal or client call.

---
*Created by Antigravity - Ready for implementation whenever you are.*
