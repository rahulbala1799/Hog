import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    width: 400,
    height: 600,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#8B5CF6',
    height: 150,
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E9D5FF',
    textAlign: 'center',
  },
  headerLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
    marginTop: 15,
  },
  body: {
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  valueLarge: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  issueNumber: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
    marginTop: 5,
  },
  guestName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#1F2937',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  qrCode: {
    width: 100,
    height: 100,
  },
  qrLabel: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 7,
    color: '#9CA3AF',
    textAlign: 'center',
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
    <Page size={{ width: 400, height: 600 }} style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HOUSE OF GLOW</Text>
        <Text style={styles.headerSubtitle}>Admission Ticket</Text>
        <View style={styles.headerLine} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Issue Number */}
        <View style={styles.section}>
          <Text style={styles.label}>TICKET NUMBER</Text>
          <Text style={styles.issueNumber}>{data.issueNumber}</Text>
        </View>

        {/* Guest Name */}
        <View style={styles.section}>
          <Text style={styles.label}>GUEST NAME</Text>
          <Text style={styles.guestName}>{data.guestName}</Text>
        </View>

        {/* Number of People */}
        <View style={styles.section}>
          <Text style={styles.label}>NUMBER OF GUESTS</Text>
          <Text style={styles.value}>
            {data.numberOfPeople} {data.numberOfPeople === 1 ? 'Person' : 'People'}
          </Text>
        </View>

        {/* Session Date */}
        <View style={styles.section}>
          <Text style={styles.label}>SESSION DATE</Text>
          <Text style={styles.dateText}>{data.sessionDate}</Text>
        </View>

        {/* Session Time */}
        <View style={styles.section}>
          <Text style={styles.label}>SESSION TIME</Text>
          <Text style={styles.dateText}>{data.sessionTime}</Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={data.qrCodeDataUrl} style={styles.qrCode} />
          <Text style={styles.qrLabel}>Scan to visit houseofglow.in</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Please present this ticket at the venue</Text>
    </Page>
  </Document>
)

export default TicketDocument
