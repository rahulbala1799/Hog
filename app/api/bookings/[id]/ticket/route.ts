import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { renderToBuffer } from '@react-pdf/renderer'
import { put } from '@vercel/blob'
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
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') // 'pdf' or 'preview'

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

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(TicketDocument(ticketData))

    // If format is 'preview', return JSON with both URLs
    if (format === 'preview') {
      // Upload PDF to Vercel Blob
      const pdfFilename = `tickets/${booking.issueNumber}-${Date.now()}.pdf`
      const pdfBlob = await put(pdfFilename, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      })

      // Return URLs for both preview and download
      return NextResponse.json({
        pdfUrl: pdfBlob.url,
        previewUrl: pdfBlob.url,
        filename: `ticket-${booking.issueNumber}.pdf`,
        issueNumber: booking.issueNumber,
        guestName: booking.studentName,
      })
    }

    // Default: return PDF directly for download
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
