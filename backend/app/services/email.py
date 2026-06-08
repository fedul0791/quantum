import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from typing import List
import os

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending email notifications"""
    
    @staticmethod
    async def send_alert_notification(
        to_email: str,
        alert_type: str,
        symbol: str,
        condition: str,
        current_value: float,
        threshold: float
    ):
        """Send alert notification email"""
        try:
            smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
            smtp_user = os.getenv("SMTP_USER")
            smtp_password = os.getenv("SMTP_PASSWORD")
            
            if not smtp_user or not smtp_password:
                logger.warning("SMTP credentials not configured")
                return
            
            subject = f"🚨 {alert_type} Alert Triggered - {symbol}"
            
            html_body = f"""
            <html>
              <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #FF4757;">Alert Triggered</h2>
                  
                  <p>Your <strong>{alert_type}</strong> alert for <strong>{symbol}</strong> has been triggered.</p>
                  
                  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Alert Type:</strong> {alert_type}</p>
                    <p><strong>Symbol:</strong> {symbol}</p>
                    <p><strong>Condition:</strong> {condition}</p>
                    <p><strong>Current Value:</strong> {current_value:.6f}</p>
                    <p><strong>Threshold:</strong> {threshold:.6f}</p>
                  </div>
                  
                  <p>Log in to Quantum Flow Terminal to review this alert.</p>
                  
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="color: #999; font-size: 12px;">
                    This is an automated alert from Quantum Flow Terminal.
                  </p>
                </div>
              </body>
            </html>
            """
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = to_email
            
            msg.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
            logger.info(f"Alert email sent to {to_email}")
            
        except Exception as e:
            logger.error(f"Failed to send alert email: {e}")
    
    @staticmethod
    async def send_verification_email(to_email: str, verification_code: str):
        """Send email verification"""
        try:
            smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
            smtp_user = os.getenv("SMTP_USER")
            smtp_password = os.getenv("SMTP_PASSWORD")
            
            if not smtp_user or not smtp_password:
                logger.warning("SMTP credentials not configured")
                return
            
            subject = "Verify your Quantum Flow Terminal account"
            
            html_body = f"""
            <html>
              <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #00E5D4;">Verify Your Email</h2>
                  
                  <p>Thank you for signing up for Quantum Flow Terminal.</p>
                  
                  <p>Your verification code is:</p>
                  
                  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <code style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                      {verification_code}
                    </code>
                  </div>
                  
                  <p>This code expires in 24 hours.</p>
                  
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="color: #999; font-size: 12px;">
                    If you didn't sign up for this account, please ignore this email.
                  </p>
                </div>
              </body>
            </html>
            """
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = to_email
            
            msg.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
            logger.info(f"Verification email sent to {to_email}")
            
        except Exception as e:
            logger.error(f"Failed to send verification email: {e}")
