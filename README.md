Online Bookshop
Online Bookshop is a web application project developed as part of a 2-1 database course. The app allows users to browse, search, and purchase books online, with Supabase used for backend services.

Features
Browse a catalog of books
Search books by title, author, or category
User registration and login
Add books to cart and checkout
Admin panel for inventory management
Responsive and modern UI
Tech Stack
Frontend: JavaScript, CSS
Backend/Database: Supabase (PostgreSQL, Auth, Storage)
Other Dependencies: Express (if API is used), dotenv, cors, body-parser
Getting Started
1. Clone the Repository
bash
git clone https://github.com/TuliAfroz/Online_Bookshop.git
cd Online_Bookshop
2. Install Dependencies
Make sure you have Node.js and npm installed.

bash
npm install
This will install:

@supabase/supabase-js
express
dotenv
cors
body-parser
3. Set Up Supabase
Create a project at supabase.com
Copy your SUPABASE_URL and SUPABASE_ANON_KEY from the Supabase Project Settings
4. Configure Environment Variables
Create a .env file in the root directory and add:

Code
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
5. Run the Application
bash
cd .\Online_Bookshop\
npm run dev
cd .\frontend\
npm run dev
