MediLink.UI (React Application)

A responsive frontend application built with React, providing interfaces for both patients and clinicians to interact with the MediLink API.
The app supports appointment booking, management, authentication, and clinician workflows.

## Table of Contents
Overview
Architecture
Features
Tech Stack
API Communication
Environment Variables
Running Locally
Project Structure
Authentication Flow
Production Deployment
CI/CD Pipeline
License
## Overview
MediLink.UI is a React-based frontend designed to work with MediLink.API.
It offers separate workflows for:
Patients – schedule, reschedule, cancel appointments
Clinicians – view, complete, and manage appointments
Shared – secure authentication, profile data, etc.
The app uses role-based access control, ensuring that patients and clinicians only access the pages intended for them.
## Architecture
The frontend uses a modular and maintainable structure:
Pages – route-level UI
Components – reusable visual elements
Services – communication with MediLink.API
Context / Hooks – auth state & session handling
Routing – protected routes based on JWT role claims
Architecture Diagram
+-------------------------------+
|        Users / Clinicians     |
|   (Browser - React Frontend)  |
+-------------------------------+
               |
               ▼
+-------------------------------+
|          React App            |
|  (Pages, Components, Routes)  |
+---------------+---------------+
                |
    Uses        | Fetch API Calls
                ▼
+-------------------------------+
|         API Services          |
|   src/services/*.js           |
|  (Fetch wrappers, auth, DTOs) |
+---------------+---------------+
                |
  Sends requests| with JWT tokens
                ▼
+-------------------------------+
|       MediLink.API Backend    |
|  (v1 & v2 appointment APIs)   |
+---------------+---------------+
                |
       Returns JSON responses
                ▼
+-------------------------------+
| State / Context / Hooks       |
| (AuthContext, UserContext)    |
+---------------+---------------+
                |
    Updates UI based on state
                ▼
+-------------------------------+
|       React UI Components     |
| (Forms, Cards, Layout, Alerts)|
+-------------------------------+
## Features
Patient Features
Login
Book, reschedule, or cancel appointments
View upcoming / past appointments
Receive backend email notifications (via Worker Service)
Clinician Features
Login (Clinician role)
View assigned patients
Complete or cancel appointments
Access clinician-only UI pages
Shared Features
JWT authentication
Role-based routing
API error handling
Responsive UI (mobile in progress)
API Communication (Using Fetch API)
The MediLink UI communicates with the backend using native Fetch, not Axios.
Fetch wrappers are stored in:
src/services/
## TechStack
The MediLink.UI React application is built using a modern and scalable frontend stack:
Core Framework
React 18 – Component-based UI library used to build interactive and dynamic interfaces
React Router – Client-side routing and protected routes for authenticated pages
State Management
React Context API – Global auth session, user state, and role management
Custom Hooks – Encapsulated logic for authentication, API calls, form state, and business logic
API Communication
Fetch API – Native browser API used for communicating with MediLink.API
Lightweight wrapper modules inside /src/services
Includes automatic token injection and error handling
Styling & UI
CSS Modules / Standard CSS (based on your project structure)
Responsive design using Flexbox & Grid
Reusable components for forms, cards, and layouts
Build & Tooling
Node.js + npm – Package management and build pipeline
Vite or CRA (depending on your setup — default is Create React App)
Development server for hot reload
Authentication
JWT-based authentication
Access token + refresh token handling
Role-based authorization (patient, clinician)
Deployment & Hosting
Azure Static Web Apps / Azure App Service
GitHub Actions CI/CD pipeline
Environment-based configuration using .env
## Environment Variables
Create a .env file at the project root.
Local development
REACT_APP_API_URL=https://localhost:5001
Production (Azure)
REACT_APP_API_URL=https://medilink-api-bfahgceqd2eyaxbg.uksouth-01.azurewebsites.net
## Running Locally
Install dependencies:
npm install
Start the dev server:
npm start
App runs on:
http://localhost:3000
Production (Azure Static Web App):
https://wonderful-flower-0e96d3203.3.azurestaticapps.net/
## Project Structure
src/
 ├── components/      # Shared reusable UI components
 ├── pages/           # Route pages (Login, Dashboard, etc.)
 ├── services/        # Fetch API services
 ├── context/         # Auth context provider
 ├── hooks/           # Custom hooks
 ├── utils/           # Helper utilities
 └── App.js           # Application entry point
## Production Deployment
The React application is deployed using:
Azure App Service
GitHub Actions CI/CD
Environment variables configured in Azure
Build step:
npm run build
The /build directory is deployed to Azure.
## CI/CD Pipeline
The React UI uses a GitHub Actions CI/CD pipeline to automate build and deployment.
1. Install Dependencies
npm install
2. Build
npm run build
3. Deploy
The /build folder is automatically deployed to Azure App Service.
## Pipeline Diagram
+-----------+      +-------------+      +-----------+
|   Push    | ---> |   Build     | ---> |  Deploy   |
|  to main  |      | (npm run)   |      | to Azure  |
+-----------+      +-------------+      +-----------+
## License
This project is licensed under the [MIT License](LICENSE.md) - see the [LICENSE.md](LICENSE.md) file for details.