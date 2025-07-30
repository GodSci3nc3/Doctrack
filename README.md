# Doctrack Prototipo 🧩

<img src = "https://github.com/user-attachments/assets/0787af33-6ddb-4a36-b46d-8b0b88038aa9" style = "height: 650px;">

**Doctrack** es un prototipo funcional de aplicación de escritorio para preparadores documentales de inmigración. Desarrollado con tecnologías modernas, integra un flujo completo de login, gestión de clientes y casos migratorios, en una interfaz amigable y lista para escritorio.

---

## 🛠 Tecnologías utilizadas

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Prisma ORM
- **Base de datos**: SQLite (local, embebido)
- **Escritorio**: Electron
- **Otros**: Node.js, npm, dotenv

---

## 🚀 Instalación local

> Requisitos previos:
> - Node.js (v18+)
> - Git
> - Linux (recomendado), aunque también funciona en Windows y Mac con ajustes

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/doctrack-prototipo.git
cd doctrack-prototipo


```bash
### 2. Instalar dependencias

# Frontend
cd client
npm install
npm run build
cd ..

# Backend
cd server
npm install
npx prisma generate
cd ..

### 3. Configurar la base de datos
### 4. Ejecutar en modo escritorio

```bash
npm run desktop
```bash
