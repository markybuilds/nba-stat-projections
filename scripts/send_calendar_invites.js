/**
 * Team Demonstration Calendar Invite Sender
 * 
 * This script sends calendar invites for the team demonstration scheduled for July 3, 2024.
 * It uses the email list collected from the calendar poll responses.
 */

const nodemailer = require('nodemailer');
const ical = require('ical-generator');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  eventDate: new Date('2024-07-03T14:00:00'), // 2:00 PM on July 3, 2024
  eventDuration: 90, // 90 minutes
  eventTitle: 'NBA Stat Projections - Team Demonstration and Knowledge Transfer',
  eventLocation: 'Virtual Meeting (Zoom)',
  eventDescription: `
Team Demonstration for the NBA Stat Projections System

Agenda:
1. Project Overview (10 min)
2. System Architecture (15 min)
3. Feature Demonstration (30 min)
4. Q&A Session (20 min)
5. Next Steps and Handover (15 min)

The Zoom link will be shared 15 minutes before the meeting.
Please review the project documentation before the meeting: https://github.com/your-org/nba-stat-projections/docs

Contact: ${process.env.EMAIL_USER}
`,
  zoomLink: process.env.ZOOM_LINK || 'https://zoom.us/j/your-meeting-id',
  meetingPassword: process.env.MEETING_PASSWORD || '123456',
  attendees: [] // Will be loaded from JSON file
};

// Create a calendar event
function createCalendarEvent() {
  const calendar = ical({
    domain: 'nba-stat-projections.example.com',
    prodId: {company: 'NBA Stats Team', product: 'Team Demonstration'}
  });
  
  const event = calendar.createEvent({
    start: CONFIG.eventDate,
    end: new Date(CONFIG.eventDate.getTime() + CONFIG.eventDuration * 60000),
    summary: CONFIG.eventTitle,
    description: CONFIG.eventDescription + `\n\nZoom Link: ${CONFIG.zoomLink}\nPassword: ${CONFIG.meetingPassword}`,
    location: CONFIG.eventLocation,
    url: CONFIG.zoomLink,
    organizer: {
      name: 'NBA Stats Project Team',
      email: CONFIG.emailUser
    }
  });
  
  // Add attendees
  CONFIG.attendees.forEach(attendee => {
    event.createAttendee({
      email: attendee.email,
      name: attendee.name,
      status: 'NEEDS-ACTION',
      rsvp: true
    });
  });
  
  return calendar;
}

// Send email with calendar invite
async function sendCalendarInvites() {
  // Create email transporter
  const transporter = nodemailer.createTransport({
    service: CONFIG.emailService,
    auth: {
      user: CONFIG.emailUser,
      pass: CONFIG.emailPass
    }
  });
  
  // Create calendar event
  const calendar = createCalendarEvent();
  
  // Send to each attendee
  for (const attendee of CONFIG.attendees) {
    try {
      const info = await transporter.sendMail({
        from: `"NBA Stats Team" <${CONFIG.emailUser}>`,
        to: attendee.email,
        subject: CONFIG.eventTitle,
        text: `
Hello ${attendee.name},

You're invited to the ${CONFIG.eventTitle} on ${CONFIG.eventDate.toLocaleDateString()} at ${CONFIG.eventDate.toLocaleTimeString()}.

${CONFIG.eventDescription}

Please add this to your calendar. Looking forward to your participation!

Best regards,
NBA Stats Project Team
        `,
        html: `
<h2>NBA Stat Projections - Team Demonstration</h2>
<p>Hello ${attendee.name},</p>
<p>You're invited to the <strong>${CONFIG.eventTitle}</strong> on <strong>${CONFIG.eventDate.toLocaleDateString()}</strong> at <strong>${CONFIG.eventDate.toLocaleTimeString()}</strong>.</p>
<h3>Agenda:</h3>
<ol>
  <li>Project Overview (10 min)</li>
  <li>System Architecture (15 min)</li>
  <li>Feature Demonstration (30 min)</li>
  <li>Q&A Session (20 min)</li>
  <li>Next Steps and Handover (15 min)</li>
</ol>
<p>The Zoom link will be shared 15 minutes before the meeting.</p>
<p>Please review the project documentation before the meeting: <a href="https://github.com/your-org/nba-stat-projections/docs">Documentation</a></p>
<p>Please add this to your calendar. Looking forward to your participation!</p>
<p>Best regards,<br>NBA Stats Project Team</p>
        `,
        icalEvent: {
          filename: 'team-demonstration.ics',
          method: 'REQUEST',
          content: calendar.toString()
        }
      });
      
      console.log(`Calendar invite sent to ${attendee.email}: ${info.messageId}`);
    } catch (error) {
      console.error(`Failed to send invite to ${attendee.email}:`, error);
    }
  }
}

// Load attendees from JSON file
function loadAttendees() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/calendar_poll_responses.json'), 'utf8');
    CONFIG.attendees = JSON.parse(data);
    console.log(`Loaded ${CONFIG.attendees.length} attendees from file`);
  } catch (error) {
    console.error('Error loading attendees:', error);
    console.log('Please create a file at data/calendar_poll_responses.json with attendee information');
    process.exit(1);
  }
}

// Main execution
async function main() {
  if (!CONFIG.emailUser || !CONFIG.emailPass) {
    console.error('EMAIL_USER and EMAIL_PASS environment variables must be set');
    process.exit(1);
  }
  
  loadAttendees();
  
  if (CONFIG.attendees.length === 0) {
    console.error('No attendees found in the JSON file');
    process.exit(1);
  }
  
  await sendCalendarInvites();
  console.log('All calendar invites sent successfully');
}

// Run the script
main().catch(console.error); 