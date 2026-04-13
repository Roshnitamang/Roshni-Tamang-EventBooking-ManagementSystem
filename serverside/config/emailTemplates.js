export const EMAIL_VERIFY_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Email Verify</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body { margin: 0; padding: 0; font-family: 'Open Sans', sans-serif; background: #E5E5E5; }
    table, td { border-collapse: collapse; }
    .container { width: 100%; max-width: 500px; margin: 70px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .main-content { padding: 48px 30px 40px; color: #000000; text-align: center; }
    .otp-code { font-size: 32px; font-weight: 700; color: #1f2937; letter-spacing: 4px; margin: 20px 0; display: block; }
    .button { background: #3B82F6; text-decoration: none; display: inline-block; padding: 12px 24px; color: #fff; font-size: 14px; text-align: center; font-weight: bold; border-radius: 6px; margin-top: 20px;}
    .footer { font-size: 12px; color: #6b7280; margin-top: 20px; }
  </style>
</head>
<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F3F4F6">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="main-content">
                  <h1 style="color: #3B82F6; margin: 0 0 20px;">Planora</h1>
                  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 10px;">Here's your one-time code</h2>
                  <p style="font-size: 14px; color: #4b5563; margin-bottom: 20px;">
                    For your security, this code can only be used once, and it expires after 24 hours.
                  </p>
                  
                  <span class="otp-code">{{otp}}</span>

                  <p style="font-size: 14px; color: #4b5563; margin-top: 30px;">
                    Or you can verify by clicking the button below:
                  </p>
                  <a href="{{url}}" class="button">Verify Email</a>

                  <div class="footer">
                    <p>This email was sent to {{email}}</p>
                    <p>If you didn't request this code, you can safely ignore this email.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`

export const PASSWORD_RESET_TEMPLATE = `

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #E5E5E5;
    }

    table, td {
      border-collapse: collapse;
    }

    .container {
      width: 100%;
      max-width: 500px;
      margin: 70px 0px;
      background-color: #ffffff;
    }

    .main-content {
      padding: 48px 30px 40px;
      color: #000000;
    }

    .button {
      width: 100%;
      background: #22D172;
      text-decoration: none;
      display: inline-block;
      padding: 10px 0;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-weight: bold;
      border-radius: 7px;
    }

    @media only screen and (max-width: 480px) {
      .container {
        width: 80% !important;
      }

      .button {
        width: 50% !important;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px; font-size: 18px; line-height: 150%; font-weight: bold;">
                          Forgot your password?
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          We received a password reset request for your account: <span style="color: #4C83EE;">{{email}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px; font-size: 14px; line-height: 150%; font-weight: 700;">
                          Use the OTP below to reset the password.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px;">
                          <p class="button" >{{otp}}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          The password reset otp is only valid for the next 15 minutes.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`

export const NEW_EVENT_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>New Event Alert</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body { margin: 0; padding: 0; font-family: 'Open Sans', sans-serif; background: #F3F4F6; }
    table, td { border-collapse: collapse; }
    .container { width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: #10b981; padding: 40px 30px; text-align: center; color: #ffffff; }
    .main-content { padding: 40px 30px; color: #1f2937; text-align: center; }
    .event-title { font-size: 28px; font-weight: 800; color: #10b981; margin: 0 0 16px; text-transform: uppercase; letter-spacing: -0.02em; }
    .event-info { font-size: 16px; color: #4b5563; margin-bottom: 24px; line-height: 1.6; }
    .event-details { background: #F9FAFB; border-radius: 16px; padding: 20px; margin-bottom: 30px; text-align: left; }
    .detail-item { margin-bottom: 12px; font-size: 14px; color: #374151; }
    .detail-label { font-weight: 700; color: #10b981; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; display: block; margin-bottom: 2px; }
    .button { background: #10b981; text-decoration: none !important; display: inline-block; padding: 16px 32px; color: #ffffff !important; font-size: 14px; text-align: center; font-weight: 800; border-radius: 12px; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
    .footer { font-size: 12px; color: #9ca3af; padding: 30px; text-align: center; background: #F9FAFB; }
  </style>
</head>
<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F3F4F6">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="header">
                   <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.05em;">PLANORA</h1>
                   <p style="margin: 10px 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.9;">New Event Discovery</p>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <p style="font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Exclusive Invitation</p>
                  <h2 class="event-title">{{eventTitle}}</h2>
                  <p class="event-info">
                    A new premium experience has just been listed in <strong>{{location}}</strong>. We thought you might be interested!
                  </p>
                  
                  <div class="event-details">
                    <div class="detail-item">
                      <span class="detail-label">Occurrence Date</span>
                      <span style="font-weight: 600; font-size: 16px;">{{date}}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Executive Summary</span>
                      <span style="font-style: italic;">{{summary}}</span>
                    </div>
                  </div>

                  <a href="{{url}}" class="button">Examine Details</a>

                  <p style="font-size: 13px; color: #9ca3af; margin-top: 40px;">
                    This discovery was matched based on your profile and geographical parameters.
                  </p>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p style="margin: 0 0 8px;">&copy; 2026 Planora Global Events Infrastructure</p>
                  <p style="margin: 0;">You received this because you are a registered member of Planora.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`

export const BOOKING_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Booking Confirmed</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body { margin: 0; padding: 0; font-family: 'Open Sans', sans-serif; background: #eaeff2; }
    .container { width: 100%; max-width: 600px; margin: 50px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
    .header { background: #059669; padding: 30px; text-align: center; color: #ffffff; }
    .content { padding: 40px; text-align: left; color: #334155; }
    .booking-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; }
    .label { color: #059669; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; }
    .value { font-size: 16px; font-weight: 600; margin-top: 4px; color: #1e293b; }
    .button { background: #059669; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; display: inline-block; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.05em; font-size: 13px; }
    .footer { padding: 25px; background: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Secure Booking Confirmed</h1>
    </div>
    <div class="content">
      <h2 style="font-size: 20px; margin-top: 0;">Reservation Successful!</h2>
      <p>Your spot for <strong>{{eventTitle}}</strong> has been securely initialized. Please present your digital ticket at the venue.</p>
      
      <div class="booking-card">
        <table width="100%">
          <tr>
            <td style="padding-bottom: 20px;">
              <div class="label">Event Identifier</div>
              <div class="value">{{eventTitle}}</div>
            </td>
          </tr>
          <tr>
            <td>
              <div class="label">Location Architecture</div>
              <div class="value">{{location}}</div>
            </td>
            <td>
              <div class="label">Scheduled Date</div>
              <div class="value">{{date}}</div>
            </td>
          </tr>
        </table>
      </div>

      <a href="{{url}}" class="button">Access My Tickets</a>
    </div>
    <div class="footer">
      <p>&copy; 2026 Planora Infrastructure. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const ORGANIZER_STATUS_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
    .header { background: #10B981; color: white; padding: 30px; text-align: center; }
    .body { padding: 30px; }
    .status { font-weight: bold; font-size: 18px; color: #10B981; text-transform: uppercase; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Planora Account Update</h1></div>
    <div class="body">
      <p>Hello,</p>
      <p>Your request to become an authorized organizer has been reviewed.</p>
      <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #10B981;">
        Status: <span class="status">{{status}}</span>
      </div>
      <p>{{message}}</p>
      <a href="{{url}}" style="display: inline-block; padding: 12px 25px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Access Dashboard</a>
    </div>
    <div class="footer">Planora - Event Management System</div>
  </div>
</body>
</html>
`;
