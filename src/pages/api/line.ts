// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

const PORT = 3000
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

async function sendReplyMessage(message: string) {
    if (!TOKEN) {
        console.log("No token")
        return
    }

    // Request header
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + TOKEN
    }

    // Options to pass into the request
    const webhookOptions = {
        "method": "POST",
        "headers": headers,
        "body": message
    }

    const res = await fetch("https://api.line.me/v2/bot/message/reply", webhookOptions)
    console.log(res)
}


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    console.log(req.body)

    if (req.body.events && req.body.events.length == 0) {
        res.status(200)
        res.send("Success")
        return
    }

    if (req.body.events && req.body.events[0].type === "message") {
        // Message data, must be stringified
        const dataString = JSON.stringify({
          replyToken: req.body.events[0].replyToken,
          messages: [
            {
              "type": "text",
              "text": "Hello, user"
            },
            {
              "type": "text",
              "text": "May I help you?"
            }
          ]
        })

        sendReplyMessage(dataString)
    }

    res.status(200).json({ body: req.body, token: TOKEN })
}
