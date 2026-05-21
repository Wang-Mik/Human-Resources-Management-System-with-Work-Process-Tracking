# HR Management System with Work Process Tracking


## installed first

- [Node.js](https://nodejs.org/) 
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 
- mssql: vscode exstention

---
## Run
```
cd BackEnd
docker compose up -d
```

You can check it's running with:

```
docker ps
```


---

Connect to SQL Server using your SQL client with these credentials:
- **Server:** `localhost,1433`
- **Username:** `sa`
- **Password:** `Password123!`

Then run these two files in order:

1. `init.sql` — creates the database and all the tables
2. `seed.sql` — inserts some sample employees, tasks, and handover records so the app isn't empty

---
Backend

```
npm install
npm start
```


---


```
cd FrontEnd
npm install
npm run dev
```

Vite will start `http://localhost:5173`

---

## Logging in

Accounts seed data:

| Nguyễn Anh Khoa | khoa@hospital.com | password123 | Manager |
| Phan Quang Minh | minh@hospital.com | password123 | Manager |
| David Hưng | hung@hospital.com | password123 | Employee |
| Madam Dung | dung@hospital.com | password123 | Employee |
| Nguyễn Lan | lan@hospital.com | password123 | Employee |
| Nguyễn Nurse | nguyen@hospital.com | password123 | Employee |

Managers can see everything and manage tasks. Employees can clock in/out, update their tasks, and do handovers.


## Folder structure (quick look)

```
├── BackEnd/
│   ├── src/
│   │   ├── app.js          # entry point
│   │   ├── config/         # database connection
│   │   └── routes/         # all the API routes
│   ├── docker-compose.yml  # SQL Server container
│   ├── init.sql            # creates the tables
│   └── seed.sql            # fills in sample data
│
└── FrontEnd/
    └── src/
        ├── pages/          # Login, Dashboard, TaskBoard, etc.
        └── components/     # shared UI components
```

