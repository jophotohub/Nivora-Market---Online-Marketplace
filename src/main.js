import "./index.css";
import { initAppState } from "./services/state.js";
import { handleRouting, navigate } from "./router.js";
async function bootstrap() {
  console.log("Initializing Nivora Market Frontend...");
  await initAppState();
  window.addEventListener("popstate", () => {
    handleRouting();
  });
  window.addEventListener("nivora:auth-expired", () => {
    navigate("/login");
  });
  handleRouting();
}
bootstrap().catch((err) => {
  console.error("Fatal initialization error in Nivora Market:", err);
});
