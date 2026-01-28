import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

// Create styles for a beautiful ticket
const styles = StyleSheet.create({
  page: {
    width: 400,
    height: 500, // Reduced from 594
    backgroundColor: '#FFFFFF',
  },
  // Simplified header
  headerContainer: {
    backgroundColor: '#7C3AED',
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 35,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    textAlign: 'center',
  },
  // Main content
  mainContent: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 25,
  },
  // Issue number - prominent
  issueNumberContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  issueNumberLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  issueNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7C3AED',
    letterSpacing: 2,
  },
  // Guest section
  guestSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  guestDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailIcon: {
    width: 14,
    height: 14,
    backgroundColor: '#7C3AED',
    borderRadius: 7,
    marginRight: 6,
  },
  detailText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
  },
  // Session details
  sessionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sessionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
  },
  sessionLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  sessionValue: {
    fontSize: 11,
    color: '#1F2937',
    fontWeight: 'bold',
    lineHeight: 1.3,
  },
  // QR section - compact
  qrSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  qrLeft: {
    flex: 1,
    marginRight: 12,
  },
  qrTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  qrDescription: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  qrCodeImage: {
    width: 75,
    height: 75,
    borderRadius: 8,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 7,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 1.4,
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
    <Page size={{ width: 400, height: 500 }} style={styles.page}>
      {/* Simplified Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.brandName}>HOUSE OF GLOW</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Issue Number */}
        <View style={styles.issueNumberContainer}>
          <Text style={styles.issueNumberLabel}>Ticket Number</Text>
          <Text style={styles.issueNumber}>{data.issueNumber}</Text>
        </View>

        {/* Guest Section */}
        <View style={styles.guestSection}>
          <Text style={styles.sectionLabel}>Guest Information</Text>
          <Text style={styles.guestName}>{data.guestName}</Text>
          <View style={styles.guestDetails}>
            <View style={styles.guestDetailItem}>
              <View style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {data.numberOfPeople} {data.numberOfPeople === 1 ? 'Guest' : 'Guests'}
              </Text>
            </View>
          </View>
        </View>

        {/* Session Details */}
        <View style={styles.sessionGrid}>
          <View style={styles.sessionCard}>
            <Text style={styles.sessionLabel}>Session Date</Text>
            <Text style={styles.sessionValue}>{data.sessionDate}</Text>
          </View>
          <View style={styles.sessionCard}>
            <Text style={styles.sessionLabel}>Session Time</Text>
            <Text style={styles.sessionValue}>{data.sessionTime}</Text>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrLeft}>
            <Text style={styles.qrTitle}>Visit Our Website</Text>
            <Text style={styles.qrDescription}>
              Scan to visit houseofglow.in
            </Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={data.qrCodeDataUrl} style={styles.qrCodeImage} />
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
