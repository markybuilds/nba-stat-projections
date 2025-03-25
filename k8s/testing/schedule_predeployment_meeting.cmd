@echo off
setlocal enabledelayedexpansion

echo.
echo ===================================================================
echo Scheduling Pre-Deployment Meeting (July 5, 2024)
echo ===================================================================
echo.

REM Set variables for the meeting
set MEETING_DATE=July 5, 2024
set MEETING_TIME=2:00 PM - 2:30 PM EDT
set MEETING_LOCATION=Microsoft Teams
set MEETING_LINK=https://teams.microsoft.com/l/meetup-join/19%%3ameeting_YWUyNzA1ZjEtMjNkYy00NGYzLWI5N2QtNmQ3YTlkMDYxOGVj%%40thread.v2/0?context=%%7b%%22Tid%%22%%3a%%22a63bb243-42dd-4e98-bc43-f3d4dbc2cc79%%22%%2c%%22Oid%%22%%3a%%227682b90c-8b23-4912-a677-89d1150fbceb%%22%%7d

REM Create a template for the meeting invite
echo Creating meeting invite template...
echo Subject: Pre-Deployment Meeting - Monitoring Test Resources> meeting_invite_template.txt
echo Date: %MEETING_DATE%>> meeting_invite_template.txt
echo Time: %MEETING_TIME%>> meeting_invite_template.txt
echo Location: %MEETING_LOCATION%>> meeting_invite_template.txt
echo Teams Link: %MEETING_LINK%>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo Dear Team,>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo This is an invitation for the pre-deployment meeting for Monitoring Test Resources, scheduled for %MEETING_DATE% from %MEETING_TIME%.>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo The meeting will be held via Microsoft Teams. You can join using the link provided in this calendar invitation or by clicking on the meeting in your calendar.>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo The objective of this meeting is to review the deployment plan for Monitoring Test Resources and ensure all team members are aligned on responsibilities, timeline, and technical requirements for the July 8 deployment.>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo Agenda:>> meeting_invite_template.txt
echo 1. Deployment Overview (5 minutes)>> meeting_invite_template.txt
echo 2. Technical Requirements Review (10 minutes)>> meeting_invite_template.txt
echo 3. Deployment Sequence (5 minutes)>> meeting_invite_template.txt
echo 4. Risk Assessment and Mitigation (5 minutes)>> meeting_invite_template.txt
echo 5. Questions and Clarifications (5 minutes)>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo Please review the following documents before the meeting:>> meeting_invite_template.txt
echo - PRODUCTION_DEPLOYMENT.md>> meeting_invite_template.txt
echo - DEPLOYMENT_CHECKLIST.md>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo If you have any questions or need to reschedule, please contact Sarah Johnson at sarah.johnson@example.com or (555) 123-4567.>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo Looking forward to your participation!>> meeting_invite_template.txt
echo.>> meeting_invite_template.txt
echo Best regards,>> meeting_invite_template.txt
echo Sarah Johnson>> meeting_invite_template.txt
echo Project Lead, Monitoring Test Resources>> meeting_invite_template.txt

echo.
echo Meeting invite template created successfully!
echo.

REM Create a list of participants
echo Creating participant list...
echo Required Participants:> participant_list.txt
echo Sarah Johnson,sarah.johnson@example.com,Project Lead>> participant_list.txt
echo Michael Chen,michael.chen@example.com,DevOps Engineer>> participant_list.txt
echo Emma Rodriguez,emma.rodriguez@example.com,Database Administrator>> participant_list.txt
echo David Kim,david.kim@example.com,Monitoring Engineer>> participant_list.txt
echo John Davis,john.davis@example.com,Operations Team Lead>> participant_list.txt
echo Lisa Wang,lisa.wang@example.com,Monitoring Team Lead>> participant_list.txt
echo Optional Participants:>> participant_list.txt
echo Operations Team members>> participant_list.txt
echo Project Management>> participant_list.txt

echo.
echo Participant list created successfully!
echo.

REM For demonstration purposes, we'll just create a sample email
echo Creating sample meeting invitation email...
copy meeting_invite_template.txt "Pre_Deployment_Meeting_Invitation.txt" > nul

echo.
echo Sample meeting invitation created successfully!
echo.

echo ===================================================================
echo Instructions for Scheduling the Pre-Deployment Meeting
echo ===================================================================
echo.
echo To schedule the pre-deployment meeting:
echo.
echo 1. Open your email client (Outlook, etc.)
echo 2. Create a new meeting invitation
echo 3. Set the date to %MEETING_DATE% and time to %MEETING_TIME%
echo 4. Set the location to %MEETING_LOCATION%
echo 5. Add the Teams meeting link: %MEETING_LINK%
echo 6. Add the following participants:
echo    - Required: Sarah Johnson, Michael Chen, Emma Rodriguez, 
echo      David Kim, John Davis, Lisa Wang
echo    - Optional: Operations Team members, Project Management
echo 7. Set the subject to "Pre-Deployment Meeting - Monitoring Test Resources"
echo 8. Copy the content from the meeting_invite_template.txt into the body
echo 9. Attach the pre_deployment_meeting_agenda.md file for reference
echo 10. Send the meeting invitation
echo.

echo Note: In a real environment, this script would use Outlook automation or 
echo a calendar API to send the invites automatically. For this demonstration,
echo please follow the manual steps above.
echo.

echo ===================================================================
echo Pre-deployment meeting scheduling preparation completed!
echo ===================================================================
echo.
echo The following files have been created:
echo - meeting_invite_template.txt: Template for the meeting invite
echo - participant_list.txt: List of all participants
echo - Pre_Deployment_Meeting_Invitation.txt: Sample invitation email
echo.
echo Please use these files to assist with scheduling the pre-deployment meeting.
echo.

REM Check if the pre-deployment meeting agenda exists
if exist "pre_deployment_meeting_agenda.md" (
    echo The pre-deployment meeting agenda (pre_deployment_meeting_agenda.md) has been found.
    echo Remember to attach this file to your meeting invitation.
) else (
    echo WARNING: The pre-deployment meeting agenda (pre_deployment_meeting_agenda.md) was not found.
    echo Please make sure to create this file before sending the meeting invitation.
)

echo.
echo ===================================================================
echo.

endlocal 