/**
 * Pre-Deployment Meeting Scheduler
 * 
 * This script schedules the pre-deployment meeting for July 5, 2024
 * and sends calendar invites to the operations team.
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
  eventDate: new Date('2024-07-05T10:00:00'), // 10:00 AM on July 5, 2024
  eventDuration: 60, // 60 minutes
  eventTitle: 'NBA Stat Projections - Pre-Deployment Planning Meeting',
  eventLocation: 'Virtual Meeting (Microsoft Teams)',
  eventDescription: `
Pre-Deployment Planning Meeting for the NBA Stat Projections System

Agenda:
1. Deployment Timeline Review (10 min)
2. Environment Verification (15 min)
3. Rollback Procedure Review (10 min)
4. Risk Assessment (10 min)
5. Action Items and Assignments (15 min)

Please review the deployment documentation before the meeting: https://github.com/your-org/nba-stat-projections/docs/deployment

Contact: ${process.env.EMAIL_USER}
`,
  teamsLink: process.env.TEAMS_LINK || 'https://teams.microsoft.com/l/meetup-join/your-meeting-link',
  operationsTeam: [
    { name: 'Operations Manager', email: 'ops-manager@example.com' },
    { name: 'Database Administrator', email: 'dba@example.com' },
    { name: 'Network Engineer', email: 'network@example.com' },
    { name: 'Security Specialist', email: 'security@example.com' },
    { name: 'DevOps Engineer', email: 'devops@example.com' }
  ]
};

// Create a calendar event
function createCalendarEvent() {
  const calendar = ical({
    domain: 'nba-stat-projections.example.com',
    prodId: {company: 'NBA Stats Team', product: 'Pre-Deployment Meeting'}
  });
  
  const event = calendar.createEvent({
    start: CONFIG.eventDate,
    end: new Date(CONFIG.eventDate.getTime() + CONFIG.eventDuration * 60000),
    summary: CONFIG.eventTitle,
    description: CONFIG.eventDescription + `\n\nMicrosoft Teams Link: ${CONFIG.teamsLink}`,
    location: CONFIG.eventLocation,
    url: CONFIG.teamsLink,
    organizer: {
      name: 'NBA Stats Project Team',
      email: CONFIG.emailUser
    }
  });
  
  // Add attendees
  CONFIG.operationsTeam.forEach(attendee => {
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
  
  try {
    // Send to all attendees as a group
    const to = CONFIG.operationsTeam.map(person => person.email).join(', ');
    const info = await transporter.sendMail({
      from: `"NBA Stats Team" <${CONFIG.emailUser}>`,
      to: to,
      subject: CONFIG.eventTitle,
      text: `
Hello Operations Team,

You're invited to the ${CONFIG.eventTitle} on ${CONFIG.eventDate.toLocaleDateString()} at ${CONFIG.eventDate.toLocaleTimeString()}.

${CONFIG.eventDescription}

This meeting is critical to ensure a smooth deployment process for the NBA Statistics Projection System.
Please review the deployment documentation prior to the meeting.

Best regards,
NBA Stats Project Team
      `,
      html: `
<h2>NBA Stat Projections - Pre-Deployment Meeting</h2>
<p>Hello Operations Team,</p>
<p>You're invited to the <strong>${CONFIG.eventTitle}</strong> on <strong>${CONFIG.eventDate.toLocaleDateString()}</strong> at <strong>${CONFIG.eventDate.toLocaleTimeString()}</strong>.</p>
<h3>Agenda:</h3>
<ol>
  <li>Deployment Timeline Review (10 min)</li>
  <li>Environment Verification (15 min)</li>
  <li>Rollback Procedure Review (10 min)</li>
  <li>Risk Assessment (10 min)</li>
  <li>Action Items and Assignments (15 min)</li>
</ol>
<p>This meeting is critical to ensure a smooth deployment process for the NBA Statistics Projection System.</p>
<p>Please review the deployment documentation before the meeting: <a href="https://github.com/your-org/nba-stat-projections/docs/deployment">Deployment Documentation</a></p>
<p>Best regards,<br>NBA Stats Project Team</p>
      `,
      icalEvent: {
        filename: 'predeployment-meeting.ics',
        method: 'REQUEST',
        content: calendar.toString()
      }
    });
    
    console.log(`Calendar invite sent to operations team: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send calendar invite:', error);
  }
}

// Check if operations team data file exists and load it
function loadOperationsTeam() {
  try {
    const dataPath = path.join(__dirname, '../data/operations_team.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      CONFIG.operationsTeam = JSON.parse(data);
      console.log(`Loaded ${CONFIG.operationsTeam.length} team members from file`);
    } else {
      console.log('Using default operations team list - no custom file found');
    }
  } catch (error) {
    console.error('Error loading operations team data:', error);
    console.log('Using default operations team list');
  }
}

// Main execution
async function main() {
  if (!CONFIG.emailUser || !CONFIG.emailPass) {
    console.error('EMAIL_USER and EMAIL_PASS environment variables must be set');
    process.exit(1);
  }
  
  loadOperationsTeam();
  
  if (CONFIG.operationsTeam.length === 0) {
    console.error('No operations team members defined');
    process.exit(1);
  }
  
  await sendCalendarInvites();
  console.log('Pre-deployment meeting invites sent successfully');
}

// Run the script
main().catch(console.error); 