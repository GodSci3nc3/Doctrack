# Doctrack - Immigration Case Management Platform

<img src="https://github.com/user-attachments/assets/40c08f1c-bd5b-44bf-a787-63eaa06a4982" style="height: 600px;">

A comprehensive platform designed to streamline and professionalize the workflow of immigration document preparers. Doctrack provides an integrated solution for managing, automating, and efficiently tracking immigration cases and client documentation.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality
- **Client Management**: Comprehensive client profiles with personal, immigration, and contact details
- **Case Tracking**: Complete immigration case lifecycle management with status tracking
- **Document Management**: Secure document upload, storage, and organization using Google Drive integration
- **Authentication**: Secure JWT-based authentication with Google OAuth support
- **Dashboard Analytics**: Real-time insights into case progress and client statistics
- **Automated Workflows**: Streamlined processes for document checklists and case updates

### Security & Integration
- **Google Drive Integration**: Automated document storage and permissions management
- **Supabase Storage**: Reliable cloud storage for sensitive documents
- **Multi-factor Authentication**: Enhanced security with Google OAuth
- **Role-based Access Control**: Secure access management for different user types

## Technology Stack

### Frontend
- **React 18**: Modern UI framework with hooks and functional components
- **Vite**: Fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing and navigation

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Prisma ORM**: Modern database toolkit with type safety
- **PostgreSQL**: Production-ready relational database

### Authentication & Storage
- **JWT**: Secure token-based authentication
- **bcrypt**: Password hashing and security
- **Google OAuth 2.0**: Third-party authentication
- **Google Drive API**: Document storage and management
- **Supabase**: Backend-as-a-Service platform

### Development & Deployment
- **Electron**: Cross-platform desktop application support
- **Vercel**: Serverless deployment platform
- **Docker**: Containerization for development environment
- **ESLint**: Code quality and consistency

## Architecture

Doctrack follows a modern full-stack architecture:

```
Frontend (React + Vite)
    ↓
Backend API (Express.js)
    ↓
Database Layer (Prisma + PostgreSQL)
    ↓
External Services (Google Drive, Supabase)
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Google Cloud Platform account (for Drive API)
- Supabase account

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/GodSci3nc3/Doctrack.git
   cd Doctrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Environment Configuration**
   Create `.env` files in both client and server directories:
   
   **Server `.env`:**
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/doctrack"
   JWT_SECRET="your-jwt-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   SUPABASE_URL="your-supabase-url"
   SUPABASE_ANON_KEY="your-supabase-key"
   ```

4. **Database Setup**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```

## Usage

### Getting Started
1. Access the application at `http://localhost:5173`
2. Register a new account or login with Google
3. Create client profiles with immigration details
4. Manage cases with document checklists
5. Track progress through the dashboard

### Key Workflows

**Client Onboarding:**
1. Create new client profile
2. Upload required documents
3. Set up Google Drive permissions
4. Initialize case tracking

**Case Management:**
1. Create immigration case
2. Define document requirements
3. Track submission deadlines
4. Monitor case status updates

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

## Deployment

### Production Build
```bash
npm run build
```

### Vercel Deployment
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy with automatic CI/CD

### Desktop Application
```bash
npm run build
npm run dist
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed by Arturo Rosales V** - [GitHub](https://github.com/GodSci3nc3) | [Email](mailto:rosalesvelazquezarturo@email.com)

For questions, issues, or collaboration opportunities, please reach out through GitHub or email.