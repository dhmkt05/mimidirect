import { NextResponse } from "next/server"

export async function POST(req: Request) {

const body = await req.json()

const res = await fetch(
"https://n8n.srv1226738.hstgr.cloud/webhook/helper-search",
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
message: body.message
})
}
)

const data = await res.json()

return NextResponse.json(data)

}