import app from "./index.js";
import { ENV } from './lib/env.js';

// server listening port
const PORT = ENV.PORT


//worker
import '../src/shared/workers/verificationMailer.js'
import '../src/shared/workers/welcomeWorker.js'
import '../src/shared/workers/orderNotificationWorker.js'


//healthcheck routes
app.use('/tailorGoHealth', (req, res) => {
    return res.status(200).json({
        date: new Date().toLocaleTimeString(),
        data: 'healthy'
    })
})
// routes
import indexRouter from "./routes/index.js";
app.use('/api', indexRouter)


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
