# Iron Temple Desk (demo)

A simple gym desk for small gyms, being tried out with Iron Temple Gym, Alankar.

It covers five things and nothing else:

1. **Today**: who has stopped coming, whose plan ends in the next 10 days, who owes money, and who didn't renew last month.
2. **Check-in**: the trainer taps a name when a member walks in.
3. **Members**: add a member, renew a plan, record dues, see 4 weeks of attendance.
4. **Workout routine**: each member has a routine (beginner, fat loss, push/pull/legs, general). The trainer ticks off today's exercises. The next workout follows the member's visits, so a missed day doesn't skip a workout.
5. **WhatsApp reminders**: ready-made messages in Kannada or English, sent from the gym's own WhatsApp. No SMS credits.

## About the demo

- It opens with sample members. The headline numbers (active members, dues) are modelled on Iron Temple's current app.
- Everything is saved in the phone's browser only. Nothing is sent to a server. **Settings → Reset demo data** starts it fresh.
- Sample members have no phone numbers, so WhatsApp asks you to pick a contact. Members you add with a number open their chat directly.
- On Android, Chrome menu → **Add to Home screen** puts it on the phone like an app.

## Not built yet

- Data shared between the owner's and trainer's phones (needs a small backend)
- A member's own view of their routine
- QR check-in at the door
- Importing members from the current app's Excel export

## Run locally

It's plain HTML, CSS and JavaScript with no build step. Open `index.html` through any static server, e.g. `python3 -m http.server`.
