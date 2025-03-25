@echo off
setlocal enabledelayedexpansion

echo.
echo ===================================================================
echo Sending Calendar Invites for Team Demonstration (July 3, 2024)
echo ===================================================================
echo.

REM Set variables for the meeting
set MEETING_DATE=July 3, 2024
set MEETING_TIME=10:00 AM - 12:00 PM EDT
set MEETING_LOCATION=Microsoft Teams
set MEETING_LINK=https://teams.microsoft.com/l/meetup-join/19%%3ameeting_YWUyNzA1ZjEtMjNkYy00NGYzLWI5N2QtNmQ3YTlkMDYxOGVj%%40thread.v2/0?context=%%7b%%22Tid%%22%%3a%%22a63bb243-42dd-4e98-bc43-f3d4dbc2cc79%%22%%2c%%22Oid%%22%%3a%%227682b90c-8b23-4912-a677-89d1150fbceb%%22%%7d

REM Create a template for the calendar invite
echo Creating calendar invite template...
echo Subject: Monitoring Test Resources Demonstration and Knowledge Transfer> calendar_invite_template.txt
echo Date: %MEETING_DATE%>> calendar_invite_template.txt
echo Time: %MEETING_TIME%>> calendar_invite_template.txt
echo Location: %MEETING_LOCATION%>> calendar_invite_template.txt
echo Teams Link: %MEETING_LINK%>> calendar_invite_template.txt
echo.>> calendar_invite_template.txt
echo Dear [PARTICIPANT_NAME],>> calendar_invite_template.txt
echo.>> calendar_invite_template.txt
echo Thank you for responding to our calendar poll. Based on the responses received, we have scheduled the Monitoring Test Resources Demonstration and Knowledge Transfer session for %MEETING_DATE% from %MEETING_TIME%.>> calendar_invite_template.txt
echo.>> calendar_invite_template.txt
echo The session will be held via Microsoft Teams. You can join using the link provided in this calendar invitation or by clicking on the meeting in your calendar.>> calendar_invite_template.txt
echo.>> calendar_invite_template.txt
echo Agenda:>> calendar_invite_template.txt
echo 1. Introduction and Project Overview (15 minutes)>> calendar_invite_template.txt
echo 2. Demonstration of Test Resources (60 minutes)>> calendar_invite_template.txt
echo    - Error Generation Tests>> calendar_invite_template.txt
echo    - Slow Response Tests>> calendar_invite_template.txt
echo    - Memory Usage Tests>> calendar_invite_template.txt
echo    - CPU Usage Tests>> calendar_invite_template.txt
echo    - Database Performance Tests>> calendar_invite_template.txt
echo 3. Hands-on Exercise (30 minutes)>> calendar_invite_template.txt
echo 4. Q&A and Next Steps (15 minutes)>> calendar_invite_template.txt
echo.>> calendar_invite_template.txt
echo Please review the following documentation before the session:>> calendar_invite_template.txt
echo - QUICK_REFERENCE.md>> calendar_invite_template.txt
echo - System Architecture Overview>> calendar_invite_template.txt
echo.>> calendar_invite_template.txt
echo If you have any questions or need to reschedule, please contact Sarah Johnson at sarah.johnson@example.com or (555) 123-4567.>> calendar_invite_template.txt
echo.>> calendar_invite_template.txt
echo We look forward to your participation!>> calendar_invite_template.txt
echo.>> calendar_invite_template.txt
echo Best regards,>> calendar_invite_template.txt
echo The Monitoring Test Resources Team>> calendar_invite_template.txt

echo.
echo Calendar invite template created successfully!
echo.

REM Create a list of participants
echo Creating participant list...
echo Required Participants:> participant_list.txt
echo John Davis,john.davis@example.com,Operations Team Lead>> participant_list.txt
echo Lisa Wang,lisa.wang@example.com,Monitoring Team Lead>> participant_list.txt
echo Miguel Rodriguez,miguel.rodriguez@example.com,Database Administrator>> participant_list.txt
echo David Chen,david.chen@example.com,DevOps Engineer>> participant_list.txt
echo Karen Johnson,karen.johnson@example.com,Project Manager>> participant_list.txt
echo Optional Participants:>> participant_list.txt
echo Robert Smith,robert.smith@example.com,Development Lead>> participant_list.txt
echo Angela Kim,angela.kim@example.com,QA Lead>> participant_list.txt
echo Thomas Wilson,thomas.wilson@example.com,CTO>> participant_list.txt
echo Jennifer Lee,jennifer.lee@example.com,UX/UI Designer>> participant_list.txt
echo Michael Brown,michael.brown@example.com,Security Officer>> participant_list.txt

echo.
echo Participant list created successfully!
echo.

REM Determine which participants are available on July 3
echo Creating available participants list for July 3...
echo Available Participants (July 3):> available_participants.txt
echo John Davis,john.davis@example.com,Operations Team Lead>> available_participants.txt
echo Lisa Wang,lisa.wang@example.com,Monitoring Team Lead>> available_participants.txt
echo Miguel Rodriguez,miguel.rodriguez@example.com,Database Administrator>> available_participants.txt
echo Karen Johnson,karen.johnson@example.com,Project Manager>> available_participants.txt
echo Robert Smith,robert.smith@example.com,Development Lead>> available_participants.txt
echo Angela Kim,angela.kim@example.com,QA Lead>> available_participants.txt

echo.
echo Available participants list created successfully!
echo.

REM Generate personalized calendar invite for each participant
echo Generating personalized calendar invites for all participants...
echo.

REM For demonstration purposes, we'll just create a sample for one participant
echo Creating sample personalized invite for John Davis...
copy calendar_invite_template.txt "John_Davis_Calendar_Invite.txt" > nul
powershell -Command "(Get-Content 'John_Davis_Calendar_Invite.txt') -replace '\[PARTICIPANT_NAME\]', 'John Davis' | Set-Content 'John_Davis_Calendar_Invite.txt'"

echo.
echo Sample personalized invite created for John Davis!
echo.

echo ===================================================================
echo Instructions for Sending Calendar Invites
echo ===================================================================
echo.
echo To send the calendar invites:
echo.
echo 1. Open your email client (Outlook, etc.)
echo 2. Create a new meeting invitation
echo 3. Set the date to %MEETING_DATE% and time to %MEETING_TIME%
echo 4. Set the location to %MEETING_LOCATION%
echo 5. Add the Teams meeting link: %MEETING_LINK%
echo 6. Add the following participants to the "To:" field:
echo    - Required: John Davis, Lisa Wang, Miguel Rodriguez, Karen Johnson
echo    - Optional: Robert Smith, Angela Kim
echo 7. Set the subject to "Monitoring Test Resources Demonstration and Knowledge Transfer"
echo 8. Copy the content from the calendar invite template into the body of the meeting invitation
echo 9. Replace [PARTICIPANT_NAME] with "Team" or remove it
echo 10. Send the meeting invitation
echo.

echo Note: In a real environment, this script would use Outlook automation or 
echo a calendar API to send the invites automatically. For this demonstration,
echo please follow the manual steps above.
echo.

echo ===================================================================
echo Calendar invite preparation completed!
echo ===================================================================
echo.
echo The following files have been created:
echo - calendar_invite_template.txt: Template for the calendar invite
echo - participant_list.txt: List of all participants
echo - available_participants.txt: List of participants available on July 3
echo - John_Davis_Calendar_Invite.txt: Sample personalized invite
echo.
echo Please use these files to assist with sending the calendar invites.
echo.

endlocal 