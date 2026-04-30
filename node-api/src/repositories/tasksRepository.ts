import fs from "fs";
import path from "path";

export type SupportedLang = "pt" | "en" | "es";

export interface Task {
  id: number;
  text: string;
  summary: string | null;
  lang: SupportedLang;
}

export class TasksRepository {
  private tasks: Task[] = [];
  private currentId: number = 1;
  private readonly tasksFilePath = path.resolve(process.cwd(), "tasks.json");

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    try {
      if (!fs.existsSync(this.tasksFilePath)) {
        fs.writeFileSync(this.tasksFilePath, JSON.stringify([], null, 2), "utf-8");
        this.tasks = [];
        return;
      }

      const fileContent = fs.readFileSync(this.tasksFilePath, "utf-8");
      const parsed = fileContent.trim() ? JSON.parse(fileContent) : [];

      if (!Array.isArray(parsed)) {
        this.tasks = [];
        this.currentId = 1;
        return;
      }

      this.tasks = parsed as Task[];
      this.currentId =
        this.tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
    } catch (error) {
      console.error("Erro ao carregar arquivo de tarefas:", error);
      this.tasks = [];
      this.currentId = 1;
    }
  }

  private persistTasks(): void {
    fs.writeFileSync(
      this.tasksFilePath,
      JSON.stringify(this.tasks, null, 2),
      "utf-8"
    );
  }

  createTask(text: string, lang: SupportedLang): Task {
    const task: Task = {
      id: this.currentId++,
      text,
      summary: null,
      lang,
    };
    this.tasks.push(task);
    this.persistTasks();
    return task;
  }

  updateTask(id: number, summary: string): Task | null {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex > -1) {
      this.tasks[taskIndex].summary = summary;
      this.persistTasks();
      return this.tasks[taskIndex];
    }
    return null;
  }

  deleteTask(id: number): boolean {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return false;
    }

    this.tasks.splice(taskIndex, 1);
    this.persistTasks();
    return true;
  }

  getTaskById(id: number): Task | null {
    return this.tasks.find((t) => t.id === id) || null;
  }

  getAllTasks(): Task[] {
    return this.tasks;
  }
}
