import app from "./index.js";
import { ENV } from './lib/env.js';

// server listening port
const PORT = ENV.PORT



// routes
import indexRouter from "./routes/index.js";
app.use('/api', indexRouter)

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
