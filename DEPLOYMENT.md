# 🚀 FarmConnect Deployment Guide

Because your project is a full-stack application with a separate frontend and backend, you need to deploy them to two different services.

- **Frontend (`client`)**: Deploy to **Netlify**
- **Backend (`server`)**: Deploy to **Render** (or Railway/Heroku)

---

## Part 1: Deploying the Frontend to Netlify

I have already added a `netlify.toml` file to the root of your project. This file automatically configures Netlify to build the `client` folder.

1. Go to [Netlify.com](https://www.netlify.com/) and log in using your GitHub account.
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select **GitHub** as your Git provider.
4. Search for your **`FarmConnect`** repository and select it.
5. You don't need to change any configuration settings! Netlify will read the `netlify.toml` file automatically.
6. Click **Deploy FarmConnect**.
7. Wait a couple of minutes, and Netlify will give you a live URL for your frontend.

---

## Part 2: Deploying the Backend to Render

Your frontend is now live, but it needs a backend to function. We will use [Render.com](https://render.com/) to host the Node.js/Express server.

1. Go to [Render.com](https://render.com/) and log in with GitHub.
2. Click **"New +"** and select **"Web Service"**.
3. Connect your **`FarmConnect`** GitHub repository.
4. Fill out the configuration settings exactly like this:
   - **Name**: farmconnect-backend (or whatever you prefer)
   - **Root Directory**: `server` *(<-- This is very important!)*
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add the exact same variables you have in your local `server/.env` file:
   - `PORT` = `10000`
   - `MONGODB_URI` = *(Your MongoDB Atlas connection string)*
   - `JWT_SECRET` = *(Any random string of characters)*
6. Click **Create Web Service** at the bottom.

---

## Part 3: Connecting the Frontend to the Backend

Once your Render backend finishes deploying, Render will give you a live URL (e.g., `https://farmconnect-backend.onrender.com`). We need to tell the Netlify frontend to use this URL.

1. Go back to your **Netlify** Dashboard.
2. Go to **Site Configuration** > **Environment variables**.
3. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://farmconnect-backend.onrender.com/api` *(Make sure to replace with your actual Render URL and add `/api` to the end)*
4. Go to **Deploys** in Netlify and click **"Trigger deploy"** to rebuild your frontend so it connects to the new backend.

That's it! Your app is now live.
