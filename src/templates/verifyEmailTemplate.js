module.exports = (username, verifyUrl) => `
<!DOCTYPE html>
<html lang="vi" >
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Xác minh email</title>
</head>
<body style="margin:0; padding:0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f9fafb; color:#374151;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding: 2rem 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:1.5rem; text-align:center; border-bottom:1px solid #e5e7eb;">
              <h1 style="margin:0; font-weight:700; font-size:1.5rem; color:#111827;">Quizify</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:1.5rem 2rem; font-size:1rem; line-height:1.5; color:#4b5563;">
              <p>Xin chào <strong style="color:#111827;">${username}</strong>,</p>
              <p style="margin-top:1rem;">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong>Quizify</strong>. Vui lòng xác minh email của bạn bằng cách nhấn nút bên dưới trong vòng <strong>5 phút</strong> để kích hoạt tài khoản:
              </p>
              <p style="text-align:center; margin:2rem 0;">
                <a href="${verifyUrl}" target="_blank" style="
                  background-color:#3b82f6; 
                  color:#fff; 
                  padding:0.75rem 1.5rem; 
                  border-radius:0.375rem; 
                  font-weight:600; 
                  text-decoration:none; 
                  display:inline-block;
                  box-shadow: 0 1px 3px rgba(59,130,246,0.5);
                  ">
                  Xác minh email
                </a>
              </p>
              <p>Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt của mình:</p>
              <p style="word-break:break-word; color:#3b82f6;">${verifyUrl}</p>
              <p style="margin-top:1.5rem;">
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
              </p>
              <p style="margin-top:2rem;">Trân trọng,<br /><strong>Đội ngũ Quizify</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding:1rem 1.5rem; font-size:0.75rem; color:#9ca3af; text-align:center; border-top:1px solid #e5e7eb;">
              &copy; ${new Date().getFullYear()} Quizify. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
