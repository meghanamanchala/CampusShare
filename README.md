# CampusShare

CampusShare is a hyper-local micro-bulletin board for students, designed to help people on the same campus quickly give away, borrow, buy, or claim items without the noise and friction of general-purpose marketplace groups.

## Problem Statement

Students regularly need or want to move campus-usable items such as books, lab gear, furniture, chargers, and small appliances. Today, those exchanges are usually handled through crowded WhatsApp groups, Facebook Marketplace, Discord servers, or informal chats. Those channels are noisy, hard to search, and often require long back-and-forth coordination.

CampusShare solves this by creating a verified campus-only feed where nearby students can post items, claim them instantly, and complete exchanges with less delay, less waste, and more trust.

## User Context

CampusShare is built for:

- Students living in dorms, hostels, or nearby housing.
- Students moving in or out of campus who need to clear items quickly.
- Students looking for urgent or low-cost items from peers nearby.
- Campus communities that want to reduce waste and improve reuse.

## Key Pain Points

- Campus posts get buried in large public groups and chat threads.
- Existing platforms create friction with repeated messages, negotiations, and off-campus pickups.
- Students want a safer, verified space limited to people from the same university or campus.
- Usable items often get discarded because there is no fast way to reach nearby students.

## Solution Overview

CampusShare provides:

- A campus-only feed for local listings.
- Instant posting with images and item details.
- A simple claim flow for fast pickup coordination.
- Real-time updates so claimed items disappear or are marked unavailable immediately.
- Verified access using university email authentication.

## Tech Stack

| Layer | Tooling | Purpose |
| --- | --- | --- |
| Frontend | React Native | Cross-platform mobile app for iOS and Android |
| State Management | Redux Toolkit | Manage feed state, claim status, and UI updates |
| Backend API | Node.js with Express.js | REST API for authentication, listings, and claims |
| Database | MongoDB Atlas | Store listings, users, categories, and claim metadata |
| Real-time Updates | Socket.io | Push live feed changes when items are posted or claimed |
| Authentication | Firebase Auth | Verify campus email access and restrict the app to approved users |
| Image Storage | Firebase Storage or Amazon S3 | Store and serve uploaded item photos |
| Hosting | Render or Vercel | Deploy the web app or backend services |

## Why This Stack Fits

- React Native keeps the app mobile-first for quick posting on the go.
- Node.js and Express make it straightforward to build the API and claim workflow.
- MongoDB fits flexible item posts with images, categories, and status changes.
- Socket.io supports the immediate, live behavior that a campus bulletin board needs.
- Firebase Auth adds a simple way to keep the network trusted and campus-only.

