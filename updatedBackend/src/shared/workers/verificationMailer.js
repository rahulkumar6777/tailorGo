import { Worker } from "bullmq";
import { connection } from "../../shared/queue/queues.js";
import { transporter } from "../../shared/email/transporter.js";
import fs from 'fs';
import Handlebars from "handlebars";
import { mailTempletHtmlPath } from "../email/mailTempletPath.js";

const filePath = mailTempletHtmlPath('tailorVerificationSendMail.html')
const emailTemplet = fs.readFileSync(filePath, 'utf-8')
const compiledEmailTemplet = Handlebars.compile(emailTemplet)

const worker = new Worker("verificationqueue", async (job) => {
    try {
        const jobData = job.data
        console.log(jobData)

        const emailHtml = compiledEmailTemplet(jobData);

        const mailOption = {
            from: `TailorGo ${process.env.EMAIL_USER}`,
            to: 'rahulk48546@gmail.com',
            subject: 'New Tailor Register',
            html: emailHtml
        }

        await transporter.sendMail(mailOption)

    } catch (error) {
        console.log("Error While New Tailor Verification Email Send To Admin", job.data.fullname)
        throw error
    }
}, {
    connection: connection,
    concurrency: 5,
    limiter: {
        max: 100,
        duration: 60 * 1000
    }
})

worker.on('completed', (job) => {
    console.log('New Tailor Verification Email Send To Admin', job.data.fullname)
})

worker.on('failed', (job) => {
    console.log('Error While New Tailor Verification Email Send To Admin', job.data.fullname)
})