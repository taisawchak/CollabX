# CollabX — Research & Innovation Collaboration Portal

**Port City International University · Department of Computer Science & Engineering**  
*DBMS Sessional (CSE 222)*  
*Tagline:* "Research Ideas · Connect People · Build the Future"  
*Motto:* "Discover · Connect · Collaborate"

---

## 🌟 Overview

CollabX is a comprehensive, production-grade web application where students, faculty researchers, and supervisors discover research areas and funded projects, apply to join laboratories, collaborate across milestones, publish papers, search global scholarly literature, and draft manuscripts using AI assistance.

---

## 👥 Demo User Accounts (1-Click Switcher Available in App)

All accounts can be tested instantly using the **Quick Role Switcher** widget at the bottom right of the screen or via `/login`:

| Name | Role | Email | Specialization |
| :--- | :--- | :--- | :--- |
| **Ash Ketchum** | `student` | `ash@collabx.test` | CSE Undergrad · Machine Learning & PyTorch |
| **Dr. Fahim Rahman** | `supervisor` | `fahim@collabx.test` | Associate Professor & AI Lab Director |
| **Dr. Sarhan** | `supervisor` | `sarhan@collabx.test` | Professor & IoT Solutions Lead |
| **Dr. Nazmul Hossain**| `supervisor` | `nazmul@collabx.test` | Assistant Professor · Cyber Security Lead |
| **Admin CollabX** | `admin` | `admin@collabx.test` | Portal System Moderator & Administrator |

*Demo Password (if logging in manually):* `Password@123`

---

## 📱 Implemented Reference Views (All 20 Screens Pixel-Matched)

1. **Page 1 — Home / Landing (`/`):** Full-bleed hero banner, glass card with H1 3 lines ("Research Ideas", "Connect People", "Build the Future"), pill search bar, yellow "Explore Projects" CTA, 4-metric overlapping stats bar (500+ Projects, 50+ Areas, 1000+ Users, 10+ Departments), Featured Research Areas, Latest Projects, How It Works, Latest Papers, and full 4-column navy Footer.
2. **Page 2 — Research Areas (`/research-areas`):** 4×2 pastel card grid (AI, Data Science, Cyber Security, Web Technologies, IoT, Cloud Computing, Bioinformatics, Others) with live project counts and sub-fields tags.
3. **Page 3 — Projects Listing (`/projects`):** Wide search bar, left filter panel (Research Area, Project Type, Required Skills checkboxes with counts, Status), Sort by dropdown (Latest, Deadline soon, Popular, Best match), and list rows with 140×105 thumbnails, supervisor info, and seat counters.
4. **Page 4 — Project Details (`/projects/:id`):** Faded banner top-right, supervisor card with View Profile and Contact modal, pill tabs (Overview, Requirements, Team, Progress, Discussion, Files), 4 info cards, orange "Apply to Join" modal with motivation & CV upload, Save Project toggle, and similar project recommendations.
5. **Page 5 — Login (`/login`):** Split layout with navy top bar, centered form, show/hide password, green Login button, Google and GitHub buttons, quick 1-click test credentials, and artwork panel.
6. **Page 6 — Register (`/register`):** Full name, email, password with strength meter, role selector radios (Student, Researcher, Supervisor), terms agreement, green Sign Up button, and fade artwork panel.
7. **Page 7 — Student Dashboard (`/dashboard`):** "Welcome" active sidebar, waving Pikachu mascot header, 5 pastel stat cards (Applications, Approved, Pending, Rejected, Saved), Recommended Projects with % match, Recommended Papers, and Upcoming Deadlines.
8. **Page 8 — My Applications (`/applications`):** Filter pills All / Pending / Approved / Rejected with live counts, status pills, and detail drawer with supervisor feedback and Withdraw option.
9. **Page 9 — Saved Projects (`/saved`):** Red filled heart toggle (unsaves with toast), supervisor info, Quick View modal, and View Details navigation.
10. **Page 10 — My Projects (`/my-projects`):** Tabs for Joined Projects, Completed Projects, and Published by Me, seat counts, role badges, and workspace shortcuts.
11. **Page 11 — Profile (`/profile`, `/u/:id`):** Large 116px round avatar, name, headline, institution, 3 stat tiles, research interests chips, technical skills chips, bio, social links, publications list, and **Full Edit Profile Modal with working device photo picker & cartoon avatar selector**.
12. **Page 12 — Researcher Dashboard (`/researcher`):** Dr. header, 4 pastel cards (Projects, Applications, Team Members, Pending in peach with red number), Applications Overview bar chart, Project Status doughnut chart, and Latest applications table with instant Approve / Reject buttons.
13. **Page 13 — Project Discussion (`/projects/:id/discussion`):** 3-pane layout, member conversation list with live search, message bubbles with timestamps, file attachment card (`clinical_dataset_cleaned_v2.zip`), composer with file upload, and real-time response.
14. **Page 14 — Project Progress (`/projects/:id/progress`):** 75% circular SVG ring, Pikachu mascot illustration, milestone checklist (Lit Review 100%, Dataset 100%, Preprocessing 100%, Model Dev 60%, Final Report 0%), Start & End dates, and interactive percentage slider controls for supervisors.
15. **Page 15 — Team / Members (`/projects/:id/team`):** Project Team count (4/5), "+ Invite Member" modal, member cards with role badges (Supervisor, Active), action menu, and "Open Seat" dashed card with Invite button.
16. **Page 16 — Notifications (`/notifications`):** All / Unread / Read tabs, color-coded event cards (approved, rejected, message, deadline, paper), "Mark all as read" button, and delete actions.
17. **Page 17 — Calendar (`/calendar`):** Interactive October 2026 month grid with event dots, today highlight, day selection filter, Upcoming Events list with color-coded icons (meeting, submission, report, presentation), and "+ Add Event" modal.
18. **Page 18 — Admin Dashboard (`/admin`):** System overview 4 stat cards, Project Status breakdown chart, and live activity feed.
19. **Page 19 — Manage Projects (`/admin/projects`):** All / Pending / Approved / Rejected tabs, table with thumbnail, area, supervisor, status pill, and 4 icon actions (View, Edit, Approve/Reject, Delete with confirmation modal).
20. **Page 20 — Manage Users (`/admin/users`):** All / Students / Researchers / Admins tabs, user management table with status toggles, "+ Add User" modal, edit modal, and CSV export.

---

## 🚀 Advanced Extra Modules

- **Global Scholarly Literature Search (`/search`, Ctrl+K):** Real-time integration querying OpenAlex and arXiv scholarly APIs (with graceful offline fallback cache), rendering paper citations, DOIs, and direct open-access PDF links.
- **AI Research Paper Writer (`/ai-writer`):** Multi-step wizard generating academic outlines, section drafting (Abstract, Intro, Literature Review, Methodology, Results, Conclusion, References), reference verification against Crossref/OpenAlex, rich text editor, Markdown export, and 1-click publishing to CollabX as an "AI-Assisted Draft" paper.
- **Research Papers Library (`/papers`):** In-browser PDF reader modal, formatted citation generator (APA, IEEE, BibTeX copy with 1-click), likes counter, download counter, and Upload Paper modal.
- **Publish Project Wizard (`/projects/new`):** Multi-step form with problem statement, objectives, eligibility criteria, and thumbnail selection.
- **About & Contact Support (`/about`, `/contact`, `/faq`):** University mission, FAQ accordion, academic integrity policy, contact form submitting to persistent storage, and admin response inbox.
- **Full 4-Column Navy Footer on Every Page:** Includes newsletter subscription with email validation, social channels, office hours, and university credits.
