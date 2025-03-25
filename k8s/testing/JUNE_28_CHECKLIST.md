# June 28 Activity Checklist

## Overview
This checklist covers all activities that need to be completed on June 28, 2024, as we move from the planning phase to the execution phase of the project wrap-up. Please check off each item as it is completed.

## Team Demonstration Scheduling

### Calendar Invites for Team Demonstration (July 3)
- [ ] Run `send_calendar_invites.cmd` to generate templates and participant lists
- [ ] Open email client and create new meeting invitation
- [ ] Set date to July 3, 2024 and time to 10:00 AM - 12:00 PM EDT
- [ ] Set location to Microsoft Teams
- [ ] Add Teams meeting link from the script output
- [ ] Add available participants as attendees:
  - [ ] Required: John Davis, Lisa Wang, Miguel Rodriguez, Karen Johnson, David Chen
  - [ ] Optional: Robert Smith, Angela Kim, Thomas Wilson, Michael Brown, Jennifer Lee
- [ ] Set subject to "Monitoring Test Resources Demonstration and Knowledge Transfer"
- [ ] Copy content from template into email body
- [ ] Send calendar invites to all participants
- [ ] Update `team_demonstration_responses.md` with the Final Selected Date section
- [ ] Add entries to the Attendance Confirmation section as replies are received

### Close Calendly Poll
- [ ] Log in to Calendly account
- [ ] Navigate to the poll at https://calendly.com/nba-stats-projections/monitoring-test-resources-demo?month=2024-07
- [ ] Export the final response data
- [ ] Close the poll manually (if not already auto-closed at 5:00 PM EDT)
- [ ] Update `team_demonstration_responses.md` with final statistics
- [ ] Complete the June 28 section in "Notes and Observations"

### Final Non-Responder Follow-up
- [ ] Send final email reminder to Jennifer Lee
- [ ] Make phone call to Jennifer Lee if email is not responded to
- [ ] Document the outcome in `team_demonstration_responses.md`

## Pre-Deployment Meeting Scheduling

### Schedule Pre-Deployment Meeting (July 5)
- [ ] Run `schedule_predeployment_meeting.cmd` to generate templates and participant lists
- [ ] Open email client and create new meeting invitation
- [ ] Set date to July 5, 2024 and time to 2:00 PM - 2:30 PM EDT
- [ ] Set location to Microsoft Teams
- [ ] Add Teams meeting link from the script output
- [ ] Add participants as attendees:
  - [ ] Required: Sarah Johnson, Michael Chen, Emma Rodriguez, David Kim, John Davis, Lisa Wang
  - [ ] Optional: Operations Team members, Project Management
- [ ] Set subject to "Pre-Deployment Meeting - Monitoring Test Resources"
- [ ] Copy content from template into email body
- [ ] Attach `pre_deployment_meeting_agenda.md` to the invitation
- [ ] Send the meeting invitation
- [ ] Confirm receipt with key stakeholders (John Davis and Lisa Wang)

## Demonstration Environment Preparation

### Initial Setup
- [ ] Review `demo_environment_checklist.md` to understand steps and requirements
- [ ] Prepare Kubernetes access credentials
- [ ] Run `setup-demo-environment.cmd` to create initial namespace and basic resources
- [ ] Verify namespace creation was successful
- [ ] Confirm test resources deployed correctly
- [ ] Update the demonstration environment checklist with completed items
- [ ] Document any issues encountered during setup

### Next Steps Planning
- [ ] Schedule time for June 29-30 to complete environment setup and testing
- [ ] Identify any additional resources needed for environment preparation
- [ ] Update task tracking with current progress

## Documentation Updates

### Update Project Wrap-Up Timeline
- [ ] Open `memory-bank/tasks.md`
- [ ] Update any tasks completed today
- [ ] Ensure all timeline dates are aligned with confirmed demonstration and meeting dates
- [ ] Update the "Next Steps" section if needed

### Update Response Tracking Document
- [ ] Update `team_demonstration_responses.md` with all final statistics
- [ ] Complete the "Notes and Observations" section for June 28
- [ ] Fill in the "Final Selected Date" section with July 3
- [ ] Begin the "Attendance Confirmation" section for calendar invites

### Update Active Context
- [ ] Update `memory-bank/activeContext.md` with day's accomplishments
- [ ] Set tomorrow's priorities (June 29) for continuing demonstration environment setup

## Verification Steps

- [ ] Verify all calendar invites have been sent successfully
- [ ] Confirm pre-deployment meeting has been scheduled
- [ ] Verify initial demonstration environment setup is complete
- [ ] Confirm all documentation updates have been made
- [ ] Check that all tracking documents reflect current status

## End of Day Summary

- [ ] Create a brief summary of what was accomplished
- [ ] Identify any issues that arose during the day
- [ ] List any tasks that need to be carried over to June 29
- [ ] Send daily status update if required

## Notes
- All helper scripts are located in the `k8s/testing` directory
- Documentation should be updated in real-time as tasks are completed
- Any issues encountered should be documented immediately
- Contact Sarah Johnson (sarah.johnson@example.com, 555-123-4567) for any questions or issues 