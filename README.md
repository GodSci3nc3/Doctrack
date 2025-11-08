# Doctrack - Immigration Case Management Platform

<div align="center">
  <img src="https://github.com/user-attachments/assets/126e9fea-d876-406d-bc6c-2c5fcf6f3236" style="height: 300px;">
  
  <p align="center">
    <strong>A comprehensive platform designed to streamline and professionalize the workflow of immigration document preparers.</strong>
  </p>
  
  <p align="center">
    <strong>Live Platform:</strong> <a href="https://app.mydoctrack.com">app.mydoctrack.com</a><br>
    <strong>Learn More:</strong> <a href="https://mydoctrack.com">mydoctrack.com</a>
  </p>
</div>

---

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Key Workflows](#key-workflows)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)

## Features

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Client Management</h3>
          <p>Comprehensive client profiles with personal, immigration, and contact details</p>
        </div>
      </td>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Case Tracking</h3>
          <p>Complete immigration case lifecycle management with real-time status tracking</p>
        </div>
      </td>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Document Management</h3>
          <p>Secure document upload and organization with Google Drive integration</p>
        </div>
      </td>
    </tr>
    <tr>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Advanced Security</h3>
          <p>JWT-based authentication with Google OAuth and role-based access control</p>
        </div>
      </td>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 10px; color: white; margin: 10px;">
          <h3>Dashboard Analytics</h3>
          <p>Real-time insights into case progress and comprehensive client statistics</p>
        </div>
      </td>
      <td align="center" width="33%">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; border-radius: 10px; color: #333; margin: 10px;">
          <h3>Automated Workflows</h3>
          <p>Streamlined processes for document checklists and automated case updates</p>
        </div>
      </td>
    </tr>
  </table>
</div>

## Technology Stack

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud">
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white" alt="Electron">
      </td>
    </tr>
  </table>
</div>

## Key Workflows

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #007bff;">

### Client Onboarding
1. **Create Profile** → Register new client with comprehensive immigration details
2. **Document Upload** → Secure upload of required documentation with automatic organization
3. **Drive Integration** → Automatic Google Drive folder creation with proper permissions
4. **Case Initialization** → Set up tracking system for the client's immigration journey

### Case Management  
1. **Case Creation** → Initialize new immigration case with specific visa type and requirements
2. **Document Checklist** → Define and track all required documents with deadlines
3. **Status Tracking** → Real-time updates on case progress through immigration process
4. **Milestone Monitoring** → Automated notifications for critical deadlines and updates

</div>

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/logout` - User logout

### Client Management
- `GET /api/clients` - Retrieve all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get specific client
- `PUT /api/clients/:id` - Update client information
- `DELETE /api/clients/:id` - Remove client

### Case Management
- `GET /api/cases` - Retrieve all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get specific case
- `PUT /api/cases/:id` - Update case status

### Document Management
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/:caseId` - Retrieve case documents
- `DELETE /api/documents/:id` - Remove document

## Project Structure

```
Doctrack/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API communication
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
├── server/                # Backend API server
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Authentication & validation
│   ├── prisma/           # Database schema & migrations
│   ├── routes/           # API route definitions
│   └── services/         # Business logic
├── assets/               # Application resources
└── docs/                # Documentation files
```

## Development

### Code Standards
- ESLint configuration for code quality
- Prettier for consistent formatting
- Conventional commits for version control
- Type checking with PropTypes

### Testing
- Unit tests with Jest
- Integration tests for API endpoints
- End-to-end testing with Cypress

### Database Management
```bash
# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

---

<div align="center">
  <strong>Developed by Arturo Rosales V</strong><br>
  <a href="https://github.com/GodSci3nc3">GitHub</a> | 
  <a href="mailto:rosalesvelazquezarturo@email.com">Email</a>
  
  <p>For questions, issues, or collaboration opportunities, please reach out through GitHub or email.</p>
</div>
