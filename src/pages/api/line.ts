// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSpendingList, saveExpense } from '@/libs/sheet'

const PORT = 3000
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

const hintMessage = "欲登記花費，請輸入項目空一格輸入金額" + "\n\n" + "欲查詢今日花費，請輸入今日花費" + "\n\n" 
+ "欲查詢本月花費，請輸入本月花費" + "\n\n" + "紀錄收入，請輸入收入空一格輸入金額"

async function sendReplyMessage(replyToken: string, message: string) {
    if (!TOKEN || !replyToken) {
        console.log("No token")
        return
    }

    const dataString = JSON.stringify({
        replyToken: replyToken,
        messages: [
          {
            "type": "text",
            "text": message
          },
        ]
      })


    // Request header
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + TOKEN
    }

    // Options to pass into the request
    const webhookOptions = {
        "method": "POST",
        "headers": headers,
        "body": dataString
    }

    await fetch("https://api.line.me/v2/bot/message/reply", webhookOptions)
}


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.body.events && req.body.events.length == 0) {
        res.status(200)
        res.send("Success")
        return
    }

    if (req.body.events && req.body.events[0].type === "message") {
        var message = "hello"
        // Parse events
        const userId = req.body.events[0].source.userId // User ID
        const messageText = req.body.events[0].message.text // Message text
        const timeStamp = req.body.events[0].timestamp // Timestamp
        
        switch (messageText) {
            case "hint":
                message = hintMessage
                break
            case "今日花費":
                message = todayExpense()
                break
            case "今日消費":
                message = todayExpense()
                break
            default:
                try {
                    var {expense, amount} = parseMessage(req.body.msg)
                    if (expense && amount) {
                        saveExpense(userId, timeStamp, expense, amount)
                        message = "Item: " + expense + "\n\n" + "Cost amount: " + amount + "\n\n" +"Record successfully!"
                    }
                } catch (error) {
                    message = hintMessage
                }
                break
        }

        // Message data, must be stringified
        
        sendReplyMessage(req.body.events[0].replyToken, message)
    }

    res.status(200).json({ body: req.body, token: TOKEN })
}

function todayExpense() {
    const sheets = getSpendingList()
    
    return "today"
}

function monthExpense() {
    return "month"
}

function recordExpense() {
    return "record"
}

function parseMessage(message: string) {
    const msgArray = message.split(" ");
    return {expense: msgArray[0], amount: Number(msgArray[1])}
}