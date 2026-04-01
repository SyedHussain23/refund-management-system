```md
# 🚀 Refund Management System

A production-grade refund request platform built with Next.js and Supabase, designed to simulate a real-world internal operations tool.

---

## 🧠 Overview

This system enables users to submit refund requests with proper validation, file uploads, and persistent storage. It includes business logic such as refund eligibility checks and provides a structured workflow similar to enterprise-level applications.

The project focuses on clean architecture, user experience, and real-world functionality rather than just UI demonstration.

---

## ✨ Key Features

### 📝 Refund Request Form
- Full form with validation
- Required and optional fields handled correctly
- Real-time error feedback

### ⚠️ Business Logic
- Automatic 90-day eligibility detection
- Warning banner for late requests
- Future date validation prevention

### 📎 File Upload System
- Supports images (JPG, PNG) and PDF files
- Secure upload via Supabase Storage
- Thumbnail preview for images
- File metadata handling

### 💾 Data Persistence
- All submissions stored in Supabase database
- File URLs linked with records
- Reliable backend integration

### 📊 Submission Summary
- Displays actual submitted data
- Structured confirmation UI
- Reset and re-submit option

### 🛠 Admin Panel
- View all refund records
- Structured table display
- Useful for operations teams

### 📱 Responsive Design
- Fully mobile-friendly layout
- Optimized spacing and usability
- Tested across device sizes

### 🌙 Dark Mode Support
- Toggle between light and dark themes
- Persistent UI styling

---

## 🏗️ Tech Stack

- **Frontend:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom UI
- **Backend:** Supabase (Database + Storage)
- **Deployment:** Vercel

---

## 📁 Project Structure

```

app/
├── page.tsx
├── layout.tsx
├── admin/
components/
├── RefundForm.tsx
├── FormField.tsx
├── SuccessView.tsx
lib/
├── supabase.ts
├── utils.ts
types/
├── index.ts
public/

```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

````

---

## ⚙️ Getting Started

### Install dependencies

```bash
npm install
````

### Run development server

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 🚀 Deployment

This project is deployed using Vercel.

Steps:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

---

## 📌 Design Approach

This project was built with a focus on:

* Clean UI/UX similar to production tools
* Proper separation of concerns
* Scalable component structure
* Real-world business logic implementation
* Error handling and edge case coverage

---

## 🧪 Validation & Edge Cases Covered

* Required field validation
* Email format validation
* Future booking date restriction
* 90-day eligibility logic
* File type and preview handling

---

## 📈 What This Project Demonstrates

* Full-stack application development
* API and database integration
* State management in React
* File handling in web applications
* Responsive UI design principles
* Production-level code organization

---

## 📬 Contact

For any questions or collaboration:

📧 Email: https://www.linkedin.com/in/syed-hussain-abdul-hakeem

🔗 GitHub:https://github.com/SyedHussain23

---

## ⭐ Final Note

This project is built to reflect real-world engineering practices, focusing on usability, scalability, and clean architecture rather than just visual design.

````
