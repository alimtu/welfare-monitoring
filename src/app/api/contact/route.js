import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('=== Email API Called ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Vercel:', process.env.VERCEL);

    const { fullName, email, phone, subject, message } = await request.json();

    // Validate required fields
    if (!fullName || !email || !subject || !message) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json({ error: 'لطفاً تمام فیلدهای الزامی را پر کنید' }, { status: 400 });
    }

    // Check environment variables with detailed logging
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    console.log('Environment variables check:', {
      hasEmailUser: !!emailUser,
      hasEmailPass: !!emailPass,
      emailUserLength: emailUser ? emailUser.length : 0,
      emailPassLength: emailPass ? emailPass.length : 0,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('EMAIL')),
    });

    if (!emailUser || !emailPass) {
      console.error('Missing environment variables:', {
        EMAIL_USER: !!emailUser,
        EMAIL_PASS: !!emailPass,
      });
      return NextResponse.json(
        { error: 'تنظیمات ایمیل ناقص است - متغیرهای محیطی یافت نشد' },
        { status: 500 }
      );
    }

    // Create transporter - Using Gmail SMTP
    console.log('Creating email transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Test transporter connection
    try {
      console.log('Testing transporter connection...');
      await transporter.verify();
      console.log('Transporter connection successful');
    } catch (verifyError) {
      console.error('Transporter verification failed:', {
        message: verifyError.message,
        code: verifyError.code,
        command: verifyError.command,
      });
      return NextResponse.json(
        { error: 'خطا در اتصال به سرور ایمیل - لطفاً تنظیمات را بررسی کنید' },
        { status: 500 }
      );
    }

    // Email content
    console.log('Preparing email content...');
    const mailOptions = {
      from: emailUser,
      to: 'admin@cuir.ac.ir',
      subject: `پیام جدید از وب‌سایت سامانه فرم ساز: ${subject}`,
      html: `
        <div style="font-family: 'Tahoma', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">پیام جدید از وب‌سایت دانشگاه انقلاب</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(90deg, #4f46e5, #7c3aed); margin: 10px auto; border-radius: 2px;"></div>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #4f46e5;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">اطلاعات فرستنده:</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 120px;">نام:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">ایمیل:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${email}</td>
                </tr>
                ${
                  phone
                    ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">تلفن:</td>
                  <td style="padding: 8px 0; color: #1e293b; direction: ltr;">${phone}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: bold;">موضوع:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${subject}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f1f5f9; padding: 25px; border-radius: 8px; border-right: 4px solid #10b981;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">متن پیام:</h2>
              <div style="background: white; padding: 20px; border-radius: 6px; color: #374151; line-height: 1.6; border: 1px solid #e2e8f0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                این پیام از طریق فرم تماس وب‌سایت دانشگاه انقلاب ارسال شده است
              </p>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">
                تاریخ ارسال: ${new Date().toLocaleDateString(
                  'fa-IR'
                )} - ${new Date().toLocaleTimeString('fa-IR')}
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
پیام جدید از وب‌سایت دانشگاه انقلاب

نام: ${fullName}
ایمیل: ${email}
${phone ? `تلفن: ${phone}` : ''}
موضوع: ${subject}

متن پیام:
${message}

---
تاریخ ارسال: ${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR')}
      `,
    };

    // Send email
    console.log('Sending email...');
    const emailResult = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: emailResult.messageId,
      accepted: emailResult.accepted,
      rejected: emailResult.rejected,
    });

    return NextResponse.json(
      {
        message: 'پیام شما با موفقیت ارسال شد',
        messageId: emailResult.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('=== Email Error Details ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    console.error('Error response:', error.response);
    console.error('Full error:', error);
    console.error('Stack trace:', error.stack);

    // Provide specific error messages based on error type
    let errorMessage = 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.';

    if (error.code === 'EAUTH') {
      errorMessage = 'خطا در احراز هویت ایمیل - رمز عبور اپلیکیشن Gmail نادرست است';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'خطا در اتصال به سرور Gmail';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'خطا در برقراری اتصال به سرور ایمیل';
    } else if (error.message.includes('Invalid login')) {
      errorMessage = 'نام کاربری یا رمز عبور ایمیل نادرست است';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
