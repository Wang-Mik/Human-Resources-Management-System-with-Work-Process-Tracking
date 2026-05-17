const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const workRoutes = require('./routes/workRoutes');
const handoverRoutes = require('./routes/handoverRoutes');
const bottleneckRoutes = require('./routes/bottleneckRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/works', workRoutes);
app.use('/api/handovers', handoverRoutes);
app.use('/api/bottlenecks', bottleneckRoutes);
app.use('/api/availability', availabilityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running successfully!' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
