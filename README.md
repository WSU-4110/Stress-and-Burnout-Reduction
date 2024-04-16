# Coolfrog

## Purpose

This website is designed to reduce stress and burnout, specifically among Software Developers.

It does so on three levels:

1. **Personal**: At this level, pages are designed for the individual Software Engineer.
2. **Organizational**: At this level, pages are designed for the Software Engineer within their primary organization.
3. **Global**: At this level, pages are designed for the Software Engineer connecting with all others across the globe.

## Functionalities

### Personal

At this level, pages are designed for the individual Software Engineer.

- [/videopage](https://www.coolfrog.net/videopage): Displays videos for reducing stress and burnout. Can search and like videos. Likes are persistent and global to all users.
- [/article_library](https://www.coolfrog.net/article_library): Displays articles for reducing stress and burnout. Can search and rate articles. Ratings are presistent for each user.
- [/dailyInteractive](https://www.coolfrog.net/dailyInteractive): Presents user with a new activity each day of the week to reduce stress and burnout.
- [/relaxation-sounds](https://www.coolfrog.net/relaxation-sounds): Displays sounds for reducing stress and burnout. Can search, download, and loop sounds.
- [/MeditationSession](https://www.coolfrog.net/MeditationSession): Presents user with guided meditation sessions. User can start, pause, and reset a timer. User can bookmark and unbookmark topics of interest to think about during this session. User can switch theme if they prefer dark mode. User can comment on each session as a personal reflection, which is not persistent and will be cleared when leaving the page for reusability.
- [/timersPage](https://www.coolfrog.net/timersPage): Presents user with timers that can be set. Timers count down and play a sound upon finish. Timers can be started, stopped and reset.
- [/WellnessChallenges](https://www.coolfrog.net/WellnessChallenges): Presents user with challenges they can do whenever they are stressed: they come to this page. Each challenge has a timer that can be started, stopped, and reset.
- [/config](https://www.coolfrog.net/config): User may update their Pronouns, Given, and Last names. User can update and add multiple Emails for the [/meetups](https://www.coolfrog.net/meetups). User can manage all active login sessions to signout old sessions that have not been signed out manually.
- [/goals](https://www.coolfrog.net/goals): Presents user with an easy way to manage their goals. Reduces stress with many views of tasks, by due or completed, everything and categorical. Taks can have priority and times.

### Organizational

- [/meetups](https://www.coolfrog.net/meetups): The meetups forums is a place for Software Engineers within the same organization. Organizations are determined by the email of your account (which means if you set multiple emails in the [/config](https://www.coolfrog.net/config) then you can see multiple organizations). For example, all @intel.com engineers can talk to another on the fourms and create meetups (either in person with a location, or online with a meeting link) which has a title, description and date and time. This makes it easy for Software Engineers to connect with their coworkers in the goal of reducing stress and burnout.

### Global

- [/forums](https://www.coolfrog.net/forums): This is the regular forums, without a meetup feature. Any Software Engineer in the world can make forum topics and all Software Engineers can respond.
- [/forums](https://www.coolfrog.net/meetups): This is the meetup forum, where users can make posts for upcoming meetups that they want to organize, and people can respond affirmatively.
- [/account](https://www.coolfrog.net/account): In addition to other links, this page shows the Weekly and Daily challenge. The Weekly is the most active member challenge, and the Daily is the second most active member challenge ([/challenge](https://www.coolfrog.net/challenge)). As members complete old challenges and new ones arise, they are automatically populated.
- [/challenge](https://www.coolfrog.net/challenge): Software Engineers can create challenges for other website members to do for reducing stress and burnout. The user can see their progress, as well as the entire community of Software Engineers.
- [/leaderboard](https://www.coolfrog.net/leaderboard): This presents the user with a login streak of all users on the website, and see who is the top of the leaderboard.

### Technical

This project is a serverless website that runs on Cloudflare Pages. The website is designed with HTML, CSS, and JavaScript. For non-static portions, designed with Cloudflare Workers, Cloudflare KV (key-value), and Cloudflare D1 (SQL Database). Continuous Integration includes automatic Unit Testing via Jest for JavaScript and Cloudflare Worker modules.

---

Coolfrog © 2024

Group Members: Deboshree Chowdhury, Ali Mehaidli, Jesse Naser, Carlos Nunez, Noah Mousseau
