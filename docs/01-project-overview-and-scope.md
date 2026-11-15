# 01 — Project Overview & Scope

## 1. Purpose
Korak Digitals is a digital-services marketplace where customers buy and manage digital services from one account.

## 2. Services (customer-facing)
- Airtime
- Data
- VPN (including VPN logs)
- Buy social media accounts
- Boost social media accounts

## 3. Customer pages
Account Overview · Airtime · Data · VPN Logs · Buy Social Media Account · Boost Social Media Account · Transaction History · Orders · Settings · Profile

## 4. Authentication screens
Login · Register · Forgot Password · Reset Password · Verify Device · Session Expired

## 5. Actors
| Actor | Table | Notes |
|-------|-------|-------|
| Customer | `customers` | Registers, logs in, buys services |
| Admin | `admins` | Separate table and guard. Roles/permissions OPEN (not invented) |

No other roles exist until defined.

## 6. Notifications
In-app notifications, dashboard alerts, and email. Designed so future channels can be added without rewriting callers.

## 7. Success criteria (priority order)
1. Security
2. Simplicity
3. Maintainability
4. Scalability
5. Reliability
6. Performance
7. Code quality

When criteria conflict, the higher one wins.

## 8. Non-goals
- No machine learning, datasets, or analytics models.
- No features that were not requested.
- No modular package architecture or domain-driven folders.
- No landing-page styling. The product is an application, not a marketing site.

## 9. Working rules
- Do not guess missing requirements; ask.
- Never invent APIs, tables, roles, or security policies. Anything not specified is marked OPEN.
- Recommend the simplest secure solution and explain trade-offs when several exist.
- Before implementing a page: understand its purpose, identify its security implications, design the simplest solution, reuse components.

## 10. Scalability stance
Build as though more modules will be added: no tight coupling between pages, shared layouts and components, one feature folder per module.
