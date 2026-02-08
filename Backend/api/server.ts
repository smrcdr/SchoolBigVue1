import {app} from "./app";

const PORT = 3000

app.listen(PORT, () => {
    console.log(
        `API запущен на: http://localhost:${PORT}`,
    );
});
