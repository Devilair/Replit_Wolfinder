import { MailService } from '@sendgrid/mail';
import { ProfessionalNotification, InsertProfessionalNotification } from '@shared/schema';
import { db } from './db';
import { professionalNotifications } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class EmailService {
  private mailService: MailService | null = null;
  
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY non configurato - le email non saranno inviate");
      return;
    }
    
    this.mailService = new MailService();
    this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
  }

  private async logNotification(notificationData: InsertProfessionalNotification): Promise<ProfessionalNotification> {
    const [notification] = await db
      .insert(professionalNotifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  private async updateNotificationStatus(
    notificationId: number, 
    status: 'sent' | 'failed', 
    failureReason?: string
  ): Promise<void> {
    await db
      .update(professionalNotifications)
      .set({
        status,
        sentAt: status === 'sent' ? new Date() : undefined,
        failureReason: failureReason || null,
      })
      .where(eq(professionalNotifications.id, notificationId));
  }

  async sendNewReviewNotification(
    professionalId: number,
    reviewId: number,
    recipientEmail: string,
    professionalName: string,
    reviewerName: string,
    rating: number
  ): Promise<boolean> {
    const subject = `Nuova recensione per ${professionalName} su Wolfinder`;
    const content = this.generateNewReviewEmailContent(
      professionalName, 
      reviewerName, 
      rating, 
      professionalId
    );

    // Log della notificazione nel database
    const notification = await this.logNotification({
      professionalId,
      reviewId,
      notificationType: 'new_review',
      recipientEmail,
      subject,
      content,
      status: 'pending',
    });

    if (!this.mailService) {
      console.log(`Email simulata inviata a ${recipientEmail}: ${subject}`);
      await this.updateNotificationStatus(notification.id, 'sent');
      return true;
    }

    try {
      await this.mailService.send({
        to: recipientEmail,
        from: 'noreply@wolfinder.com',
        subject,
        html: content,
      });

      await this.updateNotificationStatus(notification.id, 'sent');
      return true;
    } catch (error) {
      console.error('Errore invio email:', error);
      await this.updateNotificationStatus(
        notification.id, 
        'failed', 
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
      return false;
    }
  }

  async sendClaimReminderNotification(
    professionalId: number,
    recipientEmail: string,
    professionalName: string,
    claimToken: string
  ): Promise<boolean> {
    const subject = `Reclama il tuo profilo professionale su Wolfinder`;
    const content = this.generateClaimReminderEmailContent(
      professionalName, 
      claimToken, 
      professionalId
    );

    // Log della notificazione nel database
    const notification = await this.logNotification({
      professionalId,
      notificationType: 'claim_reminder',
      recipientEmail,
      subject,
      content,
      status: 'pending',
    });

    if (!this.mailService) {
      console.log(`Email simulata inviata a ${recipientEmail}: ${subject}`);
      await this.updateNotificationStatus(notification.id, 'sent');
      return true;
    }

    try {
      await this.mailService.send({
        to: recipientEmail,
        from: 'noreply@wolfinder.com',
        subject,
        html: content,
      });

      await this.updateNotificationStatus(notification.id, 'sent');
      return true;
    } catch (error) {
      console.error('Errore invio email:', error);
      await this.updateNotificationStatus(
        notification.id, 
        'failed', 
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
      return false;
    }
  }

  private generateNewReviewEmailContent(
    professionalName: string,
    reviewerName: string,
    rating: number,
    professionalId: number
  ): string {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://wolfinder.replit.app' 
      : 'http://localhost:5000';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .stars { color: #fbbf24; font-size: 20px; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Wolfinder</h1>
              <p>Nuova recensione ricevuta!</p>
            </div>
            
            <div class="content">
              <h2>Ciao ${professionalName},</h2>
              
              <p>Hai ricevuto una nuova recensione su Wolfinder!</p>
              
              <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Recensione di:</strong> ${reviewerName}</p>
                <p><strong>Valutazione:</strong> <span class="stars">${stars}</span> (${rating}/5)</p>
              </div>
              
              <p>Questa è un'ottima opportunità per:</p>
              <ul>
                <li>Rispondere alla recensione e mostrare professionalità</li>
                <li>Reclamare il tuo profilo per gestirlo direttamente</li>
                <li>Aumentare la tua visibilità online</li>
              </ul>
              
              <a href="${baseUrl}/professionista/${professionalId}" class="button">
                Visualizza Profilo
              </a>
              
              <a href="${baseUrl}/reclama-profilo/${professionalId}" class="button">
                Reclama Profilo
              </a>
              
              <p><strong>Perché reclamare il tuo profilo?</strong></p>
              <ul>
                <li>Gestisci direttamente le informazioni del tuo profilo</li>
                <li>Rispondi alle recensioni dei clienti</li>
                <li>Aumenta la credibilità del tuo business</li>
                <li>Accedi a statistiche dettagliate</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Questo profilo è stato creato dal team di Wolfinder per aiutarti a essere trovato dai clienti.</p>
              <p>Se non desideri più ricevere queste notifiche, puoi reclamare il profilo e gestire le preferenze.</p>
              <p>© 2024 Wolfinder - La piattaforma italiana per trovare professionisti affidabili</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateClaimReminderEmailContent(
    professionalName: string,
    claimToken: string,
    professionalId: number
  ): string {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://wolfinder.replit.app' 
      : 'http://localhost:5000';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .token { 
              background: white; 
              padding: 15px; 
              border-radius: 6px; 
              font-family: monospace; 
              font-size: 16px; 
              text-align: center;
              border: 2px dashed #2563eb;
            }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Wolfinder</h1>
              <p>Reclama il tuo profilo professionale</p>
            </div>
            
            <div class="content">
              <h2>Ciao ${professionalName},</h2>
              
              <p>Abbiamo creato un profilo per te su Wolfinder, la piattaforma italiana per trovare professionisti affidabili.</p>
              
              <p><strong>Perché reclamare il tuo profilo?</strong></p>
              <ul>
                <li>Controllo completo delle informazioni del profilo</li>
                <li>Possibilità di rispondere alle recensioni</li>
                <li>Accesso a statistiche e analytics</li>
                <li>Maggiore credibilità presso i clienti</li>
                <li>Gestione delle preferenze di notifica</li>
              </ul>
              
              <p>Puoi reclamare il tuo profilo in due modi:</p>
              
              <h3>Opzione 1: Link diretto</h3>
              <a href="${baseUrl}/reclama-profilo/${professionalId}?token=${claimToken}" class="button">
                Reclama Profilo Ora
              </a>
              
              <h3>Opzione 2: Codice di verifica</h3>
              <p>Inserisci questo codice nella pagina di reclamo profilo:</p>
              <div class="token">${claimToken}</div>
              
              <a href="${baseUrl}/reclama-profilo/${professionalId}" class="button">
                Vai alla Pagina di Reclamo
              </a>
              
              <p><strong>Il tuo profilo attuale include:</strong></p>
              <ul>
                <li>Informazioni di contatto verificate</li>
                <li>Categoria professionale</li>
                <li>Area di competenza geografica</li>
                <li>Sistema di recensioni clienti</li>
              </ul>
              
              <p><em>Nota: Questo link e codice scadranno tra 7 giorni per motivi di sicurezza.</em></p>
            </div>
            
            <div class="footer">
              <p>Se non sei ${professionalName} o hai ricevuto questa email per errore, puoi ignorarla.</p>
              <p>© 2024 Wolfinder - La piattaforma italiana per trovare professionisti affidabili</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();