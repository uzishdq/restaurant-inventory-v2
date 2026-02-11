# 🍽️ Restaurant Inventory Web App

A modern and efficient **restaurant inventory management system** built with **Next.js 16**, **Drizzle ORM**, and **Supabase** — featuring **WhatsApp notifications** via **Fonnte API**.

---

## 🚀 Tech Stack

| Layer              | Technology                                                                   |
| ------------------ | ---------------------------------------------------------------------------- |
| **Framework**      | [Next.js 16 (App Router)](https://nextjs.org)                                |
| **ORM / Database** | [Drizzle ORM](https://orm.drizzle.team) + [Supabase](https://supabase.com)   |
| **Auth & Session** | [Auth.js](https://authjs.dev/)                                               |
| **UI**             | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Notification**   | [Fonnte](https://fonnte.com) – WhatsApp API                                  |
| **Deployment**     | [Vercel](https://vercel.com)                                                 |

---

## 🧭 Overview

This web application helps restaurants manage inventory efficiently, track stock changes, and send **real-time notifications** via WhatsApp when stock is low or updated.

### ✨ Key Features

- 📦 **Product & Stock Management**
  - Add, update, and delete ingredients or menu stock.
  - Track quantity, unit, and supplier.

- 🔔 **WhatsApp Notifications (via Fonnte)**
  - Automatic alerts when stock reaches minimum threshold.
  - Custom notifications when data is added or updated.

- 👥 **User Roles**
  - Super Admin (Full Access)
  - Admin (Restricted Access)
  - Head Kitchen (Restricted Access)
  - Manager (Restricted Access)

- 📊 **Dashboard & Reports**
  - Summary of total items, stock value, and recent changes.

- 🗓️ **Automated Tasks**
  - Vercel Cron Jobs integrated with Fonnte API for daily stock checks.

---
