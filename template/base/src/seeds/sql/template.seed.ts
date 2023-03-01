import { Seed } from '@core/sql/seeder/seeder.dto';

const seed: Seed = {
  model: 'Template',
  action: 'once',
  data: [
    {
      name: 'forgot_password',
      title: 'Forgot Password',
      send_email: true,
      email_subject: 'Forgot Password',
      email_body:
        '<p>Hi ##TO_NAME##,</p><br><p>##OTP## is your OTP for reset password.</p><br><p>Thanks</p>',
      send_sms: true,
      sms_body: '##OTP## is your OTP for reset password',
    },
    {
      name: '2fa_otp',
      title: '2FA OTP Verification',
      send_email: true,
      email_subject: 'OTP Verification',
      email_body:
        '<p>Hi ##TO_NAME##,</p><br><p>##OTP## is your OTP.</p><br><p>Thanks</p>',
      send_sms: true,
      sms_body: '##OTP## is your OTP',
    },
  ],
};

export default seed;
