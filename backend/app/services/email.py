import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from typing import Optional

from ..core import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    async def send_alert_notification(
        to_email: str,
        alert_name: str,
        symbol: str,
        condition: dict,
        value: float,
    ) -> bool:
        """Send alert notification via email"""
        
        if not settings.SMTP_SERVER or not settings.SMTP_USER:
            logger.warning("SMTP not configured, skipping email")
            return False
        
        try:
            subject = f"🚨 Alert Triggered: {alert_name}"
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background: #070B12; color: #F5F7FA;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #101826; border-radius: 12px; border: 1px solid rgba(0, 229, 212, 0.1);">
                        <h1 style="color: #00E5D4; margin-top: 0;">⚠️ Alert Triggered</h1>
                        
                        <div style="background: #1A2636; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Alert Name:</strong> {alert_name}</p>
                            <p><strong>Symbol:</strong> {symbol}</p>
                            <p><strong>Triggered Value:</strong> {value:.4f}</p>
                            <p><strong>Condition:</strong> {condition}</p>
                        </div>
                        
                        <p style="color: #8FA3B8;">
                            Visit your dashboard to take action: 
                            <a href="http://localhost:3000/alerts" style="color: #00E5D4; text-decoration: none;">View Alert</a>
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid rgba(0, 229, 212, 0.1); margin: 20px 0;">
                        
                        <p style="color: #5C728A; font-size: 12px;">
                            Quantum Flow Terminal | Market Intelligence Platform
                        </p>
                    </div>
                </body>
            </html>
            """
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = settings.SMTP_USER
            message["To"] = to_email
            
            message.attach(MIMEText(html_body, "html"))
            
            # Send email
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, [to_email], message.as_string())
            
            logger.info(f"Alert email sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send alert email: {e}")
            return False
    
    
    @staticmethod
    async def send_verification_email(
        to_email: str,
        verification_link: str,
    ) -> bool:
        """Send email verification link"""
        
        if not settings.SMTP_SERVER:
            logger.warning("SMTP not configured, skipping email")
            return False
        
        try:
            subject = "Verify Your Quantum Flow Terminal Email"
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background: #070B12; color: #F5F7FA;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #101826; border-radius: 12px; border: 1px solid rgba(0, 229, 212, 0.1);">
                        <h1 style="color: #00E5D4; margin-top: 0;">Welcome to Quantum Flow Terminal</h1>
                        
                        <p style="color: #8FA3B8;">
                            Please verify your email address to complete your registration.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{verification_link}" style="background: #00E5D4; color: #070B12; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                Verify Email
                            </a>
                        </div>
                        
                        <p style="color: #5C728A; font-size: 12px;">
                            Link expires in 24 hours.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = settings.SMTP_USER
            message["To"] = to_email
            
            message.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USER, [to_email], message.as_string())
            
            logger.info(f"Verification email sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email: {e}")
            return False
