import { MailService } from '@sendgrid/mail';
import { ProfessionalNotification, InsertProfessionalNotification } from '@shared/schema';
import { db } from './db';
import { professionalNotifications } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { DatabaseStorage } from './storage/database-storage';

export class EmailService {
  private mailService: MailService | null = null;
  private storage: DatabaseStorage;
  
  constructor() {
    this.storage = new DatabaseStorage();
    
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
    
    if (!notification) {
      throw new Error('Failed to create notification');
    }
    
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

  async sendEmailVerification(
    userId: number,
    email: string,
    name: string,
    verificationToken: string,
    professionalId?: number
  ): Promise<boolean> {
    if (!this.mailService) {
      console.warn("SendGrid non configurato - email di verifica non inviata");
      return false;
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    const notificationData: InsertProfessionalNotification = {
      professionalId: professionalId || 0,
      notificationType: 'email_verification',
      recipientEmail: email,
      subject: 'Verifica il tuo indirizzo email - Wolfinder',
      content: `Ciao ${name}, clicca sul link per verificare il tuo account: ${verificationUrl}`,
      status: 'pending'
    };

    try {
      const notification = await this.logNotification(notificationData);

      const emailContent = this.generateEmailVerificationContent(name, verificationUrl);
      
      console.log('Tentativo invio email:', {
        to: email,
        from: 'info@wolfinder.it',
        subject: 'Verifica il tuo indirizzo email - Wolfinder'
      });
      
      const response = await this.mailService.send({
        to: email,
        from: 'info@wolfinder.it',
        subject: 'Verifica il tuo indirizzo email - Wolfinder',
        html: emailContent.html,
        text: emailContent.text
      });

      console.log('SendGrid response:', response[0]?.statusCode, response[0]?.headers);
      await this.updateNotificationStatus(notification.id, 'sent');
      return true;
    } catch (error) {
      console.error('Errore invio email verifica dettagliato:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        response: (error as any)?.response?.body
      });
      
      const notification = await this.logNotification(notificationData);
      await this.updateNotificationStatus(notification.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
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

  async sendPaymentSuccessNotification(
    professionalId: number,
    paymentData: {
      planName: string;
      amount: number;
      currency: string;
      invoiceUrl: string;
      periodEnd: Date;
    }
  ): Promise<boolean> {
    try {
      const professional = await this.storage.getProfessional(professionalId);
      if (!professional) {
        console.error(`Professional not found: ${professionalId}`);
        return false;
      }

      const { subject, html, text } = this.generatePaymentSuccessEmailContent(
        professional.businessName || 'Professionista',
        paymentData
      );

      const notificationData: InsertProfessionalNotification = {
        professionalId,
        notificationType: 'payment_success',
        recipientEmail: professional.email,
        subject,
        content: html,
        status: 'pending',
        metadata: {
          planName: paymentData.planName,
          amount: paymentData.amount,
          currency: paymentData.currency
        }
      };

      const notification = await this.logNotification(notificationData);

      if (this.mailService) {
        await this.mailService.send({
          to: professional.email,
          from: 'noreply@wolfinder.it',
          subject,
          html,
          text
        });

        await this.updateNotificationStatus(notification.id, 'sent');
        console.log(`Payment success notification sent to ${professional.email}`);
        return true;
      } else {
        await this.updateNotificationStatus(notification.id, 'failed', 'SendGrid API key not configured');
        console.log(`Payment success notification logged for ${professional.email} (email service not configured)`);
        return false;
      }
    } catch (error) {
      console.error('Error sending payment success notification:', error);
      return false;
    }
  }

  async sendPaymentFailedNotification(
    professionalId: number,
    failureData: {
      planName: string;
      amount: number;
      currency: string;
      gracePeriodEnd: Date;
      attemptCount: number;
      retryUrl: string;
    }
  ): Promise<boolean> {
    try {
      const professional = await this.storage.getProfessional(professionalId);
      if (!professional) {
        console.error(`Professional not found: ${professionalId}`);
        return false;
      }

      const { subject, html, text } = this.generatePaymentFailedEmailContent(
        professional.businessName || 'Professionista',
        failureData
      );

      const notificationData: InsertProfessionalNotification = {
        professionalId,
        notificationType: 'payment_failed',
        recipientEmail: professional.email,
        subject,
        content: html,
        status: 'pending',
        metadata: {
          planName: failureData.planName,
          amount: failureData.amount,
          currency: failureData.currency,
          attemptCount: failureData.attemptCount
        }
      };

      const notification = await this.logNotification(notificationData);

      if (this.mailService) {
        await this.mailService.send({
          to: professional.email,
          from: 'noreply@wolfinder.it',
          subject,
          html,
          text
        });

        await this.updateNotificationStatus(notification.id, 'sent');
        console.log(`Payment failed notification sent to ${professional.email}`);
        return true;
      } else {
        await this.updateNotificationStatus(notification.id, 'failed', 'SendGrid API key not configured');
        console.log(`Payment failed notification logged for ${professional.email} (email service not configured)`);
        return false;
      }
    } catch (error) {
      console.error('Error sending payment failed notification:', error);
      return false;
    }
  }

  private generatePaymentSuccessEmailContent(
    professionalName: string,
    paymentData: {
      planName: string;
      amount: number;
      currency: string;
      invoiceUrl: string;
      periodEnd: Date;
    }
  ): { subject: string; html: string; text: string } {
    const subject = `Pagamento confermato - Piano ${paymentData.planName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">✅ Pagamento Confermato</h2>
        </div>
        <div style="padding: 30px;">
          <p>Ciao ${professionalName},</p>
          <p>Il tuo pagamento è stato elaborato con successo!</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Dettagli Abbonamento</h3>
            <p><strong>Piano:</strong> ${paymentData.planName}</p>
            <p><strong>Importo:</strong> ${paymentData.amount} ${paymentData.currency}</p>
            <p><strong>Valido fino al:</strong> ${paymentData.periodEnd.toLocaleDateString('it-IT')}</p>
          </div>

          <p>Il tuo abbonamento è ora attivo e puoi accedere a tutte le funzionalità premium.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wolfinder.it/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Vai alla Dashboard
            </a>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${paymentData.invoiceUrl}" 
               style="color: #6b7280; text-decoration: none; font-size: 14px;">
              Scarica Fattura
            </a>
          </div>
        </div>
      </div>
    `;
    
    const text = `
      Pagamento Confermato - Piano ${paymentData.planName}
      
      Ciao ${professionalName},
      
      Il tuo pagamento è stato elaborato con successo!
      
      Piano: ${paymentData.planName}
      Importo: ${paymentData.amount} ${paymentData.currency}
      Valido fino al: ${paymentData.periodEnd.toLocaleDateString('it-IT')}
      
      Dashboard: https://wolfinder.it/dashboard
      Fattura: ${paymentData.invoiceUrl}
    `;
    
    return { subject, html, text };
  }

  private generatePaymentFailedEmailContent(
    professionalName: string,
    failureData: {
      planName: string;
      amount: number;
      currency: string;
      gracePeriodEnd: Date;
      attemptCount: number;
      retryUrl: string;
    }
  ): { subject: string; html: string; text: string } {
    const subject = `⚠️ Problema con il pagamento - Piano ${failureData.planName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">⚠️ Pagamento non riuscito</h2>
        </div>
        <div style="padding: 30px;">
          <p>Ciao ${professionalName},</p>
          <p>Non siamo riusciti a elaborare il pagamento per il tuo abbonamento.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">Dettagli</h3>
            <p><strong>Piano:</strong> ${failureData.planName}</p>
            <p><strong>Importo:</strong> ${failureData.amount} ${failureData.currency}</p>
            <p><strong>Tentativo:</strong> ${failureData.attemptCount}</p>
          </div>

          <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0284c7;">Periodo di Grazia</h3>
            <p>Il tuo abbonamento rimane attivo fino al <strong>${failureData.gracePeriodEnd.toLocaleDateString('it-IT')}</strong>.</p>
            <p>Aggiorna il tuo metodo di pagamento entro questa data per evitare interruzioni del servizio.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${failureData.retryUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Aggiorna Pagamento
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Se hai domande, contatta il nostro supporto: supporto@wolfinder.it
          </p>
        </div>
      </div>
    `;
    
    const text = `
      Problema con il pagamento - Piano ${failureData.planName}
      
      Ciao ${professionalName},
      
      Non siamo riusciti a elaborare il pagamento per il tuo abbonamento.
      
      Piano: ${failureData.planName}
      Importo: ${failureData.amount} ${failureData.currency}
      Tentativo: ${failureData.attemptCount}
      
      Periodo di Grazia fino al: ${failureData.gracePeriodEnd.toLocaleDateString('it-IT')}
      
      Aggiorna pagamento: ${failureData.retryUrl}
      
      Supporto: supporto@wolfinder.it
    `;
    
    return { subject, html, text };
  }

  private generateEmailVerificationContent(name: string, verificationUrl: string) {
    const htmlContent = `
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
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Wolfinder</h1>
              <p>Verifica il tuo indirizzo email</p>
            </div>
            
            <div class="content">
              <h2>Ciao ${name},</h2>
              
              <p>Benvenuto su Wolfinder! Per completare la registrazione e attivare il tuo account professionale, verifica il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">VERIFICA EMAIL</a>
              </div>
              
              <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
              <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;">
                ${verificationUrl}
              </p>
              
              <p><strong>Importante:</strong> Questo link è valido per 24 ore. Se non verifichi il tuo account entro questo periodo, dovrai registrarti nuovamente.</p>
              
              <p>Se non ti sei registrato su Wolfinder, ignora questa email.</p>
            </div>
            
            <div class="footer">
              <p>Wolfinder - La piattaforma di fiducia per professionisti in Italia</p>
              <p>Questa email è stata inviata automaticamente, non rispondere a questo indirizzo.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Wolfinder - Verifica il tuo indirizzo email

Ciao ${name},

Benvenuto su Wolfinder! Per completare la registrazione e attivare il tuo account professionale, verifica il tuo indirizzo email visitando questo link:

${verificationUrl}

Questo link è valido per 24 ore. Se non verifichi il tuo account entro questo periodo, dovrai registrarti nuovamente.

Se non ti sei registrato su Wolfinder, ignora questa email.

Wolfinder - La piattaforma di fiducia per professionisti in Italia
    `;

    return {
      html: htmlContent,
      text: textContent
    };
  }

  async sendVerificationEmail(data: { to: string; name: string; verificationToken: string }): Promise<boolean> {
    if (!this.mailService) {
      console.warn("SendGrid non configurato - email di verifica non inviata");
      return false;
    }

    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email/${data.verificationToken}`;
      
      const msg = {
        to: data.to,
        from: { 
          email: 'noreply@wolfinder.it',
          name: 'Wolfinder'
        },
        subject: 'Verifica il tuo account Wolfinder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">Wolfinder</h1>
              <p style="color: #64748b; margin: 0;">La piattaforma di fiducia per professionisti</p>
            </div>
            
            <h2 style="color: #1e293b;">Verifica il tuo account</h2>
            <p>Ciao ${data.name},</p>
            <p>Grazie per esserti registrato su Wolfinder! Per completare la registrazione e attivare il tuo account, clicca sul pulsante qui sotto:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Verifica Email
              </a>
            </div>
            
            <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
            <p style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 14px;">
              ${verificationUrl}
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
              <p style="margin: 0;"><strong>Importante:</strong> Questo link scadrà tra 24 ore per motivi di sicurezza.</p>
            </div>
            
            <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Il team Wolfinder<br>
              <a href="mailto:supporto@wolfinder.it" style="color: #2563eb;">supporto@wolfinder.it</a>
            </p>
          </div>
        `,
        text: `
Wolfinder - Verifica il tuo account

Ciao ${data.name},

Grazie per esserti registrato su Wolfinder! Per completare la registrazione, verifica il tuo indirizzo email visitando questo link:

${verificationUrl}

Questo link è valido per 24 ore. Se non verifichi il tuo account entro questo periodo, dovrai registrarti nuovamente.

Se non ti sei registrato su Wolfinder, ignora questa email.

Il team Wolfinder
supporto@wolfinder.it
        `
      };

      await this.mailService.send(msg);
      console.log(`Email di verifica inviata a ${data.to}`);
      return true;
    } catch (error) {
      console.error('Errore invio email verifica:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();