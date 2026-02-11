import z from "zod";
import { password, username } from "./validation-helper";

/* -------- AUTH --------  */
export const LoginSchema = z.object({
  username: username,
  password: password,
});
