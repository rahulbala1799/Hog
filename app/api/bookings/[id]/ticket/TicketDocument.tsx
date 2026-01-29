import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

// Create styles optimized for mobile preview
const styles = StyleSheet.create({
  page: {
    width: 350,  // Optimized for mobile screens
    height: 500,
    backgroundColor: '#FFFFFF',
  },
  // Simplified header
  headerContainer: {
    backgroundColor: '#7C3AED',
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 30,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  // Main content
  mainContent: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 22,
  },
  // Issue number
  issueNumberContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  issueNumberLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  issueNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
    letterSpacing: 2,
  },
  // Guest section
  guestSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 7,
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  guestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 9,
  },
  guestDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 12,
    height: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 6,
    marginRight: 5,
  },
  detailText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  // Session details
  sessionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sessionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 3,
  },
  sessionLabel: {
    fontSize: 7,
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sessionValue: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: 'bold',
    lineHeight: 1.3,
  },
  // QR section
  qrSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qrLeft: {
    flex: 1,
    marginRight: 10,
  },
  qrTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 3,
  },
  qrDescription: {
    fontSize: 7,
    color: '#6B7280',
    lineHeight: 1.3,
  },
  qrCodeImage: {
    width: 65,
    height: 65,
    borderRadius: 6,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 25,
    right: 25,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 1.3,
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
    <Page size={{ width: 350, height: 500 }} style={styles.page}>
      {/* Header */}
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
