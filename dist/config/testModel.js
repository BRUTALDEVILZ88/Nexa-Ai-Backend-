import { genAI } from "./config/gemini.js";
async function listAllModels() {
    try {
        const models = await genAI.listModels();
        console.log(models);
    }
    catch (err) {
        console.error("Error listing models:", err);
    }
}
listAllModels();
//# sourceMappingURL=testModel.js.map