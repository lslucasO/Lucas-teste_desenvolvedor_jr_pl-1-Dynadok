import express, { Application } from 'express';
import tasksRoutes from './routes/tasksRoutes';

const app: Application = express();
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "API is running" });
});

// Rotas
app.use('/tasks', tasksRoutes);

export default app;
