// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSpendingList, saveExpense } from '@/libs/sheet'

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN

const hintMessage = "欲登記花費，請輸入項目空一格輸入金額" + "\n\n" + "欲查詢今日花費，請輸入今日花費" + "\n\n" 
+ "欲查詢本月花費，請輸入本月花費" + "\n\n"

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.body.events && req.body.events.length == 0) {
        res.status(200)
        res.send("Success")
        return
    }

    if (req.body.events && req.body.events[0].type === "message") {
        var replyMessage = hintMessage
        // Parse events
        const userId = req.body.events[0].source.userId // User ID
        const messageText = req.body.events[0].message.text // Message text
        const timeStamp = req.body.events[0].timestamp // Timestamp
        
        const today = new Date()

        switch (messageText) {
            case "hint":
                break
            case "今日花費":
                const todayExpenses = await todayExpense(userId)
                replyMessage = todayExpenses
                break
            case "本月花費":
                const thisMonthExpenses = await monthExpense(userId, today.getFullYear(), today.getMonth() + 1)
                replyMessage = thisMonthExpenses
                break
            case "上月花費":
                today.setMonth(today.getMonth() - 1)
                const lastMonthExpenses = await monthExpense(userId, today.getFullYear(), today.getMonth() + 1)
                replyMessage = lastMonthExpenses
                break
            case "本月花費清單":
                const thisMonthExpensesList = await monthExpensesList(userId, today.getFullYear(), today.getMonth() + 1)
                replyMessage = thisMonthExpensesList
                break
            case "上月花費清單":
                today.setMonth(today.getMonth() - 1)
                const lastMonthExpensesList = await monthExpensesList(userId, today.getFullYear(), today.getMonth() + 1)
                replyMessage = lastMonthExpensesList
                break
            default:
                try {
                    var {expense, amount} = parseMessage(messageText)
                    if (expense && amount) {
                        saveExpense(userId, timeStamp, expense, amount)
                        replyMessage = "Item: " + expense + "\n\n" + "Cost amount: " + amount + "\n\n" +"Record successfully!"
                    }
                } catch (error) {
                    replyMessage = hintMessage
                }
                break
        }
        
        sendReplyMessage(req.body.events[0].replyToken, replyMessage)
    }

    res.status(200).json({ body: req.body, token: TOKEN })
}

async function todayExpense(userId: string) {
    const sheets = await getSpendingList()
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()

    if (!sheets) {
        return "0"
    }

    const todayExpenses = sheets.filter((item) => 
        item[0] == userId && item[5] == year && item[6] == month && item[7] == day
    )

    const total = todayExpenses.reduce((acc, item) => acc + Number(item[4]), 0)

    return "Total: " + total.toString()
}

async function monthExpense(userId: string, year: number, month: number) {
    const sheets = await getSpendingList()

    if (!sheets) {
        return "0"
    }

    const monthExpenses = sheets.filter((item) => 
        item[0] == userId && item[5] == year && item[6] == month
    )

    const total = monthExpenses.reduce((acc, item) => acc + Number(item[4]), 0)

    return total.toString()
}

async function monthExpensesList(userId: string, year: number, month: number) {
    const sheets = await getSpendingList()

    if (!sheets) {
        return "Total: 0"
    }

    const monthExpenses = sheets.filter((item) => 
        item[0] == userId && item[5] == year && item[6] == month
    )

    if (monthExpenses.length == 0) {
        return "Total: 0"
    }

    var message = ""
    var total = 0
    var currentDay = monthExpenses[0][7]
    message += month + "/" + currentDay + "\n"
    monthExpenses.forEach((item) => {
        if (currentDay != item[7]) {
            currentDay = item[7]
            message += "\n" + month + "/" + currentDay + "\n"
        }
        message += item[3] + " " + item[4] + "\n"
        total += Number(item[4])
    })

    message += "\n" + "Total: " + total
    return message
}

function parseMessage(message: string) {
    const msgArray = message.split(" ");
    return {expense: msgArray[0], amount: Number(msgArray[1])}
}