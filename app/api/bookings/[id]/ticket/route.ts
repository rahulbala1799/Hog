import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { renderToStream } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import TicketDocument from './TicketDocument'

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

    // Format session date
    const sessionDate = new Date(booking.sessionDate)
    const dateStr = sessionDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Format session time
    const timeLabel = booking.sessionTime === 'SESSION_1' ? '7:00 PM - 8:00 PM' : '9:00 PM - 10:00 PM'

    // Prepare ticket data
    const ticketData = {
      issueNumber: booking.issueNumber,
      guestName: booking.studentName,
      numberOfPeople: booking.numberOfPeople,
      sessionDate: dateStr,
      sessionTime: timeLabel,
      qrCodeDataUrl,
    }

    // Create PDF stream
    const stream = await renderToStream(TicketDocument(ticketData))

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    
    return new Promise<NextResponse>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        
        resolve(
          new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="ticket-${booking.issueNumber}.pdf"`,
              'Content-Length': pdfBuffer.length.toString(),
            },
          })
        )
      })
      stream.on('error', reject)
    })
  } catch (error) {
    console.error('Error generating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to generate ticket' },
      { status: 500 }
    )
  }
}
