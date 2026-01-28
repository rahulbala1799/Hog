import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    width: 400,
    height: 550,
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  // Header with gradient effect
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 35,
    paddingBottom: 25,
    paddingHorizontal: 30,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  ticketLabel: {
    fontSize: 11,
    color: '#E9D5FF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  // Main content area
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 25,
  },
  // Issue number badge
  issueBadge: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  issueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
    letterSpacing: 1,
  },
  // Guest details
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  detailsColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    marginBottom: 5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  guestNameValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: 'bold',
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  // QR Section - moved up and integrated better
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginTop: 10,
    marginHorizontal: 10,
  },
  qrCodeImage: {
    width: 80,
    height: 80,
  },
  qrTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Decorative elements
  decorativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 4,
  },
})

interface TicketData {
  issueNumber: string
  guestName: string
  numberOfPeople: number
  sessionDate: string
  sessionTime: string
  qrCodeDataUrl: string
}

const TicketDocument = (data: TicketData) => (
  <Document>
    <Page size={{ width: 400, height: 550 }} style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandName}>HOUSE OF GLOW</Text>
        <Text style={styles.ticketLabel}>ADMISSION TICKET</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Issue Number Badge */}
        <View style={styles.issueBadge}>
          <Text style={styles.issueText}>{data.issueNumber}</Text>
        </View>

        {/* Guest Name - prominent */}
        <View style={{ marginBottom: 18, paddingHorizontal: 10 }}>
          <Text style={styles.detailLabel}>Guest Name</Text>
          <Text style={styles.guestNameValue}>{data.guestName}</Text>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailLabel}>Guests</Text>
            <Text style={styles.detailValue}>
              {data.numberOfPeople} {data.numberOfPeople === 1 ? 'Person' : 'People'}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{data.sessionDate}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{data.sessionTime}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* QR Code Section - compact and integrated */}
        <View style={styles.qrSection}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={data.qrCodeDataUrl} style={styles.qrCodeImage} />
          <View style={styles.qrTextContainer}>
            <Text style={styles.qrTitle}>Visit Our Website</Text>
            <Text style={styles.qrSubtitle}>
              Scan this code to visit{'\n'}houseofglow.in
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Please present this ticket at the venue entrance
        </Text>
      </View>
    </Page>
  </Document>
)

export default TicketDocument
