# AI Agent Operating Rules for VibeThink LMS

> [!IMPORTANT]
> **DATABASE CONSTRAINT (CRITICAL)**
> এই প্রজেক্টের ডাটাবেইজ ডাটা সহ ইতিমধ্যে সম্পূর্ণ রেডি এবং ডিজাইন করা আছে। 
> ১. কোনো অবস্থাতেই ডাটাবেইজে নতুন টেবিল, কলাম বা কোনো ডাটা স্ট্রাকচার যুক্ত করা বা মুছা যাবে না।
> ২. প্রজেক্টের সকল নতুন ফিচার বা পরিবর্তন অবশ্যই বিদ্যমান ডাটাবেইজ স্কিমা (Existing Database Schema) অনুযায়ী ডিজাইন এবং ইমপ্লিমেন্ট করতে হবে।
> ৩. নতুন কোনো মাইগ্রেশন ফাইল (migration file) তৈরি করা যাবে না। 

---

## core rules
- **Backend Coding:**
  - Always map Eloquent models to the existing table columns.
  - Bypass missing dependency extensions (like `intl` for number format) using standard PHP functions.
  - Keep route files organized and keep methods auth protected where necessary.

- **Frontend Development:**
  - Keep styling consistent with modern, glassmorphic UI using Tailwind CSS.
  - Ensure tab routing states load correctly and always wait for the auth loading status to finish before redirecting.
