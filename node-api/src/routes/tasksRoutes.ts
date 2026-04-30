import { Request, Response, Router } from "express";
import {
  SupportedLang,
  TasksRepository,
} from "../repositories/tasksRepository";

const router = Router();
const tasksRepository = new TasksRepository();
const SUPPORTED_LANGUAGES: SupportedLang[] = ["pt", "en", "es"];

router.post("/", async (req: Request, res: Response) => {
  try {
    const { text, lang } = req.body as { text?: string; lang?: string };

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: 'Campo "text" e obrigatorio.' });
    }

    if (!lang || !SUPPORTED_LANGUAGES.includes(lang as SupportedLang)) {
      return res.status(400).json({ error: "Language not supported" });
    }

    const task = tasksRepository.createTask(text, lang as SupportedLang);

    const pythonUrl = process.env.PYTHON_LLM_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${pythonUrl}/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        lang,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao solicitar resumo ao servico Python");
    }

    const summaryData = (await response.json()) as { summary?: string };
    if (!summaryData.summary || typeof summaryData.summary !== "string") {
      throw new Error("Resposta de resumo invalida");
    }

    tasksRepository.updateTask(task.id, summaryData.summary);

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      task: tasksRepository.getTaskById(task.id),
    });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res.status(500).json({ error: "Ocorreu um erro ao criar a tarefa." });
  }
});

router.get("/", (req, res) => {
  const tasks = tasksRepository.getAllTasks();
  return res.json(tasks);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasksRepository.getTaskById(id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json(task);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const deleted = tasksRepository.deleteTask(id);

  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json({ message: "Task deleted successfully" });
});

export default router;
