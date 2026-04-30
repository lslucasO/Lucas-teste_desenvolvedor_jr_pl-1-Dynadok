import dotenv from "dotenv";
dotenv.config();
import app from "./app";

const PORT = process.env.PORT;
const DEFAULT_PORT = 3005;

app.listen(PORT || DEFAULT_PORT, () => {
  console.log(`Node API rodando na porta ${PORT || DEFAULT_PORT}`);
});
