# SCSAA Alumni Association Website

**Sidwell, Crook, Stewart Alumni Association (SCSAA)**  
A full-stack web application for Sigma Pi Beta-Gamma alumni to register, pay dues, and access member resources.

---

## Project Overview
This project provides a web platform for alumni of the Sigma Pi Beta-Gamma chapter to:  
- Register and log in securely  
- Pay annual dues with optional processing fees  
- Access a member dashboard to see payment history  
- Admins can view all members and payment statuses  

## Technical Implementation
- Developed a responsive, single-page application (SPA) frontend using React and React Router.
- Implemented a robust, token-based authentication system using Supabase Auth.
- Created custom authentication middleware to secure all sensitive backend endpoints.
- Integrated the Stripe API for secure payment processing of annual dues.
- Designed a system (webbook) to listen to stripe events.

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React + Vite, Tailwind CSS |
| Backend | Node.js + Express |
| Database / Auth | Supabase (PostgreSQL + Auth) |
| Payments | Stripe |