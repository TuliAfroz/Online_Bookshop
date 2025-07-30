# 📚 **Online Bookshop**

**Online Bookshop** is a web application project developed as part of a 2-1 database course. The app allows users to browse, search, and purchase books online, leveraging **Supabase** for backend services.

---

## 🚀 **Features**
- **Browse** a catalog of books
- **Search** books by title, author, or category
- **User Registration & Login**
- **Add to Cart** and **Checkout**
- **Admin Panel** for inventory management
- **Responsive & Modern UI**

---

## 🛠️ **Tech Stack**

| Layer     | Technologies                                                                               |
|-----------|-------------------------------------------------------------------------------------------|
| **Frontend**  | JavaScript, CSS                                                                         |
| **Backend/Database** | Supabase (PostgreSQL, Auth, Storage)                                               |
| **Other Dependencies** | Express , dotenv, cors, body-parser                          |

---

## ⚡ **Getting Started**

### 1️⃣ **Clone the Repository**
```bash
git clone https://github.com/TuliAfroz/Online_Bookshop.git
cd Online_Bookshop
```

### 2️⃣ **Install Dependencies**
Make sure you have **Node.js** and **npm** installed.

```bash
npm install
```
This will install:
- `@supabase/supabase-js`
- `express`
- `dotenv`
- `cors`
- `body-parser`

### 3️⃣ **Set Up Supabase**
- Create a project at [supabase.com](https://supabase.com)
- Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the Supabase **Project Settings**

### 4️⃣ **Configure Environment Variables**
Create a `.env` file in the root directory and add:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5️⃣ **Run the Application**
```bash
# Backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## 💡 **Enjoy Browsing & Shopping for Books Online!**
