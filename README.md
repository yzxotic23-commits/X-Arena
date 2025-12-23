# X Arena - Gamified Dashboard

A fully functional, gamified **X Arena** dashboard website - a Contribution Showcase and Growth Incentive Platform built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## 🎮 Features

- **Personal Contribution Overview**: Total score, level badges (Bronze/Silver/Gold/Platinum), ranking, and progress tracking
- **Contribution Breakdown**: Interactive pie chart showing Deposit, Retention, Activation, and Referral scores
- **Squad Contribution**: Squad comparisons, gap analysis, and personal share visualization
- **Target & Progress**: Circular progress indicators, completion rates, and execution pace tracking
- **Ranking & Incentive Module**: Scrollable leaderboard with category tops and rankings
- **Time Filters**: Daily, Weekly, Monthly, and Custom time range filtering
- **Real-time Updates**: Auto-refresh every 30 seconds with manual refresh option
- **Responsive Design**: Mobile-first, desktop-optimized layout

## 🎨 Design Theme

- **Black + Red Gaming Theme**: Dark mode base with vibrant red accents
- **Gamification Effects**: Neon glows, particle effects, smooth animations
- **Futuristic Fonts**: Orbitron for headings, Inter for body text
- **Interactive Elements**: Hover effects, count-up animations, progress fills

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS with custom black/red theme
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React
- **State Management**: TanStack Query for data fetching
- **UI Components**: Custom components with shadcn/ui patterns

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
├── app/
│   ├── api/
│   │   └── data/
│   │       └── route.ts          # Mock API endpoint
│   ├── globals.css               # Global styles with theme
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── BreakdownChart.tsx        # Contribution breakdown pie chart
│   ├── FilterButtons.tsx         # View filter buttons
│   ├── Header.tsx                # Dashboard header with controls
│   ├── LeaderboardTable.tsx      # Ranking table
│   ├── PersonalOverview.tsx      # Personal contribution hero card
│   ├── SquadCompare.tsx          # Squad comparison components
│   └── Targets.tsx               # Target & progress components
├── lib/
│   ├── mockData.ts               # Mock data generator
│   └── utils.ts                   # Utility functions
└── types/
    └── index.ts                  # TypeScript interfaces
```

## 🎯 Usage

### Viewing Dashboard

The dashboard is accessible at the root URL. You can filter by user ID using query parameters:

- `?userId=123` - View data for user 123
- Default user ID is `123`

### Time Filters

- **Daily**: Shows daily contribution data
- **Weekly**: Shows weekly aggregated data
- **Monthly**: Shows monthly aggregated data
- **Custom**: Placeholder for custom date range (future implementation)

### User Selection

Click the user selector in the header to switch between different users:
- User 123
- User 456
- User 789
- User 101

### Refresh Data

- Click the "Refresh" button to manually update data
- Data auto-refreshes every 30 seconds
- Mock data is randomized on each refresh

## 📊 Data Model

The dashboard uses mock data that simulates:
- Personal contribution scores and rankings
- Squad comparisons and status
- Target completion and progress
- Leaderboard rankings with category tops

All data is generated dynamically and updates on refresh.

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.ts` to customize colors:
- Primary red: `#FF0000`
- Primary dark: `#CC0000`
- Background: Black gradient

### Animations

Animations are handled by Framer Motion. Adjust timing and effects in component files.

## 🚢 Deployment

This project is ready for deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

Or build locally:
```bash
npm run build
npm start
```

## 📝 License

Private project - All rights reserved

## 🎮 Future Enhancements

- Real API integration
- WebSocket support for real-time updates
- Custom date picker for time filters
- User authentication
- Database integration
- Advanced analytics
- Export functionality

---

Built with ❤️ for X Arena

