import { verifyTailorByAdminToken } from "../services/tailorVerification.service.js";

const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const renderVerificationPage = ({ title, message, status }) => `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f4f7fb;
            color: #111827;
            font-family: Arial, sans-serif;
        }
        main {
            width: min(520px, calc(100% - 32px));
            padding: 28px;
            border: 1px solid #d7dde8;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 10px 24px rgba(16, 24, 40, 0.08);
            text-align: center;
        }
        .badge {
            display: inline-block;
            margin-bottom: 12px;
            padding: 6px 10px;
            border-radius: 999px;
            color: ${status === 'success' ? '#027a48' : '#b42318'};
            background: ${status === 'success' ? '#ecfdf3' : '#fff1f3'};
            font-weight: 700;
            font-size: 13px;
        }
        h1 {
            margin: 0 0 10px;
            font-size: 24px;
            letter-spacing: 0;
        }
        p {
            margin: 0;
            color: #667085;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <main>
        <span class="badge">${status === 'success' ? 'Verified' : 'Failed'}</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
    </main>
</body>
</html>
`;

export const tailorAdminVerifyController = async (req, res) => {
    try {
        const tailor = await verifyTailorByAdminToken(req.params.token);

        return res.status(200).send(renderVerificationPage({
            title: 'Tailor verified successfully',
            message: `${tailor.fullName} can now login as a verified tailor.`,
            status: 'success'
        }));
    } catch (error) {
        return res.status(400).send(renderVerificationPage({
            title: 'Verification link failed',
            message: error.message,
            status: 'error'
        }));
    }
}
