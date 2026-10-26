# GOCCI ROOM ♡

A tiny hand-drawn, two-person room.

## Features
- Original hand-drawn SVG avatars: Chiikawa, Hachiware, Usagi (unofficial fan illustrations)
- Quarter-view pastel room with four wallpapers
- Place/remove furniture by dragging with mouse or touch
- Choose your avatar and expression (happy, shy, surprised or sleepy)
- Chat messages appear as speech bubbles above the sender; quick chat phrases included
- Anonymous sign-in and private invite link
- Up to two members per room, enforced in PostgreSQL
- Real-time messages, member changes and room decoration with Supabase
- Mobile layout

## Local setup
1. Run `npm install`.
2. Create a Supabase project. In **Authentication → Providers → Anonymous Sign-ins**, enable anonymous sign-ins.
3. In **SQL Editor**, run [supabase/schema.sql](supabase/schema.sql). **Run this updated SQL again if you already set up the project**, to add the `room_members.character` and `room_members.mood` columns and update policy.
4. Copy `.env.example` to `.env.local` and enter your project URL and publishable/anon key (never use service_role key).
5. Run `npm run dev` and open http://localhost:3000.
6. Create a room, copy the invite link and open it on another browser/device.

Without Supabase credentials, the site shows a local preview. Chat and room data are **not shared** in preview mode; local avatar and mood selections are saved in this browser only. In a connected room each member's avatar and mood are saved in Supabase and shown to both members.

## Deployment
Import this GitHub repository into Vercel. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables, then deploy. The site is not deployed by merely pushing code to GitHub.

## Notes
- Room access is limited to two signed-in anonymous accounts. A room URL is an invitation secret; share it only with someone you trust.
- Only the room creator may persist room decoration changes.
- Supabase Realtime must be enabled for the tables (the SQL migration adds them to the publication).
- Anonymous sessions persist in a browser; clearing storage creates a new identity and may fill a room's second seat. Account recovery, leaving/kicking members, moderation, rate limiting and production security review are future work.
- This repository uses original SVG illustrations, not copyrighted third-party character assets.

## Characters and fan art
Avatar drawings are original inline SVG created for this unofficial two-person fan project; they do not load official character assets. Review rights and permissions before publicly distributing a site featuring copyrighted characters or branding. This project is not endorsed by the character creators.
