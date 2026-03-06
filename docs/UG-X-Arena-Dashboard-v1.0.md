# UG - X Arena Dashboard - v1.1

**Status:**

| Section | Content |
|---------|---------|
| **Title** | UG - X Arena Dashboard - v1.1 |
| **Status** |  |
| **Overview** | Summary of the dashboard purpose (gamified, squad vs squad, ranking, customer, targets, PK rules). |
| **Audience** | Business/Squad leads, Handlers, BI/Analysts, Admins, Managers (limited access). |
| **Prerequisites** | Login, browser, role/permissions, data connectivity. |
| **Step-by-Step Guide** | Login → sidebar navigation → Battle Arena, Leaderboard, Customer Listing, Target Summary, Reports, Settings (including PK Score Rules). |
| **Dashboard Links** | Table of main pages and their descriptions. |
| **Key Metrics Explained** | Score, Reactivation, Recommend, Active Member, Deposit, Retention, Cycle, Momentum, Monthly Lead, Target Personal, PK Score Rules, Squad A/B, Category Tops. |
| **FAQ / Troubleshooting** | Data delay, User Management not visible, console fetch, change score weights, theme/language, filter not updating. |

---

## Overview

X Arena is a **gamified dashboard** that provides real-time insights on squad competition, member rankings, customer performance, and targets. It supports two squads (Squad A vs Squad B) with cycle-based and monthly scoring, leaderboards, customer listing (reactivation, retention, recommend), target summary, and configurable PK score rules. The dashboard helps business teams track performance, interpret metrics consistently, and reduce repeated questions through standardized views.

---

## Audience

| Role | Use case |
|------|----------|
| **Business / Squad leads** | Monitor squad vs squad performance, cycle/month scores, momentum |
| **Handlers / Sales** | View leaderboard, personal rank, customer listing, contribution breakdown |
| **BI / Analysts** | Reports, target summary, metrics interpretation |
| **Admins** | User management, target settings, PK score rules, squad/brand mapping, appearance |
| **Managers (limited access)** | Overview, leaderboard, targets, reports, customer listing (no user management) |

---

## Prerequisites

- **Access:** Valid login to X Arena (credentials as provided by admin).
- **Browser:** Modern browser (Chrome, Edge, Firefox, Safari) with JavaScript enabled.
- **Permissions:** Menu visibility depends on role (e.g. managers do not see User Management under Settings).
- **Data:** Dashboard reads from configured Supabase backends; ensure connectivity and that ETL/data refresh schedules are known for “data delay” questions.

---

## Step-by-Step Guide

### 1. Log in and navigate

1. Open the X Arena application URL.
2. Log in with your credentials.
3. Use the **sidebar** to switch between main sections:
   - **Battle Arena** — Squad vs squad live view, achievements, score breakdown, cycle/month overview.
   - **Leaderboard** — Top performers, ranking table, filters (Squad → Personal / Squad → Brand, Month, Cycle, Squad).
   - **Overview** — Personal/squad overview and contribution metrics.
   - **Customer Listing** — Reactivation / Retention / Recommend tabs, add/edit/import customers.
   - **Target Summary** — Targets and progress by squad/period.
   - **Reports** — Squad and performance reports.
   - **Settings** — Target Settings, User Management (admin), PK Score Rules, Squad Mapping, Brand Mapping, Appearance.

### 2. Battle Arena

1. Select **Battle Arena** from the sidebar.
2. Use **Month** and **Cycle** dropdowns (center top) to change period.
3. Review **Recent Achievements**, **Live Feed** (Squad A vs Squad B scores), **Momentum**, **Monthly Lead**, **Total Cycle Score**.
4. Scroll to **Score Breakdown** (cycle vs monthly per squad) and **Monthly Cycle Overview** / **Accumulate Score Overview** charts.

### 3. Leaderboard

1. Select **Leaderboard**.
2. Top section shows **podium** (top 3) with background; bottom section shows full ranking table and **Top Performers by Category**.
3. Use **Squad → Personal** / **Squad → Brand**, **Squad vs Squad** (All / Squad A / Squad B), **Month**, and **Cycle** to filter.
4. Click a row to open **Contribution Summary** (breakdown: deposit, retention, reactivation, referral, repeat days).

### 4. Customer Listing

1. Select **Customer Listing**.
2. Switch tabs: **Reactivation**, **Retention**, **Recommend** (and others if present).
3. Use search/filters; use **Add Customer**, **Import**, or in-cell actions (edit/delete) as permitted.
4. Use **Refresh** if labels depend on current month deposit logic.

### 5. Target Summary & Reports

1. **Target Summary:** Open from sidebar, choose period/squad; review target vs actual and progress.
2. **Reports:** Open Reports, select squad/period; use for net profit, total deposit, total active, and comparative metrics.

### 6. Settings (admin)

1. **Target Settings** — Squad target GGR, balance, daily/single-brand daily requirements.
2. **User Management** — Add/edit users, roles (admin/manager), avatars (if available).
3. **PK Score Rules** — Score Rules (reactivation/recommend/active member points and opponent effect); Traffic Source Rules (add traffic sources, points, effect). Buttons Save/Reset or Save/Cancel appear when there are changes.
4. **Squad Mapping / Brand Mapping** — Map users/brands to squads.
5. **Appearance** — Theme (light/dark), typography, layout density, sidebar, motion.

---

## Dashboard Links

| Page | Description |
|------|-------------|
| Battle Arena | Live squad vs squad, achievements, score breakdown, cycle/month charts |
| Leaderboard | Ranking, podium, top performers by category |
| Overview | Personal/squad contribution and metrics |
| Customer Listing | Reactivation, retention, recommend customer lists |
| Target Summary | Target vs actual, progress by squad/period |
| Reports | Squad and performance reports |
| Settings | Target, users, PK score rules, mappings, appearance |

*(Replace with actual environment URLs if you have separate staging/production links.)*

---

## Key Metrics Explained

| Term | Meaning |
|------|---------|
| **Score** | Composite member score from deposit, retention, reactivation, referral, and repeat-day buckets (weights from Target Personal / PK Score Rules). |
| **Reactivation** | Customers reactivated from old listing; contributes to score. |
| **Recommend** | Referral/recommendation contribution to score. |
| **Active Member** | Active member–related contribution. |
| **Deposit** | Deposit amount / deposit-based metric used in score and reports. |
| **Retention** | Retention metric used in score and leaderboard. |
| **Cycle** | Time window (e.g. Cycle 1–4 per month); used in Battle Arena and Leaderboard. |
| **Momentum** | Current cycle lead (which squad is ahead and by how many points). |
| **Monthly Lead** | Squad leading on monthly total (or “Split” if tie). |
| **Target Personal** | Configurable weights (e.g. deposit_amount, retention, reactivation, recommend, days_4_7 … days_20_more) used to compute member score. |
| **PK Score Rules** | Score Rules: points for Reactivation / Recommend / Active Member and opponent effect (None / Decrease / Increase). Traffic Source Rules: extra sources that add points and optional opponent effect. |
| **Squad A / Squad B** | The two competing squads in the gamified view. |
| **Category Tops** | Top performers per category (e.g. Highest Deposit, Most Referrals, Repeat 4–7 Days, etc.). |

---

## FAQ / Troubleshooting

| Question | Answer |
|----------|--------|
| **Why is data delayed or missing?** | Data is loaded from Supabase. Check ETL/refresh schedule (e.g. nightly). For Leaderboard, ensure target_personal and customer/squad data exist for the selected month/cycle. |
| **Why do I not see User Management?** | User Management is hidden for **manager** role; only admins see it under Settings. |
| **Why does Leaderboard show “Failed to fetch” in console?** | In development, failed fetches (avatars, target personal, squad mappings) are logged as warnings and the app falls back to defaults; check Supabase RLS and connectivity. |
| **How do I change score weights?** | Admins: go to **Settings → PK Score Rules**. Adjust Score Rules (points + opponent effect) and Traffic Source Rules; save. |
| **How do I change theme or language?** | Use **Appearance** in Settings for theme; use the language/theme controls in the header (if available). |
| **Leaderboard / Battle Arena filter not updating?** | Ensure Month/Cycle (and Squad) are selected; refresh the page if data was updated elsewhere. |

---

## Last Updated

**2025-01-30** · X Arena Team

*(Update this date and owner whenever you change the documentation.)*
