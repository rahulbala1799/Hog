import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL('https://houseofglow.in/', {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    // Create PDF document
    const doc = new PDFDocument({
      size: [400, 600], // Ticket size: 400px wide x 600px tall
      margins: { top: 40, bottom: 40, left: 30, right: 30 },
    })

    // Set up response headers
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))

    // Create the PDF content in a promise
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // --- TICKET DESIGN ---

      // Background gradient effect (using rectangles)
      doc
        .rect(0, 0, 400, 150)
        .fill('#8B5CF6') // Purple gradient top

      doc
        .rect(0, 150, 400, 450)
        .fill('#FFFFFF') // White body

      // Top decorative notch (left)
      doc
        .circle(0, 150, 15)
        .fill('#F9FAFB')

      // Top decorative notch (right)
      doc
        .circle(400, 150, 15)
        .fill('#F9FAFB')

      // --- HEADER SECTION ---
      doc
        .fillColor('#FFFFFF')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('HOUSE OF GLOW', 30, 50, { align: 'center', width: 340 })

      doc
        .fillColor('#E9D5FF')
        .fontSize(12)
        .font('Helvetica')
        .text('Admission Ticket', 30, 90, { align: 'center', width: 340 })

      // Decorative line
      doc
        .moveTo(30, 120)
        .lineTo(370, 120)
        .strokeColor('#E9D5FF')
        .lineWidth(1)
        .stroke()

      // --- TICKET DETAILS SECTION ---
      const detailsStartY = 180

      // Issue Number (most prominent)
      doc
        .fillColor('#1F2937')
        .fontSize(10)
        .font('Helvetica')
        .text('TICKET NUMBER', 30, detailsStartY)

      doc
        .fillColor('#8B5CF6')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(booking.issueNumber, 30, detailsStartY + 15)

      // Guest Name
      doc
        .fillColor('#6B7280')
        .fontSize(10)
        .font('Helvetica')
        .text('GUEST NAME', 30, detailsStartY + 60)

      doc
        .fillColor('#1F2937')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(booking.studentName, 30, detailsStartY + 75, { width: 340 })

      // Number of People
      doc
        .fillColor('#6B7280')
        .fontSize(10)
        .font('Helvetica')
        .text('NUMBER OF GUESTS', 30, detailsStartY + 120)

      doc
        .fillColor('#1F2937')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`${booking.numberOfPeople} ${booking.numberOfPeople === 1 ? 'Person' : 'People'}`, 30, detailsStartY + 135)

      // Session Date
      const sessionDate = new Date(booking.sessionDate)
      const dateStr = sessionDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      doc
        .fillColor('#6B7280')
        .fontSize(10)
        .font('Helvetica')
        .text('SESSION DATE', 30, detailsStartY + 180)

      doc
        .fillColor('#1F2937')
        .fontSize(14)
        .font('Helvetica')
        .text(dateStr, 30, detailsStartY + 195, { width: 340 })

      // Session Time
      const timeLabel = booking.sessionTime === 'SESSION_1' ? '7:00 PM - 8:00 PM' : '9:00 PM - 10:00 PM'

      doc
        .fillColor('#6B7280')
        .fontSize(10)
        .font('Helvetica')
        .text('SESSION TIME', 30, detailsStartY + 240)

      doc
        .fillColor('#1F2937')
        .fontSize(14)
        .font('Helvetica')
        .text(timeLabel, 30, detailsStartY + 255)

      // --- QR CODE SECTION ---
      // Convert QR code data URL to buffer and add to PDF
      const qrCodeBuffer = Buffer.from(
        qrCodeDataUrl.replace(/^data:image\/png;base64,/, ''),
        'base64'
      )

      doc.image(qrCodeBuffer, 150, 470, { width: 100, height: 100 })

      doc
        .fillColor('#6B7280')
        .fontSize(8)
        .font('Helvetica')
        .text('Scan to visit houseofglow.in', 30, 535, { align: 'center', width: 340 })

      // --- FOOTER ---
      doc
        .fillColor('#9CA3AF')
        .fontSize(7)
        .font('Helvetica')
        .text('Please present this ticket at the venue', 30, 560, { align: 'center', width: 340 })

      // Finish the PDF
      doc.end()
    })

    const pdfBuffer = await pdfPromise

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${booking.issueNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to generate ticket' },
      { status: 500 }
    )
  }
}
