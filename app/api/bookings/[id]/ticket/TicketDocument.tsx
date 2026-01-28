import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

// Create styles for a beautiful ticket
const styles = StyleSheet.create({
  page: {
    width: 420,
    height: 594, // A5 height for standard ticket size
    backgroundColor: '#FFFFFF',
  },
  // Gradient header background
  headerContainer: {
    backgroundColor: '#7C3AED',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 35,
    position: 'relative',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  brandName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 10,
    color: '#E9D5FF',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
  },
  ticketType: {
    fontSize: 11,
    color: '#DDD6FE',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  // Main content
  mainContent: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 30,
  },
  // Issue number - prominent
  issueNumberContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  issueNumberLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  issueNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    letterSpacing: 2,
  },
  // Guest section
  guestSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 9,
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  guestName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
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
    width: 16,
    height: 16,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
  },
  // Session details
  sessionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sessionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
  },
  sessionLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sessionValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: 'bold',
    lineHeight: 1.3,
  },
  // QR section - premium layout
  qrSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  qrLeft: {
    flex: 1,
    marginRight: 15,
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  qrDescription: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.5,
  },
  qrCodeImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  footerBrand: {
    fontSize: 7,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
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
    <Page size={{ width: 420, height: 594 }} style={styles.page}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>HOUSE OF GLOW</Text>
          <Text style={styles.brandTagline}>ILLUMINATE YOUR BEAUTY</Text>
        </View>
        <Text style={styles.ticketType}>● Admission Ticket ●</Text>
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
              Scan this QR code with your phone camera to visit houseofglow.in and explore our services
            </Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={data.qrCodeDataUrl} style={styles.qrCodeImage} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Please present this ticket at the venue entrance{'\n'}
          Valid only for the date and time mentioned above
        </Text>
        <Text style={styles.footerBrand}>
          HOUSE OF GLOW © 2026
        </Text>
      </View>
    </Page>
  </Document>
)

export default TicketDocument
