import { Worker } from "bullmq";
import { connection } from "../../shared/queue/queues.js";
import { transporter } from "../../shared/email/transporter.js";
import fs from 'fs';
import Handlebars from "handlebars";
import { mailTempletHtmlPath } from "../email/mailTempletPath.js";
import { ENV } from "../../lib/env.js";
import { ADMIN_VERIFICATION_LINK_EXPIRY_MINUTES, createTailorAdminVerificationLink } from "../../modules/admin/services/tailorVerification.service.js";

const filePath = mailTempletHtmlPath('tailorVerificationSendMail.html')
const emailTemplet = fs.readFileSync(filePath, 'utf-8')
const compiledEmailTemplet = Handlebars.compile(emailTemplet)

const worker = new Worker("verificationqueue", async (job) => {
    try {
        const jobData = job.data
        const verifyLink = await createTailorAdminVerificationLink(jobData.tailorId);

        const emailHtml = compiledEmailTemplet({
            ...jobData,
            verifyLink,
            linkExpiresInMinutes: ADMIN_VERIFICATION_LINK_EXPIRY_MINUTES
        });

        const mailOption = {
            from: `TailorGo ${ENV.EMAIL_USER}`,
            to: ENV.ADMIN_EMAIL || 'rahulk48546@gmail.com',
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
