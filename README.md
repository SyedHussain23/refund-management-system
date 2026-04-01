# 🚀 Refund Management System

A production-grade refund request platform built using Next.js and Supabase, designed to simulate a real-world internal operations tool with clean architecture and scalable design.

---

## 🧠 Overview

This system allows users to submit refund requests with validation, conditional business logic, file uploads, and persistent storage.

It is designed to reflect how real-world operational tools are built — focusing on reliability, usability, and structured workflows rather than just UI.

---

## ✨ Key Features

### 📝 Refund Request Form
- Fully validated input fields  
- Clear separation of required and optional data  
- Real-time validation feedback  

### ⚠️ Business Logic Handling
- Automatic 90-day eligibility detection  
- Conditional warning banner display  
- Prevention of invalid future dates  

### 📎 File Upload System
- Supports image and PDF uploads  
- Secure storage using Supabase Storage  
- Clean file preview (non-intrusive UI)  
- File linked to database records  

### 💾 Data Persistence
- Data stored in Supabase PostgreSQL  
- Each submission is retrievable  
- File URL stored alongside record  

### 📊 Submission Summary
- Displays actual submitted data  
- Structured confirmation view  
- Reset flow for multiple submissions  

### 🛠 Admin Dashboard
- View all submitted refund requests  
- Clean tabular layout  
- Useful for operations review  

### 📱 Responsive Design
- Fully optimized for mobile screens  
- Tested using browser device simulation  
- Consistent spacing and alignment  

### 🌙 Theme Support
- Light and dark mode support  
- Smooth UI transitions  

---

## 🏗️ Tech Stack

- **Frontend:** Next.js (App Router)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS + Custom UI system  
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

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

---

## ⚙️ Getting Started

Install dependencies:

```
npm install
```

Run the app:

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🚀 Deployment (Vercel)

1. Push project to GitHub  
2. Import repository into Vercel  
3. Add environment variables  
4. Deploy  

---

## 📌 Engineering Focus

This project demonstrates:

- Clean component-based architecture  
- Real-world form handling and validation  
- Backend integration with database and storage  
- Thoughtful UX and interaction design  
- Maintainable and scalable code structure  

---

## 🧪 Edge Cases Covered

- Invalid email formats  
- Missing required fields  
- Future booking dates blocked  
- 90+ day conditional logic  
- File upload validation and preview handling  

---

## 📈 What This Project Represents

This is not a template-based UI project.  
It reflects a practical understanding of building production-ready applications with:

- Functional backend integration  
- Business logic implementation  
- Clean UI/UX decisions  
- Real-world usability considerations  

---

## 📬 Contact

🔗 LinkedIn:  
https://www.linkedin.com/in/syed-hussain-abdul-hakeem  

🔗 GitHub:  
https://github.com/SyedHussain23  

---

## ⭐ Final Note

Built with a focus on clarity, usability, and real-world engineering practices.
