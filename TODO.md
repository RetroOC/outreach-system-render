# Outreach System TODO

## Rebuild direction
- [ ] Consolidate analysis findings into a short architecture note
- [ ] Lock MVP scope and freeze non-MVP ideas
- [ ] Identify what to rebuild vs reuse
- [ ] Keep rolling build notes with planned vs achieved

## Backend
- [ ] Finalize `outreach-core` service boundaries
- [ ] Finalize Postgres schema
- [ ] Define v1 API routes and payloads
- [ ] Add real provider connectors
- [ ] Harden scheduling, reply ingestion, and suppression flows
- [ ] Add production deployment files and containerization

## Frontend rebuild
- [x] Replace the marketing-first frontend with an operator-facing MVP shell
- [ ] Wire the dashboard to live API endpoints
- [ ] Build campaign builder forms against real backend contracts
- [ ] Add inbox health drilldowns
- [ ] Add reply queue and thread review surface
- [ ] Add reporting views with live data
- [ ] Add error/loading/empty states everywhere

## Delivery + ops
- [ ] Push latest frontend changes to GitHub
- [ ] Deploy latest frontend to Vercel
- [ ] Update recurring progress reminders to use rolling notes
- [ ] Create a single progress log source of truth
