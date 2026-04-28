import { Worker } from "bullmq";
import fs from 'fs';
import Handlebars from "handlebars";
import { mailTempletHtmlPath } from "../email/mailTempletPath.js";
import { transporter } from "../email/transporter.js";
import { connection } from "../queue/queues.js";
import { ENV } from "../../lib/env.js";

const filePath = mailTempletHtmlPath('welcome.html')
const emailTemplet = fs.readFileSync(filePath, 'utf-8')
const compiledEmailTemplet = Handlebars.compile(emailTemplet)

const welcomeCopy = {
    customer: {
        subject: 'Welcome to TailorGo',
        heading: 'Welcome to TailorGo!',
        intro: 'TailorGo helps you find nearby tailors and send clothes for stitching, alteration, and custom fitting from your area.',
        nextStepTitle: 'What you can do now',
        nextStep: 'Explore nearby tailors, compare services, and place your stitching request when you are ready.',
        ctaText: 'Find nearby tailors',
        footerNote: 'Your TailorGo customer account is active.'
    },
    tailor: {
        subject: 'Welcome to TailorGo Tailor Partner',
        heading: 'Welcome to TailorGo, partner!',
        intro: 'TailorGo connects customers with nearby tailors so they can give clothes for stitching and get quality service from trusted professionals like you.',
        nextStepTitle: 'What happens next',
        nextStep: 'Our admin team will review your profile and verification photos before enabling verified tailor access.',
        ctaText: 'View your tailor profile',
        footerNote: 'Your tailor profile is under admin verification.'
    }
}

const worker = new Worker("tailorGo-WelcomeMessage", async (job) => {
    try {
        const role = job.data.role === 'tailor' ? 'tailor' : 'customer';
        const copy = welcomeCopy[role];
        const jobData = {
            fullname: job.data.fullname,
            email: job.data.email,
            role,
            appName: 'TailorGo',
            heading: copy.heading,
            intro: copy.intro,
            nextStepTitle: copy.nextStepTitle,
            nextStep: copy.nextStep,
            ctaText: copy.ctaText,
            ctaUrl: ENV.FRONTEND_URL || 'http://localhost:5173',
            footerNote: copy.footerNote
        };

        const emailHtml = compiledEmailTemplet(jobData);

        const mailOption = {
            from: `TailorGo ${ENV.EMAIL_USER}`,
            to: jobData.email,
            subject: copy.subject,
            html: emailHtml
        }

        await transporter.sendMail(mailOption)

    } catch (error) {
        console.log("Error While send Welcome message", job.data.fullname)
        throw error
    }
},{
    connection: connection,
    concurrency: 5,
    limiter: {
        max: 100,
        duration: 60 * 1000
    }
})

worker.on('completed', (job) => {
    console.log('Welcome email sent', job.data.fullname)
})

worker.on('failed', (job) => {
    console.log('Error While send Welcome email', job.data.fullname)
})
