import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ name: '', phone: '', confidence: 'low', error: 'no_api_key' })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ name: '', phone: '', confidence: 'low', error: 'no_image' })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Extract the contact name and phone number from this image.
Return ONLY valid JSON: {"name": "...", "phone": "...", "confidence": "high|medium|low"}
If you cannot find name or phone, return empty string for that field.
Phone: include country code if visible, otherwise return as-is.`

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType } },
    ])

    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ name: '', phone: '', confidence: 'low' })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({
      name: parsed.name ?? '',
      phone: parsed.phone ?? '',
      confidence: parsed.confidence ?? 'low',
    })
  } catch (err) {
    console.error('OCR error:', err)
    return NextResponse.json({ name: '', phone: '', confidence: 'low', error: 'ocr_failed' })
  }
}
